import { BadRequestException, Injectable } from '@nestjs/common';
import { levelFromProficiency, CEFR_ORDER, type CEFRLevel } from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { generateLearningPlan } from '../plan/learning-plan';
import type { OnboardingInput, ProfileUpdateInput } from './learner.schemas';

/** Seeds a fresh learner's proficiency estimate from the level they start at. */
function proficiencyFor(level: CEFRLevel): number {
  return CEFR_ORDER[level];
}

/**
 * Learner identity inside the immersion platform: onboarding answers,
 * profile, active target language and the personalised learning plan.
 */
@Injectable()
export class LearnerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
  ) {}

  async me(userId: string) {
    const db = this.prisma.client;
    const [user, profile] = await Promise.all([
      db.user.findUnique({
        where: { id: userId },
        select: { email: true, role: true, createdAt: true, profile: { select: { displayName: true, avatarUrl: true } } },
      }),
      db.learningProfile.findUnique({ where: { userId } }),
    ]);
    const lang = profile?.targetLanguageCode ?? null;
    const [stats, language, plan, placement] = lang
      ? await Promise.all([
          this.gamification.ensureStats(userId, lang),
          db.language.findUnique({ where: { code: lang } }),
          db.learningPlan.findFirst({ where: { userId, languageCode: lang, isActive: true }, orderBy: { createdAt: 'desc' } }),
          db.placementResult.findFirst({ where: { userId, languageCode: lang }, orderBy: { createdAt: 'desc' } }),
        ])
      : [null, null, null, null];

    return {
      email: user?.email ?? null,
      role: user?.role ?? 'STUDENT',
      memberSince: user?.createdAt ?? null,
      displayName: user?.profile?.displayName ?? null,
      avatarUrl: user?.profile?.avatarUrl ?? null,
      onboardingCompleted: Boolean(profile?.onboardingCompletedAt),
      needsPlacement: Boolean(profile?.onboardingCompletedAt) && !profile?.currentLevel,
      targetLanguage: language ? { code: language.code, name: language.name, flag: language.flag } : null,
      nativeLanguage: profile?.nativeLanguage ?? null,
      level: (profile?.currentLevel ?? null) as CEFRLevel | null,
      goals: profile?.goals ?? [],
      dailyMinutes: profile?.dailyMinutes ?? null,
      learningStyles: profile?.learningStyles ?? [],
      personalGoal: profile?.personalGoal ?? null,
      stats: stats
        ? {
            totalXp: stats.totalXp,
            currentStreak: stats.currentStreak,
            longestStreak: stats.longestStreak,
            learningMinutes: stats.learningMinutes,
            speakingMinutes: stats.speakingMinutes,
            difficulty: stats.difficulty,
            proficiency: stats.proficiency,
            estimatedLevel: levelFromProficiency(stats.proficiency),
          }
        : null,
      plan: plan ? { id: plan.id, ...((plan.plan as object) ?? {}), createdAt: plan.createdAt } : null,
      placement: placement
        ? { estimatedLevel: placement.estimatedLevel, skillScores: placement.skillScores, createdAt: placement.createdAt }
        : null,
    };
  }

  async completeOnboarding(userId: string, input: OnboardingInput) {
    const db = this.prisma.client;
    const language = await db.language.findFirst({ where: { code: input.targetLanguage, isActive: true, isTarget: true } });
    if (!language) throw new BadRequestException('This language is not available yet.');

    const level = input.level === 'unknown' ? null : input.level;
    await db.$transaction([
      db.learningProfile.upsert({
        where: { userId },
        update: {
          targetLanguageCode: language.code,
          nativeLanguage: input.nativeLanguage,
          currentLevel: level,
          goals: input.goals,
          dailyMinutes: input.dailyMinutes,
          learningStyles: input.learningStyles,
          personalGoal: input.personalGoal || null,
          learningGoal: input.goals[0] ?? null,
          onboardingCompletedAt: new Date(),
        },
        create: {
          userId,
          targetLanguageCode: language.code,
          nativeLanguage: input.nativeLanguage,
          currentLevel: level,
          goals: input.goals,
          dailyMinutes: input.dailyMinutes,
          learningStyles: input.learningStyles,
          personalGoal: input.personalGoal || null,
          learningGoal: input.goals[0] ?? null,
          onboardingCompletedAt: new Date(),
        },
      }),
      ...(input.displayName
        ? [
            db.userProfile.upsert({
              where: { userId },
              update: { displayName: input.displayName },
              create: { userId, displayName: input.displayName },
            }),
          ]
        : []),
    ]);

    const stats = await this.gamification.ensureStats(userId, language.code);
    if (level) {
      await db.learnerStats.update({
        where: { id: stats.id },
        data: { proficiency: proficiencyFor(level), difficulty: 3 },
      });
      await this.regeneratePlan(userId);
    }
    return { needsPlacement: level === null };
  }

  /** Sets the learner's level (e.g. from the placement test) and rebuilds their plan. */
  async setLevel(userId: string, languageCode: string, level: CEFRLevel) {
    await this.prisma.client.learningProfile.update({ where: { userId }, data: { currentLevel: level } });
    const stats = await this.gamification.ensureStats(userId, languageCode);
    await this.prisma.client.learnerStats.update({
      where: { id: stats.id },
      data: { proficiency: proficiencyFor(level) },
    });
    await this.regeneratePlan(userId);
  }

  async regeneratePlan(userId: string) {
    const db = this.prisma.client;
    const profile = await db.learningProfile.findUnique({ where: { userId } });
    if (!profile?.targetLanguageCode || !profile.currentLevel) return null;
    const language = await db.language.findUnique({ where: { code: profile.targetLanguageCode } });
    const doc = generateLearningPlan({
      languageName: language?.name ?? profile.targetLanguageCode,
      startLevel: profile.currentLevel as CEFRLevel,
      dailyMinutes: profile.dailyMinutes ?? 10,
      goals: profile.goals,
      styles: profile.learningStyles,
      personalGoal: profile.personalGoal,
    });
    const [, plan] = await db.$transaction([
      db.learningPlan.updateMany({
        where: { userId, languageCode: profile.targetLanguageCode, isActive: true },
        data: { isActive: false },
      }),
      db.learningPlan.create({
        data: {
          userId,
          languageCode: profile.targetLanguageCode,
          startLevel: profile.currentLevel,
          targetLevel: doc.targetLevel,
          dailyMinutes: profile.dailyMinutes ?? 10,
          focusSkills: doc.focusSkills,
          plan: doc as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);
    return plan;
  }

  async updateProfile(userId: string, input: ProfileUpdateInput) {
    const db = this.prisma.client;
    if (input.targetLanguage) {
      const language = await db.language.findFirst({ where: { code: input.targetLanguage, isActive: true, isTarget: true } });
      if (!language) throw new BadRequestException('This language is not available yet.');
    }
    if (input.displayName !== undefined || input.avatarUrl !== undefined) {
      await db.userProfile.upsert({
        where: { userId },
        update: { displayName: input.displayName, avatarUrl: input.avatarUrl },
        create: { userId, displayName: input.displayName, avatarUrl: input.avatarUrl },
      });
    }
    await db.learningProfile.update({
      where: { userId },
      data: {
        targetLanguageCode: input.targetLanguage,
        nativeLanguage: input.nativeLanguage,
        currentLevel: input.level,
        goals: input.goals,
        dailyMinutes: input.dailyMinutes,
        learningStyles: input.learningStyles,
        personalGoal: input.personalGoal,
      },
    });
    if (input.targetLanguage) await this.gamification.ensureStats(userId, input.targetLanguage);
    await this.regeneratePlan(userId);
    return this.me(userId);
  }

  async languages() {
    return this.prisma.client.language.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      select: { code: true, name: true, nativeName: true, flag: true, isTarget: true },
    });
  }

  activeLanguage(userId: string) {
    return this.context.activeLanguage(userId);
  }
}
