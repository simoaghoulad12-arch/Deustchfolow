import { ProgressService } from '../progress/progress.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

function buildPrismaMock() {
  return {
    client: {
      lessonProgress: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      exercise: { findMany: jest.fn().mockResolvedValue([]) },
      exerciseAttempt: {
        findMany: jest.fn().mockResolvedValue([]),
        aggregate: jest.fn().mockResolvedValue({ _sum: { timeSpentMs: 0 } }),
      },
      userSkillProgress: {
        findUnique: jest.fn().mockResolvedValue(null),
        upsert: jest.fn().mockResolvedValue({}),
        findMany: jest.fn().mockResolvedValue([]),
      },
      learningProfile: { findUnique: jest.fn().mockResolvedValue(null) },
      lesson: { findFirst: jest.fn().mockResolvedValue(null) },
    },
  } as unknown as PrismaService;
}

describe('ProgressService', () => {
  describe('recalculateLessonProgress', () => {
    it('computes the percentage from correctly-answered exercises', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.exercise.findMany as jest.Mock).mockResolvedValue([
        { id: 'ex-1' },
        { id: 'ex-2' },
        { id: 'ex-3' },
        { id: 'ex-4' },
      ]);
      (prisma.client.exerciseAttempt.findMany as jest.Mock).mockResolvedValue([
        { exerciseId: 'ex-1' },
      ]);
      const service = new ProgressService(prisma);

      await service.recalculateLessonProgress('user-1', 'lesson-1');

      expect(prisma.client.lessonProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_lessonId: { userId: 'user-1', lessonId: 'lesson-1' } },
          update: expect.objectContaining({ status: 'IN_PROGRESS', progress: 25 }),
        }),
      );
    });

    it('marks the lesson COMPLETED with a completedAt once all exercises are answered correctly', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.exercise.findMany as jest.Mock).mockResolvedValue([{ id: 'ex-1' }]);
      (prisma.client.exerciseAttempt.findMany as jest.Mock).mockResolvedValue([
        { exerciseId: 'ex-1' },
      ]);
      const service = new ProgressService(prisma);

      await service.recalculateLessonProgress('user-1', 'lesson-1');

      const call = (prisma.client.lessonProgress.upsert as jest.Mock).mock.calls[0][0];
      expect(call.update.status).toBe('COMPLETED');
      expect(call.update.progress).toBe(100);
      expect(call.update.completedAt).toBeInstanceOf(Date);
    });

    it('does nothing for a lesson with no exercises', async () => {
      const prisma = buildPrismaMock();
      const service = new ProgressService(prisma);

      await service.recalculateLessonProgress('user-1', 'lesson-empty');

      expect(prisma.client.lessonProgress.upsert).not.toHaveBeenCalled();
    });
  });

  describe('recordSkillAttempt', () => {
    it('increases the score on a correct answer, clamped at 100', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userSkillProgress.findUnique as jest.Mock).mockResolvedValue({ score: 99 });
      const service = new ProgressService(prisma);

      await service.recordSkillAttempt('user-1', 'SPEAKING', true);

      expect(prisma.client.userSkillProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { score: 100 } }),
      );
    });

    it('decreases the score on an incorrect answer, clamped at 0', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.userSkillProgress.findUnique as jest.Mock).mockResolvedValue({ score: 0 });
      const service = new ProgressService(prisma);

      await service.recordSkillAttempt('user-1', 'SPEAKING', false);

      expect(prisma.client.userSkillProgress.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: { score: 0 } }),
      );
    });
  });

  describe('markLessonVisited', () => {
    it('creates a new IN_PROGRESS row on first visit', async () => {
      const prisma = buildPrismaMock();
      const service = new ProgressService(prisma);

      await service.markLessonVisited('user-1', 'lesson-1');

      expect(prisma.client.lessonProgress.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'IN_PROGRESS' }) }),
      );
    });

    it('never downgrades a COMPLETED lesson back to IN_PROGRESS', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.lessonProgress.findUnique as jest.Mock).mockResolvedValue({ status: 'COMPLETED' });
      const service = new ProgressService(prisma);

      await service.markLessonVisited('user-1', 'lesson-1');

      expect(prisma.client.lessonProgress.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ status: 'COMPLETED' }) }),
      );
    });
  });

  describe('getUserProgressSummary', () => {
    it('scopes every query to the given userId', async () => {
      const prisma = buildPrismaMock();
      const service = new ProgressService(prisma);

      await service.getUserProgressSummary('user-1');

      expect(prisma.client.lessonProgress.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
      expect(prisma.client.userSkillProgress.findMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
      expect(prisma.client.exerciseAttempt.aggregate).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 'user-1' } }),
      );
    });
  });
});
