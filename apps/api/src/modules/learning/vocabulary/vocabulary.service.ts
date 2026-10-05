import { Injectable, NotFoundException } from '@nestjs/common';
import { VocabularyStatus, type CEFRLevel } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { isTranslationCorrect, scheduleReview } from './spaced-repetition';

/** Upper bound for one training session's queue. */
export const DUE_QUEUE_LIMIT = 20;
/** At most this many never-seen words are introduced per session. */
export const NEW_WORDS_PER_SESSION = 10;
/**
 * This trainer is German-only. The vocabulary table also holds the
 * immersion platform's en/es/fr/it words, so every query is scoped.
 */
export const TRAINER_LANGUAGE = 'de';

const CARD_SELECT = {
  id: true,
  word: true,
  level: true,
  partOfSpeech: true,
  exampleSentence: true,
} as const;

/**
 * Vocabulary training (see
 * docs/architecture-decisions/phase-4-vocabulary-training-plan.md). Every
 * per-user method takes the caller's own userId from `@CurrentUser()` —
 * there is no route that accepts a userId. Grading and scheduling are
 * pure functions in `spaced-repetition.ts`; this service only reads and
 * writes.
 */
@Injectable()
export class VocabularyService {
  constructor(private readonly prisma: PrismaService) {}

  async createWord(input: {
    word: string;
    translation: string;
    level: CEFRLevel;
    partOfSpeech?: string;
    exampleSentence?: string;
  }) {
    return this.prisma.client.vocabulary.create({
      data: {
        word: input.word,
        normalizedWord: input.word.trim().toLowerCase(),
        translation: input.translation,
        level: input.level,
        partOfSpeech: input.partOfSpeech,
        exampleSentence: input.exampleSentence,
      },
    });
  }

  /**
   * The session queue: words already in training whose review is due,
   * topped up with not-yet-seen words of the learner's current level.
   * Cards never carry the translation — it is only revealed after an
   * answer has been graded.
   */
  async getDueCards(userId: string, now = new Date()) {
    const due = await this.prisma.client.userVocabulary.findMany({
      where: {
        userId,
        vocabulary: { languageCode: TRAINER_LANGUAGE },
        OR: [{ nextReviewAt: { lte: now } }, { nextReviewAt: null }],
      },
      select: { status: true, vocabulary: { select: CARD_SELECT } },
      orderBy: { nextReviewAt: { sort: 'asc', nulls: 'first' } },
      take: DUE_QUEUE_LIMIT,
    });

    const cards = due.map((entry) => ({ ...entry.vocabulary, status: entry.status }));

    const newSlots = Math.min(NEW_WORDS_PER_SESSION, DUE_QUEUE_LIMIT - cards.length);
    if (newSlots > 0) {
      const level = await this.getCurrentLevel(userId);
      const fresh = await this.prisma.client.vocabulary.findMany({
        where: {
          languageCode: TRAINER_LANGUAGE,
          ...(level ? { level } : {}),
          userEntries: { none: { userId } },
        },
        select: CARD_SELECT,
        orderBy: [{ level: 'asc' }, { createdAt: 'asc' }],
        take: newSlots,
      });
      cards.push(...fresh.map((word) => ({ ...word, status: VocabularyStatus.NEW })));
    }

    return cards;
  }

  /** Grades a typed translation server-side and reschedules the word. */
  async review(userId: string, vocabularyId: string, answer: string, now = new Date()) {
    const vocabulary = await this.prisma.client.vocabulary.findUnique({
      where: { id: vocabularyId },
      select: { id: true, translation: true },
    });
    if (!vocabulary) throw new NotFoundException('Vocabulary not found.');

    const existing = await this.prisma.client.userVocabulary.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
    });

    const isCorrect = isTranslationCorrect(vocabulary.translation, answer);
    const schedule = scheduleReview(
      existing
        ? {
            status: existing.status,
            intervalDays: existing.intervalDays,
            correctCount: existing.correctCount,
          }
        : null,
      isCorrect,
      now,
    );

    const data = {
      ...schedule,
      correctCount: (existing?.correctCount ?? 0) + (isCorrect ? 1 : 0),
      incorrectCount: (existing?.incorrectCount ?? 0) + (isCorrect ? 0 : 1),
      lastReviewedAt: now,
    };

    await this.prisma.client.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      create: { userId, vocabularyId, ...data },
      update: data,
    });

    return {
      isCorrect,
      correctTranslation: vocabulary.translation,
      status: schedule.status,
      intervalDays: schedule.intervalDays,
      nextReviewAt: schedule.nextReviewAt,
    };
  }

  /** Read-only word list, offset-paginated and capped at 100 per page. */
  async list(query: { level?: CEFRLevel; search?: string; skip?: number; take?: number }) {
    const search = query.search?.trim();
    const where = {
      languageCode: TRAINER_LANGUAGE,
      ...(query.level ? { level: query.level } : {}),
      ...(search
        ? {
            OR: [
              { word: { contains: search, mode: 'insensitive' as const } },
              { translation: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.client.vocabulary.findMany({
        where,
        select: { ...CARD_SELECT, translation: true },
        orderBy: [{ level: 'asc' }, { normalizedWord: 'asc' }],
        skip: query.skip ?? 0,
        take: query.take ?? 50,
      }),
      this.prisma.client.vocabulary.count({ where }),
    ]);

    return { items, total };
  }

  /** Dashboard counters — all scoped to the caller. */
  async getSummary(userId: string, now = new Date()) {
    const level = await this.getCurrentLevel(userId);
    const [dueCount, byStatus, newAvailable] = await Promise.all([
      this.prisma.client.userVocabulary.count({
        where: {
          userId,
          vocabulary: { languageCode: TRAINER_LANGUAGE },
          OR: [{ nextReviewAt: { lte: now } }, { nextReviewAt: null }],
        },
      }),
      this.prisma.client.userVocabulary.groupBy({
        by: ['status'],
        where: { userId, vocabulary: { languageCode: TRAINER_LANGUAGE } },
        _count: { _all: true },
      }),
      this.prisma.client.vocabulary.count({
        where: {
          languageCode: TRAINER_LANGUAGE,
          ...(level ? { level } : {}),
          userEntries: { none: { userId } },
        },
      }),
    ]);

    const countFor = (status: VocabularyStatus) =>
      byStatus.find((row) => row.status === status)?._count._all ?? 0;

    return {
      dueCount,
      newAvailable,
      sessionSize: Math.min(
        DUE_QUEUE_LIMIT,
        dueCount + Math.min(NEW_WORDS_PER_SESSION, newAvailable),
      ),
      learningCount: countFor(VocabularyStatus.NEW) + countFor(VocabularyStatus.LEARNING),
      masteredCount: countFor(VocabularyStatus.MASTERED),
    };
  }

  private async getCurrentLevel(userId: string): Promise<CEFRLevel | null> {
    const profile = await this.prisma.client.learningProfile.findUnique({
      where: { userId },
      select: { currentLevel: true },
    });
    return profile?.currentLevel ?? null;
  }
}
