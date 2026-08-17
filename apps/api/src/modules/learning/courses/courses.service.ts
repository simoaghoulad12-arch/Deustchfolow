import { Injectable, NotFoundException } from '@nestjs/common';
import { CEFRLevel } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';

interface FindAllQuery {
  level?: string;
  skip?: number;
  take?: number;
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 50;

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Pagination prepared for when content grows — small defaults are fine today. */
  async findAll(query: FindAllQuery) {
    const levelFilter =
      query.level && Object.values(CEFRLevel).includes(query.level as CEFRLevel)
        ? { level: { code: query.level as CEFRLevel } }
        : undefined;

    return this.prisma.client.course.findMany({
      where: levelFilter,
      orderBy: [{ level: { order: 'asc' } }, { order: 'asc' }],
      skip: query.skip ?? 0,
      take: Math.min(query.take ?? DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        level: { select: { code: true, name: true } },
      },
    });
  }

  /**
   * One query for the course + its module/lesson outline (Prisma compiles
   * the nested `select` to joins, not N+1), plus one small batched query
   * for the current user's progress on those lessons — never per-lesson.
   * Deliberately does NOT include exercises here (see spec section 22:
   * "APIs dürfen nicht unnötig komplette Course-Bäume laden").
   */
  async findBySlug(slug: string, userId: string) {
    const course = await this.prisma.client.course.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        order: true,
        level: { select: { code: true, name: true } },
        modules: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            order: true,
            lessons: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                skill: true,
                difficulty: true,
                estimatedMinutes: true,
                order: true,
              },
            },
          },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('Course not found.');
    }

    const lessonIds = course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.id));

    const progressRows = lessonIds.length
      ? await this.prisma.client.lessonProgress.findMany({
          where: { userId, lessonId: { in: lessonIds } },
          select: { lessonId: true, status: true, progress: true },
        })
      : [];

    const progressByLessonId = new Map(progressRows.map((row) => [row.lessonId, row]));

    return {
      ...course,
      modules: course.modules.map((module) => ({
        ...module,
        lessons: module.lessons.map((lesson) => ({
          ...lesson,
          progress: progressByLessonId.get(lesson.id) ?? null,
        })),
      })),
    };
  }
}
