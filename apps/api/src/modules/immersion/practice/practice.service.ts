import { Injectable } from '@nestjs/common';
import type { CEFRLevel } from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { AssessmentService } from './assessment.service';
import { BRAIN_QUESTIONS, EMOTION_SCENARIOS, SPEAKING_TOPICS, pickForLevel } from './prompt-bank';
import { dayKey } from '../common/dates';

export type PracticeModeName = 'speaking' | 'brain' | 'emotion';

/** Brain mode answer window per level, tightened as adaptive difficulty rises. */
export function brainTimeLimitMs(level: CEFRLevel, difficulty: number): number {
  const base = { A1: 15_000, A2: 12_000, B1: 10_000, B2: 8_000, C1: 7_000 }[level];
  return Math.round(base * (1.2 - Math.min(Math.max(difficulty, 1), 5) * 0.08));
}

/** Full XP for the first sessions of the day, then a small amount, so XP tracks learning, not spamming. */
const FULL_REWARD_SESSIONS_PER_DAY = 3;

/**
 * Speaking, Brain and Emotion modes (spec sections 13/19/22). Prompts come
 * from the level-appropriate bank; answers are assessed by the AI (or the
 * offline engine) and stored as PracticeSessions for progress analytics.
 */
@Injectable()
export class PracticeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly assessment: AssessmentService,
  ) {}

  private async level(userId: string): Promise<CEFRLevel> {
    const profile = await this.prisma.client.learningProfile.findUnique({ where: { userId }, select: { currentLevel: true } });
    return (profile?.currentLevel ?? 'A1') as CEFRLevel;
  }

  async prompts(userId: string, mode: PracticeModeName) {
    const lang = await this.context.activeLanguage(userId);
    const level = await this.level(userId);
    const stats = await this.gamification.ensureStats(userId, lang);
    const seed = [...`${userId}${Date.now() >> 16}`].reduce((s, c) => s + c.charCodeAt(0), 0);
    const rotate = <T>(items: T[], n: number) => Array.from({ length: Math.min(n, items.length) }, (_, i) => items[(seed + i) % items.length]!);

    if (mode === 'brain') {
      const pool = pickForLevel(BRAIN_QUESTIONS[lang] ?? BRAIN_QUESTIONS.de ?? {}, level);
      return { mode, level, timeLimitMs: brainTimeLimitMs(level, stats.difficulty), items: rotate(pool, 5).map((prompt) => ({ prompt })) };
    }
    if (mode === 'emotion') {
      const order: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
      const pool = EMOTION_SCENARIOS.filter((s) => order.indexOf(s.level) <= order.indexOf(level));
      return { mode, level, items: rotate(pool, 3).map((s) => ({ prompt: s.situation, targetTone: s.tone })) };
    }
    return { mode, level, items: rotate(pickForLevel(SPEAKING_TOPICS, level), 3).map((prompt) => ({ prompt })) };
  }

  async submit(
    userId: string,
    input: {
      mode: PracticeModeName;
      prompt: string;
      response: string;
      responseMs?: number;
      timeLimitMs?: number;
      targetTone?: string;
      spoken?: boolean;
      speechConfidence?: number;
    },
  ) {
    const lang = await this.context.activeLanguage(userId);
    const evaluation = await this.assessment.assess(userId, lang, {
      kind: input.mode,
      prompt: input.prompt,
      response: input.response,
      responseMs: input.responseMs,
      timeLimitMs: input.timeLimitMs,
      targetTone: input.targetTone,
      spoken: input.spoken,
      speechConfidence: input.speechConfidence,
    });

    const dbMode = input.mode === 'speaking' ? 'SPEAKING' : input.mode === 'brain' ? 'BRAIN' : 'EMOTION';
    const today = new Date(`${dayKey()}T00:00:00.000Z`);
    const sessionsToday = await this.prisma.client.practiceSession.count({
      where: { userId, languageCode: lang, mode: dbMode, createdAt: { gte: today }, xpAwarded: { gt: 1 } },
    });
    const source = input.mode === 'speaking' && input.spoken ? 'speaking' : input.mode === 'brain' ? 'brain' : 'practice';
    const full = await this.gamification.rewardFor(source);
    const inTime = input.mode !== 'brain' || !input.timeLimitMs || (input.responseMs ?? Infinity) <= input.timeLimitMs;
    const base = sessionsToday < FULL_REWARD_SESSIONS_PER_DAY ? full : Math.min(full, 5);
    const reward = evaluation.overall >= 30 ? Math.round(base * (inTime ? 1 : 0.5)) : 1;

    const session = await this.prisma.client.practiceSession.create({
      data: {
        userId,
        languageCode: lang,
        mode: dbMode,
        prompt: input.prompt.slice(0, 500),
        response: input.response.slice(0, 2000),
        responseMs: input.responseMs,
        scores: evaluation.scores as unknown as Prisma.InputJsonValue,
        feedback: { feedback: evaluation.feedback, tone: evaluation.tone, improvedVersion: evaluation.improvedVersion } as Prisma.InputJsonValue,
        xpAwarded: reward,
      },
    });
    const speakingMinutes = input.spoken ? Math.max(1, Math.round((input.responseMs ?? 60_000) / 60_000)) : 0;
    const xp = await this.gamification.awardXp(userId, lang, source, reward, { refId: session.id, minutes: Math.max(1, speakingMinutes), speakingMinutes });
    return { evaluation, inTime, xpAwarded: reward, totalXp: xp.totalXp, newAchievements: xp.newAchievements };
  }

  async history(userId: string, mode?: PracticeModeName) {
    const lang = await this.context.activeLanguage(userId);
    const rows = await this.prisma.client.practiceSession.findMany({
      where: { userId, languageCode: lang, ...(mode ? { mode: mode === 'speaking' ? 'SPEAKING' : mode === 'brain' ? 'BRAIN' : 'EMOTION' } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, mode: true, prompt: true, response: true, scores: true, xpAwarded: true, createdAt: true },
    });
    return rows;
  }
}
