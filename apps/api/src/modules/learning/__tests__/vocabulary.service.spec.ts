import { NotFoundException } from '@nestjs/common';
import { DUE_QUEUE_LIMIT, NEW_WORDS_PER_SESSION, VocabularyService } from '../vocabulary/vocabulary.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

const NOW = new Date('2026-10-05T10:00:00.000Z');

function buildPrismaMock() {
  return {
    client: {
      vocabulary: {
        create: jest.fn().mockResolvedValue({ id: 'vocab-1' }),
        findUnique: jest.fn().mockResolvedValue({ id: 'vocab-1', translation: 'house' }),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      userVocabulary: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        groupBy: jest.fn().mockResolvedValue([]),
      },
      learningProfile: { findUnique: jest.fn().mockResolvedValue({ currentLevel: 'A1' }) },
    },
  } as unknown as PrismaService;
}

const card = (id: string) => ({ id, word: id, level: 'A1', partOfSpeech: null, exampleSentence: null });

describe('VocabularyService', () => {
  it('can save a vocabulary word', async () => {
    const prisma = buildPrismaMock();
    const service = new VocabularyService(prisma);

    await service.createWord({ word: 'das Haus', translation: 'house', level: 'A1' });

    expect(prisma.client.vocabulary.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ word: 'das Haus', normalizedWord: 'das haus', level: 'A1' }),
      }),
    );
  });

  describe('getDueCards', () => {
    it("only queries the caller's own, actually due entries in one bounded query", async () => {
      const prisma = buildPrismaMock();
      const service = new VocabularyService(prisma);

      await service.getDueCards('user-1', NOW);

      expect(prisma.client.userVocabulary.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.client.userVocabulary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', OR: [{ nextReviewAt: { lte: NOW } }, { nextReviewAt: null }] },
          take: DUE_QUEUE_LIMIT,
        }),
      );
    });

    it("tops up with unseen words of the learner's level, never the translation", async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userVocabulary.findMany as jest.Mock).mockResolvedValue([
        { status: 'LEARNING', vocabulary: card('v-due') },
      ]);
      (prisma.client.vocabulary.findMany as jest.Mock).mockResolvedValue([card('v-new')]);
      const service = new VocabularyService(prisma);

      const cards = await service.getDueCards('user-1', NOW);

      expect(prisma.client.vocabulary.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { level: 'A1', userEntries: { none: { userId: 'user-1' } } },
          take: NEW_WORDS_PER_SESSION,
        }),
      );
      expect(cards.map((c) => [c.id, c.status])).toEqual([
        ['v-due', 'LEARNING'],
        ['v-new', 'NEW'],
      ]);
      expect(cards.every((c) => !('translation' in c))).toBe(true);
    });

    it('skips new words when the due queue is already full', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userVocabulary.findMany as jest.Mock).mockResolvedValue(
        Array.from({ length: DUE_QUEUE_LIMIT }, (_, i) => ({ status: 'LEARNING', vocabulary: card(`v-${i}`) })),
      );
      const service = new VocabularyService(prisma);

      await service.getDueCards('user-1', NOW);

      expect(prisma.client.vocabulary.findMany).not.toHaveBeenCalled();
    });
  });

  describe('review', () => {
    it("grades server-side and writes only the caller's own entry", async () => {
      const prisma = buildPrismaMock();
      const service = new VocabularyService(prisma);

      const result = await service.review('user-1', 'vocab-1', ' House ', NOW);

      expect(result).toEqual(
        expect.objectContaining({ isCorrect: true, correctTranslation: 'house', status: 'LEARNING', intervalDays: 1 }),
      );
      expect(prisma.client.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_vocabularyId: { userId: 'user-1', vocabularyId: 'vocab-1' } },
          create: expect.objectContaining({ userId: 'user-1', correctCount: 1, incorrectCount: 0 }),
        }),
      );
    });

    it('advances the Leitner stage from the stored intervalDays', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userVocabulary.findUnique as jest.Mock).mockResolvedValue({
        status: 'LEARNING',
        intervalDays: 14,
        correctCount: 4,
        incorrectCount: 1,
      });
      const service = new VocabularyService(prisma);

      await service.review('user-1', 'vocab-1', 'house', NOW);

      expect(prisma.client.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ status: 'MASTERED', intervalDays: 30, correctCount: 5, incorrectCount: 1 }),
        }),
      );
    });

    it('resets the stage on a wrong answer', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userVocabulary.findUnique as jest.Mock).mockResolvedValue({
        status: 'MASTERED',
        intervalDays: 60,
        correctCount: 8,
        incorrectCount: 0,
      });
      const service = new VocabularyService(prisma);

      const result = await service.review('user-1', 'vocab-1', 'home', NOW);

      expect(result.isCorrect).toBe(false);
      expect(prisma.client.userVocabulary.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({ status: 'LEARNING', intervalDays: 1, incorrectCount: 1 }),
        }),
      );
    });

    it('404s for an unknown word without writing anything', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.vocabulary.findUnique as jest.Mock).mockResolvedValue(null);
      const service = new VocabularyService(prisma);

      await expect(service.review('user-1', 'missing', 'x', NOW)).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.client.userVocabulary.upsert).not.toHaveBeenCalled();
    });
  });

  it('list caps the page size and filters by level', async () => {
    const prisma = buildPrismaMock();
    const service = new VocabularyService(prisma);

    await service.list({ level: 'A1' });

    expect(prisma.client.vocabulary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { level: 'A1' }, take: 50, skip: 0 }),
    );
  });

  it('summary counts only the caller and sizes the next session', async () => {
    const prisma = buildPrismaMock();
    (prisma.client.userVocabulary.count as jest.Mock).mockResolvedValue(3);
    (prisma.client.userVocabulary.groupBy as jest.Mock).mockResolvedValue([
      { status: 'LEARNING', _count: { _all: 4 } },
      { status: 'MASTERED', _count: { _all: 2 } },
    ]);
    (prisma.client.vocabulary.count as jest.Mock).mockResolvedValue(5);
    const service = new VocabularyService(prisma);

    const summary = await service.getSummary('user-1', NOW);

    expect(prisma.client.userVocabulary.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
    expect(summary).toEqual({ dueCount: 3, newAvailable: 5, sessionSize: 8, learningCount: 4, masteredCount: 2 });
  });
});
