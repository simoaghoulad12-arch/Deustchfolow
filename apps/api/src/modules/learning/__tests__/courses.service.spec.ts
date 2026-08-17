import { NotFoundException } from '@nestjs/common';
import { CoursesService } from '../courses/courses.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

function buildPrismaMock() {
  return {
    client: {
      course: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'course-1',
          title: 'A1 Grundlagen',
          slug: 'a1-grundlagen',
          modules: [
            {
              id: 'module-1',
              lessons: [
                { id: 'lesson-1' },
                { id: 'lesson-2' },
              ],
            },
          ],
        }),
      },
      lessonProgress: {
        findMany: jest.fn().mockResolvedValue([{ lessonId: 'lesson-1', status: 'IN_PROGRESS', progress: 40 }]),
      },
    },
  } as unknown as PrismaService;
}

describe('CoursesService', () => {
  it('loads a course', async () => {
    const prisma = buildPrismaMock();
    const service = new CoursesService(prisma);

    const course = await service.findBySlug('a1-grundlagen', 'user-1');

    expect(course.slug).toBe('a1-grundlagen');
  });

  it('throws NotFoundException for an unknown course', async () => {
    const prisma = buildPrismaMock();
    (prisma.client.course.findUnique as jest.Mock).mockResolvedValue(null);
    const service = new CoursesService(prisma);

    await expect(service.findBySlug('does-not-exist', 'user-1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('enriches lessons with the current user\'s own progress, scoped by userId', async () => {
    const prisma = buildPrismaMock();
    const service = new CoursesService(prisma);

    const course = await service.findBySlug('a1-grundlagen', 'user-1');

    expect(prisma.client.lessonProgress.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ userId: 'user-1' }) }),
    );
    expect(course.modules[0]!.lessons[0]!.progress).toEqual({
      lessonId: 'lesson-1',
      status: 'IN_PROGRESS',
      progress: 40,
    });
    expect(course.modules[0]!.lessons[1]!.progress).toBeNull();
  });

  it('loads the whole course tree with a bounded number of queries (no N+1)', async () => {
    const prisma = buildPrismaMock();
    const service = new CoursesService(prisma);

    await service.findBySlug('a1-grundlagen', 'user-1');

    // One query for the course+modules+lessons tree, one batched query for
    // progress — never one query per lesson.
    expect((prisma.client.course.findUnique as jest.Mock).mock.calls.length).toBe(1);
    expect((prisma.client.lessonProgress.findMany as jest.Mock).mock.calls.length).toBe(1);
  });
});
