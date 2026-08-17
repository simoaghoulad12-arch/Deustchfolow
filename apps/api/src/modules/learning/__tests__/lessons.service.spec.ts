import { NotFoundException } from '@nestjs/common';
import { LessonsService } from '../lessons/lessons.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import type { ProgressService } from '../progress/progress.service';

function buildPrismaMock(lesson: unknown) {
  return {
    client: {
      lesson: { findUnique: jest.fn().mockResolvedValue(lesson) },
      lessonProgress: { findUnique: jest.fn().mockResolvedValue({ status: 'IN_PROGRESS', progress: 0 }) },
    },
  } as unknown as PrismaService;
}

function buildProgressServiceMock() {
  return { markLessonVisited: jest.fn().mockResolvedValue(undefined) } as unknown as ProgressService;
}

describe('LessonsService', () => {
  it('loads a lesson with its breadcrumb and progress', async () => {
    const prisma = buildPrismaMock({ id: 'lesson-1', slug: 'sich-vorstellen', prerequisites: [] });
    const progressService = buildProgressServiceMock();
    const service = new LessonsService(prisma, progressService);

    const lesson = await service.findBySlug('sich-vorstellen', 'user-1');

    expect(lesson.slug).toBe('sich-vorstellen');
    expect(lesson.progress).toEqual({ status: 'IN_PROGRESS', progress: 0 });
  });

  it('marks the lesson visited for the current user, not a client-supplied id', async () => {
    const prisma = buildPrismaMock({ id: 'lesson-1', slug: 'sich-vorstellen', prerequisites: [] });
    const progressService = buildProgressServiceMock();
    const service = new LessonsService(prisma, progressService);

    await service.findBySlug('sich-vorstellen', 'user-42');

    expect(progressService.markLessonVisited).toHaveBeenCalledWith('user-42', 'lesson-1');
  });

  it('throws NotFoundException for an unknown lesson', async () => {
    const prisma = buildPrismaMock(null);
    const service = new LessonsService(prisma, buildProgressServiceMock());

    await expect(service.findBySlug('unknown', 'user-1')).rejects.toBeInstanceOf(NotFoundException);
  });
});
