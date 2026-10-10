import { Injectable } from '@nestjs/common';
import { NATIVE_LANGUAGES, type CEFRLevel, type MistakeCategory } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { LearnerContextPayload } from '../../ai/providers/mock/contracts';

export const DEFAULT_TARGET_LANGUAGE = 'de';

/**
 * AI CONTEXT (spec section 35): every AI interaction gets level, target
 * and native language, goals, adaptive difficulty, known vocabulary, weak
 * grammar, recent mistakes and Language DNA — assembled from a handful of
 * small indexed queries, never a full user data dump.
 */
@Injectable()
export class ImmersionContextService {
  constructor(private readonly prisma: PrismaService) {}

  async activeLanguage(userId: string): Promise<string> {
    const profile = await this.prisma.client.learningProfile.findUnique({
      where: { userId },
      select: { targetLanguageCode: true },
    });
    return profile?.targetLanguageCode ?? DEFAULT_TARGET_LANGUAGE;
  }

  async learner(userId: string, languageCode?: string): Promise<LearnerContextPayload> {
    const db = this.prisma.client;
    const profile = await db.learningProfile.findUnique({ where: { userId } });
    const lang = languageCode ?? profile?.targetLanguageCode ?? DEFAULT_TARGET_LANGUAGE;

    const [language, stats, vocab, weakTopics, mistakes, dna] = await Promise.all([
      db.language.findUnique({ where: { code: lang }, select: { code: true, name: true } }),
      db.learnerStats.findUnique({ where: { userId_languageCode: { userId, languageCode: lang } } }),
      db.userVocabulary.findMany({
        where: { userId, status: { in: ['LEARNING', 'MASTERED'] }, vocabulary: { languageCode: lang } },
        orderBy: { updatedAt: 'desc' },
        take: 30,
        select: { vocabulary: { select: { word: true } } },
      }),
      db.grammarProgress.findMany({
        where: { userId, mastery: { lt: 60 }, attempts: { gt: 0 }, topic: { languageCode: lang } },
        orderBy: { mastery: 'asc' },
        take: 4,
        select: { topic: { select: { title: true } } },
      }),
      db.mistake.findMany({
        where: { userId, languageCode: lang, masteryState: { not: 'MASTERED' } },
        orderBy: [{ frequency: 'desc' }, { lastSeenAt: 'desc' }],
        take: 5,
        select: { original: true, corrected: true, category: true },
      }),
      db.dnaScore.findMany({ where: { userId, languageCode: lang }, select: { dimension: true, score: true } }),
    ]);

    const nativeCode = profile?.nativeLanguage ?? 'en';
    const native = NATIVE_LANGUAGES.find((l) => l.code === nativeCode);

    return {
      level: (profile?.currentLevel ?? 'A1') as CEFRLevel,
      targetLanguage: { code: lang, name: language?.name ?? lang },
      nativeLanguage: { code: nativeCode, name: native?.name ?? nativeCode },
      goals: profile?.goals ?? [],
      personalGoal: profile?.personalGoal ?? null,
      difficulty: Math.round((stats?.difficulty ?? 3) * 10) / 10,
      knownVocabulary: vocab.map((v) => v.vocabulary.word),
      weakGrammar: weakTopics.map((t) => t.topic.title),
      recentMistakes: mistakes.map((m) => ({
        original: m.original,
        corrected: m.corrected,
        category: m.category as MistakeCategory,
      })),
      dna: Object.fromEntries(dna.map((d) => [d.dimension, Math.round(d.score)])),
    };
  }
}
