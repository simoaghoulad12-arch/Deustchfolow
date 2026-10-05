import { Injectable, NotFoundException } from '@nestjs/common';
import type { CEFRLevel, Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { DnaService } from '../dna/dna.service';
import { reviewCard } from './srs';

const vocabSelect = {
  id: true,
  word: true,
  translation: true,
  article: true,
  plural: true,
  pronunciation: true,
  category: true,
  level: true,
  exampleSentence: true,
  partOfSpeech: true,
} satisfies Prisma.VocabularySelect;

/**
 * Vocabulary system (spec section 23): a personal SM-2 deck per learner and
 * language. Mission key phrases flow in automatically; learners can add
 * words from the browser or introduce a batch of new words for their level.
 */
@Injectable()
export class VocabularyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly dna: DnaService,
  ) {}

  async overview(userId: string) {
    const lang = await this.context.activeLanguage(userId);
    const where = { userId, vocabulary: { languageCode: lang } };
    const now = new Date();
    const [total, mastered, due, categories, reviewedToday] = await Promise.all([
      this.prisma.client.userVocabulary.count({ where }),
      this.prisma.client.userVocabulary.count({ where: { ...where, status: 'MASTERED' } }),
      this.prisma.client.userVocabulary.count({ where: { ...where, nextReviewAt: { lte: now }, status: { not: 'MASTERED' } } }),
      this.prisma.client.vocabulary.groupBy({ by: ['category'], where: { languageCode: lang }, _count: true }),
      this.prisma.client.reviewLog.count({
        where: { userId, itemType: 'vocabulary', reviewedAt: { gte: new Date(now.getTime() - 86_400_000) } },
      }),
    ]);
    return {
      languageCode: lang,
      total,
      mastered,
      learning: total - mastered,
      due,
      reviewedToday,
      categories: categories
        .filter((c) => c.category)
        .map((c) => ({ name: c.category as string, count: c._count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  async due(userId: string, limit = 20) {
    const lang = await this.context.activeLanguage(userId);
    const cards = await this.prisma.client.userVocabulary.findMany({
      where: { userId, vocabulary: { languageCode: lang }, nextReviewAt: { lte: new Date() }, status: { not: 'MASTERED' } },
      orderBy: { nextReviewAt: 'asc' },
      take: Math.min(Math.max(limit, 1), 50),
      include: { vocabulary: { select: vocabSelect } },
    });
    return cards.map((c) => ({
      ...c.vocabulary,
      status: c.status,
      repetitions: c.repetitions,
      intervalDays: c.intervalDays,
      confidence: c.confidence,
    }));
  }

  /** Adds up to `count` new words at the learner's level that aren't in the deck yet. */
  async introduce(userId: string, count = 8, category?: string) {
    const lang = await this.context.activeLanguage(userId);
    const profile = await this.prisma.client.learningProfile.findUnique({ where: { userId }, select: { currentLevel: true } });
    const level = (profile?.currentLevel ?? 'A1') as CEFRLevel;
    const words = await this.prisma.client.vocabulary.findMany({
      where: { languageCode: lang, level, userEntries: { none: { userId } }, ...(category ? { category } : {}) },
      orderBy: [{ frequency: 'asc' }, { word: 'asc' }],
      take: Math.min(Math.max(count, 1), 20),
      select: { id: true },
    });
    const now = new Date();
    await this.prisma.client.userVocabulary.createMany({
      data: words.map((w) => ({ userId, vocabularyId: w.id, status: 'NEW' as const, nextReviewAt: now })),
      skipDuplicates: true,
    });
    return { added: words.length };
  }

  async add(userId: string, vocabularyId: string) {
    const lang = await this.context.activeLanguage(userId);
    const word = await this.prisma.client.vocabulary.findFirst({ where: { id: vocabularyId, languageCode: lang }, select: { id: true } });
    if (!word) throw new NotFoundException('Word not found.');
    await this.prisma.client.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      update: {},
      create: { userId, vocabularyId, status: 'NEW', nextReviewAt: new Date() },
    });
    return { added: true };
  }

  async review(userId: string, vocabularyId: string, grade: number) {
    const card = await this.prisma.client.userVocabulary.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      include: { vocabulary: { select: { languageCode: true } } },
    });
    if (!card) throw new NotFoundException('This word is not in your deck.');
    const next = reviewCard(card, grade);
    const correct = grade >= 3;
    await this.prisma.client.$transaction([
      this.prisma.client.userVocabulary.update({
        where: { userId_vocabularyId: { userId, vocabularyId } },
        data: {
          repetitions: next.repetitions,
          intervalDays: next.intervalDays,
          easeFactor: next.easeFactor,
          nextReviewAt: next.nextReviewAt,
          status: next.status,
          lastReviewedAt: new Date(),
          confidence: Math.round(grade),
          correctCount: correct ? { increment: 1 } : undefined,
          incorrectCount: correct ? undefined : { increment: 1 },
        },
      }),
      this.prisma.client.reviewLog.create({ data: { userId, itemType: 'vocabulary', itemId: vocabularyId, grade: Math.round(grade) } }),
    ]);
    const lang = card.vocabulary.languageCode;
    const reward = correct ? await this.gamification.rewardFor('review') : 0;
    const xp = await this.gamification.awardXp(userId, lang, 'review', reward, { refId: vocabularyId, checkAchievements: next.status === 'MASTERED' });
    await this.dna.observe(userId, lang, { VOCABULARY: correct ? 60 + grade * 8 : 25 });
    return { ...next, xpAwarded: reward, totalXp: xp.totalXp, newAchievements: xp.newAchievements };
  }

  async browse(userId: string, filters: { level?: CEFRLevel; category?: string; q?: string; page?: number }) {
    const lang = await this.context.activeLanguage(userId);
    const pageSize = 30;
    const page = Math.max(1, filters.page ?? 1);
    const where: Prisma.VocabularyWhereInput = {
      languageCode: lang,
      ...(filters.level ? { level: filters.level } : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.q
        ? { OR: [{ word: { contains: filters.q, mode: 'insensitive' } }, { translation: { contains: filters.q, mode: 'insensitive' } }] }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.client.vocabulary.count({ where }),
      this.prisma.client.vocabulary.findMany({
        where,
        orderBy: [{ level: 'asc' }, { word: 'asc' }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { ...vocabSelect, userEntries: { where: { userId }, select: { status: true, nextReviewAt: true } } },
      }),
    ]);
    return {
      total,
      page,
      pageSize,
      items: rows.map(({ userEntries, ...v }) => ({ ...v, inDeck: userEntries.length > 0, status: userEntries[0]?.status ?? null })),
    };
  }
}
