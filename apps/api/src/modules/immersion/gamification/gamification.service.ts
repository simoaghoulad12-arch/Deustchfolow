import { Injectable } from '@nestjs/common';
import { CEFR_ORDER, XP_REWARDS, levelFromProficiency, type XpSource } from '@deutschflow/types';
import type { Achievement } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { dayKey } from '../common/dates';
import { nextStreak } from './streak';

export interface XpResult {
  totalXp: number;
  streak: number;
  newAchievements: { code: string; title: string; icon: string }[];
}

interface AchievementCriteria {
  metric:
    | 'missions_completed'
    | 'streak'
    | 'words'
    | 'speaking_sessions'
    | 'speaking_minutes'
    | 'level_reached'
    | 'journal_entries'
    | 'reviews';
  threshold: number;
}

/**
 * XP ledger, streaks and achievements (spec section 30). XP is an
 * append-only ledger (XpEvent) with LearnerStats.totalXp as its running
 * sum; achievements are data-driven ({metric, threshold} rows) so admins
 * can add new ones without code.
 */
@Injectable()
export class GamificationService {
  constructor(private readonly prisma: PrismaService) {}

  async ensureStats(userId: string, languageCode: string) {
    return this.prisma.client.learnerStats.upsert({
      where: { userId_languageCode: { userId, languageCode } },
      update: {},
      create: { userId, languageCode },
    });
  }

  /** XP reward for a source, honouring the admin override in SystemSetting "xp.rewards". */
  async rewardFor(source: keyof typeof XP_REWARDS): Promise<number> {
    const setting = await this.prisma.client.systemSetting.findUnique({ where: { key: 'xp.rewards' } });
    const overrides = (setting?.value ?? {}) as Record<string, unknown>;
    const override = overrides[source];
    return typeof override === 'number' && override >= 0 ? override : XP_REWARDS[source];
  }

  /** Records activity for the streak and learning time without awarding XP. */
  async touchActivity(userId: string, languageCode: string, minutes = 0, speakingMinutes = 0) {
    const stats = await this.ensureStats(userId, languageCode);
    const today = dayKey();
    const streak = nextStreak(stats.lastActiveDate, stats.currentStreak, today);
    return this.prisma.client.learnerStats.update({
      where: { id: stats.id },
      data: {
        currentStreak: streak,
        longestStreak: Math.max(stats.longestStreak, streak),
        lastActiveDate: today,
        learningMinutes: { increment: Math.max(0, Math.round(minutes)) },
        speakingMinutes: { increment: Math.max(0, Math.round(speakingMinutes)) },
      },
    });
  }

  async awardXp(
    userId: string,
    languageCode: string,
    source: XpSource,
    amount: number,
    options: { refId?: string; minutes?: number; speakingMinutes?: number; checkAchievements?: boolean } = {},
  ): Promise<XpResult> {
    const stats = await this.touchActivity(userId, languageCode, options.minutes, options.speakingMinutes);
    const safeAmount = Math.max(0, Math.round(amount));
    let totalXp = stats.totalXp;
    if (safeAmount > 0) {
      const [, updated] = await this.prisma.client.$transaction([
        this.prisma.client.xpEvent.create({
          data: { userId, languageCode, source, amount: safeAmount, refId: options.refId ?? null },
        }),
        this.prisma.client.learnerStats.update({
          where: { id: stats.id },
          data: { totalXp: { increment: safeAmount } },
        }),
      ]);
      totalXp = updated.totalXp;
    }

    const newAchievements =
      options.checkAchievements === false ? [] : await this.checkAchievements(userId, languageCode);
    totalXp += newAchievements.reduce((sum, a) => sum + a.xpReward, 0);

    return {
      totalXp,
      streak: stats.currentStreak,
      newAchievements: newAchievements.map(({ code, title, icon }) => ({ code, title, icon })),
    };
  }

  async metrics(userId: string, languageCode: string): Promise<Record<AchievementCriteria['metric'], number>> {
    const db = this.prisma.client;
    const [stats, missions, words, speaking, journal, reviews] = await Promise.all([
      this.ensureStats(userId, languageCode),
      db.missionRun.count({ where: { userId, status: 'COMPLETED', mission: { languageCode } } }),
      db.userVocabulary.count({ where: { userId, status: { not: 'NEW' }, vocabulary: { languageCode } } }),
      db.practiceSession.count({ where: { userId, languageCode, mode: 'SPEAKING' } }),
      db.journalEntry.count({ where: { userId, languageCode } }),
      db.reviewLog.count({ where: { userId } }),
    ]);
    return {
      missions_completed: missions,
      streak: stats.currentStreak,
      words,
      speaking_sessions: speaking,
      speaking_minutes: stats.speakingMinutes,
      level_reached: CEFR_ORDER[levelFromProficiency(stats.proficiency)],
      journal_entries: journal,
      reviews,
    };
  }

  async checkAchievements(userId: string, languageCode: string): Promise<Achievement[]> {
    const db = this.prisma.client;
    const [all, owned] = await Promise.all([
      db.achievement.findMany({ orderBy: { order: 'asc' } }),
      db.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    ]);
    const ownedIds = new Set(owned.map((o) => o.achievementId));
    const pending = all.filter((a) => !ownedIds.has(a.id));
    if (pending.length === 0) return [];

    const metrics = await this.metrics(userId, languageCode);
    const unlocked = pending.filter((a) => {
      const criteria = a.criteria as unknown as AchievementCriteria;
      const value = metrics[criteria.metric];
      return typeof value === 'number' && value >= criteria.threshold;
    });
    if (unlocked.length === 0) return [];

    await db.userAchievement.createMany({
      data: unlocked.map((a) => ({ userId, achievementId: a.id })),
      skipDuplicates: true,
    });
    const xp = unlocked.reduce((sum, a) => sum + a.xpReward, 0);
    if (xp > 0) {
      await db.$transaction([
        db.xpEvent.create({ data: { userId, languageCode, source: 'achievement', amount: xp } }),
        db.learnerStats.update({
          where: { userId_languageCode: { userId, languageCode } },
          data: { totalXp: { increment: xp } },
        }),
      ]);
    }
    return unlocked;
  }
}
