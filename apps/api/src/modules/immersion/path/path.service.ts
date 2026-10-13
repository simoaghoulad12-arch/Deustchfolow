import { Injectable, NotFoundException } from '@nestjs/common';
import type { CEFRLevel, PracticeExercisePayload, PracticeExerciseType } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { publicPayload } from '../exercises/exercise-grader';

export const PATH_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

/** Curriculum courses follow the seed's slug convention, e.g. "de-a1-curriculum". */
export function curriculumSlug(languageCode: string, level: CEFRLevel): string {
  return `${languageCode}-${level.toLowerCase()}-curriculum`;
}

/**
 * CEFR learning path (spec section 28): A1 → A2 → B1 → B2, each level a
 * course of modules and lessons stored in the database (editable in the
 * CMS). Completing a lesson pays lesson XP once; finishing every lesson of
 * a level pays the level bonus once.
 */
@Injectable()
export class PathService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
  ) {}

  async overview(userId: string) {
    const lang = await this.context.activeLanguage(userId);
    const profile = await this.prisma.client.learningProfile.findUnique({ where: { userId }, select: { currentLevel: true } });
    const courses = await this.prisma.client.course.findMany({
      where: { slug: { in: PATH_LEVELS.map((l) => curriculumSlug(lang, l)) } },
      include: {
        level: { select: { code: true, name: true } },
        modules: {
          orderBy: { order: 'asc' },
          include: { lessons: { orderBy: { order: 'asc' }, select: { id: true, slug: true, title: true, skill: true, estimatedMinutes: true } } },
        },
      },
    });
    const lessonIds = courses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => l.id)));
    const done = new Set(
      (
        await this.prisma.client.lessonProgress.findMany({
          where: { userId, lessonId: { in: lessonIds }, status: 'COMPLETED' },
          select: { lessonId: true },
        })
      ).map((p) => p.lessonId),
    );
    const levels = PATH_LEVELS.map((code) => {
      const course = courses.find((c) => c.level.code === code);
      const modules = (course?.modules ?? []).map((m) => ({
        id: m.id,
        title: m.title,
        description: m.description,
        lessons: m.lessons.map(({ id, ...l }) => ({ ...l, completed: done.has(id) })),
      }));
      const total = modules.reduce((s, m) => s + m.lessons.length, 0);
      const completed = modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0);
      return { level: code, name: course?.level.name ?? code, available: Boolean(course), modules, total, completed };
    });
    const next = levels.flatMap((l) => l.modules.flatMap((m) => m.lessons)).find((l) => !l.completed) ?? null;
    return { languageCode: lang, currentLevel: (profile?.currentLevel ?? 'A1') as CEFRLevel, levels, nextLesson: next ? next.slug : null };
  }

  private async findLesson(userId: string, slug: string) {
    const lang = await this.context.activeLanguage(userId);
    const lesson = await this.prisma.client.lesson.findFirst({
      where: { slug, module: { course: { slug: { in: PATH_LEVELS.map((l) => curriculumSlug(lang, l)) } } } },
      include: { module: { include: { course: { include: { level: true } }, lessons: { orderBy: { order: 'asc' }, select: { slug: true, title: true } } } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found.');
    return { lesson, lang };
  }

  async lesson(userId: string, slug: string) {
    const { lesson, lang } = await this.findLesson(userId, slug);
    const content = (lesson.content ?? {}) as { grammarTopic?: string };
    const topic = content.grammarTopic
      ? await this.prisma.client.grammarTopic.findUnique({
          where: { languageCode_slug: { languageCode: lang, slug: content.grammarTopic } },
          select: { slug: true, title: true, summary: true, id: true },
        })
      : null;
    const exercises = topic
      ? await this.prisma.client.practiceExercise.findMany({
          where: { grammarTopicId: topic.id, type: { in: ['MULTIPLE_CHOICE', 'FILL_BLANK', 'SENTENCE_ORDER', 'ERROR_CORRECTION', 'MATCHING', 'TRANSLATION'] } },
          orderBy: { createdAt: 'asc' },
          take: 3,
          select: { id: true, type: true, prompt: true, payload: true, skill: true },
        })
      : [];
    const progress = await this.prisma.client.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: { lastAccessedAt: new Date() },
      create: { userId, lessonId: lesson.id, status: 'IN_PROGRESS', lastAccessedAt: new Date() },
    });
    const siblings = lesson.module.lessons;
    const index = siblings.findIndex((l) => l.slug === lesson.slug);
    return {
      slug: lesson.slug,
      title: lesson.title,
      description: lesson.description,
      skill: lesson.skill,
      estimatedMinutes: lesson.estimatedMinutes,
      objectives: lesson.objectives,
      content: lesson.content,
      level: lesson.module.course.level.code,
      module: { title: lesson.module.title, position: `${index + 1} / ${siblings.length}` },
      grammarTopic: topic ? { slug: topic.slug, title: topic.title, summary: topic.summary } : null,
      exercises: exercises.map((e) => ({
        id: e.id,
        type: e.type,
        prompt: e.prompt,
        skill: e.skill,
        payload: publicPayload(e.type as PracticeExerciseType, e.payload as PracticeExercisePayload),
      })),
      completed: progress.status === 'COMPLETED',
      previous: siblings[index - 1]?.slug ?? null,
      next: siblings[index + 1]?.slug ?? null,
    };
  }

  async complete(userId: string, slug: string) {
    const { lesson, lang } = await this.findLesson(userId, slug);
    await this.prisma.client.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId: lesson.id } },
      update: {},
      create: { userId, lessonId: lesson.id, status: 'IN_PROGRESS' },
    });
    // Conditional update = atomic claim: a double submit cannot pay lesson XP twice.
    const claimed = await this.prisma.client.lessonProgress.updateMany({
      where: { userId, lessonId: lesson.id, status: { not: 'COMPLETED' } },
      data: { status: 'COMPLETED', progress: 100, completedAt: new Date() },
    });
    if (claimed.count === 0) return { xpAwarded: 0, levelCompleted: false, newAchievements: [] };

    let xpAwarded = await this.gamification.rewardFor('lesson');
    let result = await this.gamification.awardXp(userId, lang, 'lesson', xpAwarded, { refId: lesson.id, minutes: lesson.estimatedMinutes });

    const course = lesson.module.course;
    const [total, completed] = await Promise.all([
      this.prisma.client.lesson.count({ where: { module: { courseId: course.id } } }),
      this.prisma.client.lessonProgress.count({ where: { userId, status: 'COMPLETED', lesson: { module: { courseId: course.id } } } }),
    ]);
    let levelCompleted = false;
    if (total > 0 && completed >= total) {
      const alreadyPaid = await this.prisma.client.xpEvent.count({ where: { userId, source: 'level', refId: course.id } });
      if (alreadyPaid === 0) {
        levelCompleted = true;
        const bonus = await this.gamification.rewardFor('level');
        xpAwarded += bonus;
        result = await this.gamification.awardXp(userId, lang, 'level', bonus, { refId: course.id });
      }
    }
    return { xpAwarded, levelCompleted, totalXp: result.totalXp, newAchievements: result.newAchievements };
  }
}
