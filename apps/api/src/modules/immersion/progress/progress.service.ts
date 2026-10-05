import { Injectable } from '@nestjs/common';
import { CEFR_ORDER, levelFromProficiency, type CEFRLevel } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { DnaService } from '../dna/dna.service';
import { dayKey, daysAgo } from '../common/dates';

/**
 * Progress dashboard (spec section 29): XP and activity over time, Language
 * DNA trend, level progress, skills, mistakes mastered and achievements.
 */
@Injectable()
export class ProgressService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly dna: DnaService,
  ) {}

  async overview(userId: string) {
    const db = this.prisma.client;
    const lang = await this.context.activeLanguage(userId);
    const since = daysAgo(29);
    const [stats, profile, xpEvents, snapshots, dna, missions, words, wordsMastered, mistakesMastered, mistakesOpen, practice, journal, achievements, unlocked, grammar] =
      await Promise.all([
        this.gamification.ensureStats(userId, lang),
        db.learningProfile.findUnique({ where: { userId }, select: { currentLevel: true, targetLevel: true } }),
        db.xpEvent.findMany({ where: { userId, languageCode: lang, createdAt: { gte: since } }, select: { amount: true, source: true, createdAt: true } }),
        db.dnaSnapshot.findMany({ where: { userId, languageCode: lang }, orderBy: { day: 'asc' }, take: 60 }),
        this.dna.get(userId, lang),
        db.missionRun.findMany({
          where: { userId, status: 'COMPLETED', mission: { languageCode: lang } },
          orderBy: { completedAt: 'desc' },
          take: 50,
          select: { score: true, completedAt: true, xpAwarded: true, mission: { select: { title: true, slug: true, mode: true } } },
        }),
        db.userVocabulary.count({ where: { userId, vocabulary: { languageCode: lang } } }),
        db.userVocabulary.count({ where: { userId, vocabulary: { languageCode: lang }, status: 'MASTERED' } }),
        db.mistake.count({ where: { userId, languageCode: lang, masteryState: 'MASTERED' } }),
        db.mistake.count({ where: { userId, languageCode: lang, masteryState: { not: 'MASTERED' } } }),
        db.practiceSession.groupBy({ by: ['mode'], where: { userId, languageCode: lang }, _count: true }),
        db.journalEntry.count({ where: { userId, languageCode: lang } }),
        db.achievement.findMany({ orderBy: { order: 'asc' } }),
        db.userAchievement.findMany({ where: { userId } }),
        db.grammarProgress.findMany({ where: { userId, topic: { languageCode: lang } }, select: { mastery: true } }),
      ]);

    const days = Array.from({ length: 30 }, (_, i) => dayKey(daysAgo(29 - i)));
    const xpByDay = new Map(days.map((d) => [d, 0]));
    for (const e of xpEvents) {
      const d = dayKey(e.createdAt);
      if (xpByDay.has(d)) xpByDay.set(d, (xpByDay.get(d) ?? 0) + e.amount);
    }
    const xpBySource: Record<string, number> = {};
    for (const e of xpEvents) xpBySource[e.source] = (xpBySource[e.source] ?? 0) + e.amount;

    const level = (profile?.currentLevel ?? 'A1') as CEFRLevel;
    // Proficiency starts at the level's number (A1 = 1) and the estimate moves up a level at +0.5.
    const withinLevel = Math.max(0, Math.min(1, (stats.proficiency - CEFR_ORDER[level]) / 0.5));
    const unlockedIds = new Map(unlocked.map((u) => [u.achievementId, u.unlockedAt]));

    return {
      languageCode: lang,
      level,
      estimatedLevel: levelFromProficiency(stats.proficiency),
      levelProgress: Math.round(withinLevel * 100),
      stats: {
        totalXp: stats.totalXp,
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        learningMinutes: stats.learningMinutes,
        speakingMinutes: stats.speakingMinutes,
        missionsCompleted: missions.length,
        averageMissionScore: missions.length ? Math.round(missions.reduce((s, m) => s + (m.score ?? 0), 0) / missions.length) : null,
        words,
        wordsMastered,
        mistakesMastered,
        mistakesOpen,
        journalEntries: journal,
        grammarMastery: grammar.length ? Math.round(grammar.reduce((s, g) => s + g.mastery, 0) / grammar.length) : 0,
        practiceSessions: Object.fromEntries(practice.map((p) => [p.mode, p._count])),
      },
      xpByDay: days.map((d) => ({ day: d, xp: xpByDay.get(d) ?? 0 })),
      xpBySource,
      dna,
      dnaTrend: snapshots.map((s) => ({ day: s.day, scores: s.scores })),
      recentMissions: missions.slice(0, 8).map((m) => ({ ...m.mission, score: m.score, xpAwarded: m.xpAwarded, completedAt: m.completedAt })),
      achievements: achievements.map((a) => ({
        code: a.code,
        title: a.title,
        description: a.description,
        icon: a.icon,
        xpReward: a.xpReward,
        unlockedAt: unlockedIds.get(a.id) ?? null,
      })),
    };
  }
}
