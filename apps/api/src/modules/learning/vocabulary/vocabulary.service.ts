import { Injectable } from '@nestjs/common';
import { VocabularyStatus, type CEFRLevel } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';

/**
 * Data layer only — no spaced-repetition algorithm here (see spec section
 * 11 / architecture decision record: the review scheduler is a later,
 * separate service). No HTTP endpoints exposed yet either (spec section
 * 17 does not list a vocabulary API); this service exists so the data
 * model is exercised and testable.
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

  /** Always scoped to the caller's own userId — never a client-supplied one. */
  async recordReview(userId: string, vocabularyId: string, wasCorrect: boolean) {
    const existing = await this.prisma.client.userVocabulary.findUnique({
      where: { userId_vocabularyId: { userId, vocabularyId } },
    });

    const correctCount = (existing?.correctCount ?? 0) + (wasCorrect ? 1 : 0);
    const incorrectCount = (existing?.incorrectCount ?? 0) + (wasCorrect ? 0 : 1);
    const status = wasCorrect && correctCount >= 3 ? VocabularyStatus.MASTERED : VocabularyStatus.LEARNING;

    return this.prisma.client.userVocabulary.upsert({
      where: { userId_vocabularyId: { userId, vocabularyId } },
      create: { userId, vocabularyId, status, correctCount, incorrectCount, lastReviewedAt: new Date() },
      update: { status, correctCount, incorrectCount, lastReviewedAt: new Date() },
    });
  }

  /** Ownership is structural: the query is always filtered by userId. */
  async getUserVocabulary(userId: string) {
    return this.prisma.client.userVocabulary.findMany({
      where: { userId },
      include: { vocabulary: true },
    });
  }
}
