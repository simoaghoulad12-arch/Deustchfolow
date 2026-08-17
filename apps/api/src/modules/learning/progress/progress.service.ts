import { Injectable } from '@nestjs/common';
import { ProgressStatus, type CEFRLevel, type LearningSkill } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';

const SKILL_SCORE_DELTA_CORRECT = 2;
const SKILL_SCORE_DELTA_INCORRECT = -1;
const SKILL_SCORE_MIN = 0;
const SKILL_SCORE_MAX = 100;

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Called when a student opens a lesson. Idempotent, non-destructive: it
   * never downgrades a COMPLETED lesson back to IN_PROGRESS, only records
   * that the lesson has been (re-)visited.
   */
  async markLessonVisited(userId: string, lessonId: string): Promise<void> {
    const existing = await this.prisma.client.lessonProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
    });

    if (!existing) {
      await this.prisma.client.lessonProgress.create({
        data: { userId, lessonId, status: ProgressStatus.IN_PROGRESS, lastAccessedAt: new Date() },
      });
      return;
    }

    await this.prisma.client.lessonProgress.update({
      where: { userId_lessonId: { userId, lessonId } },
      data: {
        lastAccessedAt: new Date(),
        status: existing.status === ProgressStatus.NOT_STARTED ? ProgressStatus.IN_PROGRESS : existing.status,
      },
    });
  }

  /**
   * Recomputes a lesson's progress percentage from the exercises the
   * student has answered correctly at least once. Rule-based, no AI —
   * see architecture decision record section 29.
   */
  async recalculateLessonProgress(userId: string, lessonId: string): Promise<void> {
    const exercises = await this.prisma.client.exercise.findMany({
      where: { lessonId },
      select: { id: true },
    });

    if (exercises.length === 0) return;

    const correctAttempts = await this.prisma.client.exerciseAttempt.findMany({
      where: { userId, exerciseId: { in: exercises.map((e) => e.id) }, isCorrect: true },
      select: { exerciseId: true },
      distinct: ['exerciseId'],
    });

    const percentage = Math.round((correctAttempts.length / exercises.length) * 100);
    const isComplete = percentage >= 100;

    await this.prisma.client.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        status: isComplete ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        progress: percentage,
        completedAt: isComplete ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      update: {
        status: isComplete ? ProgressStatus.COMPLETED : ProgressStatus.IN_PROGRESS,
        progress: percentage,
        completedAt: isComplete ? new Date() : undefined,
        lastAccessedAt: new Date(),
      },
    });
  }

  /** Small, deterministic nudge — not a scoring model. No `level` inference here (that needs a real algorithm, later). */
  async recordSkillAttempt(userId: string, skill: LearningSkill, isCorrect: boolean): Promise<void> {
    const delta = isCorrect ? SKILL_SCORE_DELTA_CORRECT : SKILL_SCORE_DELTA_INCORRECT;

    const existing = await this.prisma.client.userSkillProgress.findUnique({
      where: { userId_skill: { userId, skill } },
    });

    const nextScore = Math.min(
      SKILL_SCORE_MAX,
      Math.max(SKILL_SCORE_MIN, (existing?.score ?? 0) + delta),
    );

    await this.prisma.client.userSkillProgress.upsert({
      where: { userId_skill: { userId, skill } },
      create: { userId, skill, score: nextScore },
      update: { score: nextScore },
    });
  }

  /**
   * Everything `/me/progress` and the dashboard need, in a bounded number
   * of queries — never a full course-tree walk.
   */
  async getUserProgressSummary(userId: string) {
    const [lessonProgress, skillProgress, timeSpentAgg] = await Promise.all([
      this.prisma.client.lessonProgress.findMany({
        where: { userId },
        orderBy: { lastAccessedAt: 'desc' },
        select: {
          status: true,
          progress: true,
          completedAt: true,
          lastAccessedAt: true,
          lesson: {
            select: {
              id: true,
              title: true,
              slug: true,
              order: true,
              module: {
                select: {
                  id: true,
                  title: true,
                  course: { select: { id: true, title: true, slug: true } },
                },
              },
            },
          },
        },
      }),
      this.prisma.client.userSkillProgress.findMany({ where: { userId } }),
      this.prisma.client.exerciseAttempt.aggregate({
        where: { userId },
        _sum: { timeSpentMs: true },
      }),
    ]);

    const learningProfile = await this.prisma.client.learningProfile.findUnique({
      where: { userId },
      select: { currentLevel: true, targetLevel: true },
    });

    const recommendedNextLesson = await this.getRecommendedNextLesson(
      userId,
      learningProfile?.currentLevel ?? null,
    );

    return {
      lessons: lessonProgress,
      skills: skillProgress,
      totalTimeSpentMs: timeSpentAgg._sum.timeSpentMs ?? 0,
      lastLesson: lessonProgress.find((row) => row.lastAccessedAt !== null) ?? null,
      currentLevel: learningProfile?.currentLevel ?? null,
      targetLevel: learningProfile?.targetLevel ?? null,
      recommendedNextLesson,
    };
  }

  /**
   * Simple rule-based recommendation (spec section 20/29 — no AI): the
   * first lesson, in curriculum order, that the student has not completed
   * yet, restricted to their current CEFR level if set.
   */
  async getRecommendedNextLesson(userId: string, currentLevel: CEFRLevel | null) {
    const completedLessonIds = (
      await this.prisma.client.lessonProgress.findMany({
        where: { userId, status: ProgressStatus.COMPLETED },
        select: { lessonId: true },
      })
    ).map((row) => row.lessonId);

    return this.prisma.client.lesson.findFirst({
      where: {
        id: { notIn: completedLessonIds },
        ...(currentLevel ? { module: { course: { level: { code: currentLevel } } } } : {}),
      },
      orderBy: [
        { module: { course: { level: { order: 'asc' } } } },
        { module: { course: { order: 'asc' } } },
        { module: { order: 'asc' } },
        { order: 'asc' },
      ],
      select: {
        id: true,
        title: true,
        slug: true,
        estimatedMinutes: true,
        module: { select: { course: { select: { slug: true } } } },
      },
    });
  }
}
