import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * One query for the lesson + breadcrumb + prerequisites, one small
   * follow-up query for this user's own progress on it — no N+1.
   */
  async findBySlug(slug: string, userId: string) {
    const lesson = await this.prisma.client.lesson.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        skill: true,
        difficulty: true,
        estimatedMinutes: true,
        order: true,
        objectives: true,
        module: {
          select: {
            id: true,
            title: true,
            slug: true,
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                level: { select: { code: true, name: true } },
              },
            },
          },
        },
        prerequisites: {
          select: { id: true, title: true, slug: true },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    await this.progressService.markLessonVisited(userId, lesson.id);

    const progress = await this.prisma.client.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
    });

    return { ...lesson, progress };
  }

  async findIdBySlug(slug: string): Promise<string> {
    const lesson = await this.prisma.client.lesson.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }
    return lesson.id;
  }
}
