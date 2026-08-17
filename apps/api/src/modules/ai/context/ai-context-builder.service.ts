import { Injectable } from '@nestjs/common';
import { CEFRLevel, type ErrorCategory } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import type { AiLearnerContext } from './ai-context.types';

const WEAK_SKILL_THRESHOLD = 50;
const RECENT_SUBMISSIONS_LIMIT = 5;
const MAX_ERROR_CATEGORIES = 5;

/**
 * Builds the minimal, task-scoped `AiLearnerContext` — a few small,
 * indexed queries, never a full user data dump (spec section 4).
 */
@Injectable()
export class AiContextBuilder {
  constructor(private readonly prisma: PrismaService) {}

  async build(userId: string, options?: { lessonId?: string }): Promise<AiLearnerContext> {
    const [learningProfile, lesson, weakSkillRows, recentSubmissions] = await Promise.all([
      this.prisma.client.learningProfile.findUnique({
        where: { userId },
        select: { currentLevel: true, targetLevel: true, learningGoal: true },
      }),
      options?.lessonId
        ? this.prisma.client.lesson.findUnique({
            where: { id: options.lessonId },
            select: { title: true, skill: true },
          })
        : Promise.resolve(null),
      this.prisma.client.userSkillProgress.findMany({
        where: { userId, score: { lt: WEAK_SKILL_THRESHOLD } },
        orderBy: { score: 'asc' },
        take: 3,
        select: { skill: true },
      }),
      this.prisma.client.writingSubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: RECENT_SUBMISSIONS_LIMIT,
        select: { errors: true },
      }),
    ]);

    return {
      userId,
      currentLevel: learningProfile?.currentLevel ?? CEFRLevel.A1,
      targetLevel: learningProfile?.targetLevel ?? null,
      learningGoal: learningProfile?.learningGoal ?? null,
      currentSkill: lesson?.skill ?? null,
      currentLessonTitle: lesson?.title ?? null,
      weakSkills: weakSkillRows.map((row) => row.skill),
      recentErrorCategories: extractErrorCategories(recentSubmissions, MAX_ERROR_CATEGORIES),
    };
  }
}

function extractErrorCategories(
  submissions: Array<{ errors: unknown }>,
  limit: number,
): ErrorCategory[] {
  const categories = new Set<ErrorCategory>();

  for (const submission of submissions) {
    if (!Array.isArray(submission.errors)) continue;
    for (const error of submission.errors) {
      if (
        error &&
        typeof error === 'object' &&
        'category' in error &&
        typeof (error as { category: unknown }).category === 'string'
      ) {
        categories.add((error as { category: ErrorCategory }).category);
      }
      if (categories.size >= limit) break;
    }
    if (categories.size >= limit) break;
  }

  return [...categories];
}
