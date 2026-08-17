import { VocabularyService } from '../vocabulary/vocabulary.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

function buildPrismaMock() {
  return {
    client: {
      vocabulary: { create: jest.fn().mockResolvedValue({ id: 'vocab-1' }) },
      userVocabulary: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
    },
  } as unknown as PrismaService;
}

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

  it("records a review scoped to the caller's own userId (ownership)", async () => {
    const prisma = buildPrismaMock();
    const service = new VocabularyService(prisma);

    await service.recordReview('user-1', 'vocab-1', true);

    expect(prisma.client.userVocabulary.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_vocabularyId: { userId: 'user-1', vocabularyId: 'vocab-1' } },
      }),
    );
  });

  it('only ever lists vocabulary belonging to the given userId', async () => {
    const prisma = buildPrismaMock();
    const service = new VocabularyService(prisma);

    await service.getUserVocabulary('user-1');

    expect(prisma.client.userVocabulary.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } }),
    );
  });

  it('marks a word MASTERED after enough correct reviews', async () => {
    const prisma = buildPrismaMock();
    (prisma.client.userVocabulary.findUnique as jest.Mock).mockResolvedValue({
      correctCount: 2,
      incorrectCount: 0,
    });
    const service = new VocabularyService(prisma);

    await service.recordReview('user-1', 'vocab-1', true);

    expect(prisma.client.userVocabulary.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ update: expect.objectContaining({ status: 'MASTERED', correctCount: 3 }) }),
    );
  });
});
