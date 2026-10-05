import { ConflictException, Injectable } from '@nestjs/common';
import {
  DNA_LABELS,
  MISTAKE_CATEGORY_LABELS,
  type CEFRLevel,
  type CoachMessage,
  type DnaDimension,
  type MistakeCategory,
} from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SCHEMA } from '../../ai/providers/mock/contracts';
import { ImmersionAiService } from '../ai/immersion-ai.service';
import { CoachSchema } from '../ai/immersion-schemas';
import { coachPrompt } from '../ai/immersion-prompts';
import { ImmersionContextService } from '../context/immersion-context.service';
import { DnaService } from '../dna/dna.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { GamificationService } from '../gamification/gamification.service';
import { MissionService } from '../missions/mission.service';
import { AssessmentService } from '../practice/assessment.service';
import { dayKey, daysAgo } from '../common/dates';

const DIM_TO_FOCUS: Partial<Record<DnaDimension, string>> = {
  SPEAKING: 'speaking',
  PRONUNCIATION: 'speaking',
  FLUENCY: 'speaking',
  RESPONSE_SPEED: 'speaking',
  GRAMMAR: 'grammar',
  ACCURACY: 'grammar',
  VOCABULARY: 'vocabulary',
  WRITING: 'writing',
  READING: 'reading',
  LISTENING: 'listening',
};

const CATEGORY_TO_FOCUS: Record<MistakeCategory, string> = {
  GRAMMAR: 'grammar',
  SENTENCE_STRUCTURE: 'grammar',
  VOCABULARY: 'vocabulary',
  WORD_CHOICE: 'vocabulary',
  SPELLING: 'writing',
  PRONUNCIATION: 'speaking',
  REGISTER: 'speaking',
};

/**
 * AI Personal Coach + Recommendation engine + Daily Challenge (spec
 * sections 16/26). The analysis is computed from the learner's real data
 * (AI suggests, the learning engine decides); the AI only phrases it
 * personally, and the offline engine returns the draft unchanged.
 */
@Injectable()
export class CoachService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: ImmersionAiService,
    private readonly context: ImmersionContextService,
    private readonly dna: DnaService,
    private readonly errors: ErrorMemoryService,
    private readonly gamification: GamificationService,
    private readonly missions: MissionService,
    private readonly assessment: AssessmentService,
  ) {}

  async analyse(userId: string, languageCode: string) {
    const db = this.prisma.client;
    const now = new Date();
    const [dnaRows, stats, recurring, xpThisWeek, xpLastWeek, reviewDue, missionsThisWeek] = await Promise.all([
      db.dnaScore.findMany({ where: { userId, languageCode, samples: { gt: 0 } } }),
      this.gamification.ensureStats(userId, languageCode),
      this.errors.recurring(userId, languageCode, 3),
      db.xpEvent.aggregate({ where: { userId, languageCode, createdAt: { gte: daysAgo(7, now) } }, _sum: { amount: true } }),
      db.xpEvent.aggregate({
        where: { userId, languageCode, createdAt: { gte: daysAgo(14, now), lt: daysAgo(7, now) } },
        _sum: { amount: true },
      }),
      db.userVocabulary.count({
        where: { userId, vocabulary: { languageCode }, nextReviewAt: { lte: now }, status: { not: 'MASTERED' } },
      }),
      db.missionRun.count({ where: { userId, status: 'COMPLETED', completedAt: { gte: daysAgo(7, now) }, mission: { languageCode } } }),
    ]);
    const sorted = [...dnaRows].sort((a, b) => a.score - b.score);
    return {
      weakest: sorted[0] ? { dimension: sorted[0].dimension as DnaDimension, score: Math.round(sorted[0].score) } : null,
      strongest: sorted.length > 1 ? { dimension: sorted[sorted.length - 1]!.dimension as DnaDimension, score: Math.round(sorted[sorted.length - 1]!.score) } : null,
      stats,
      recurring,
      xpThisWeek: xpThisWeek._sum.amount ?? 0,
      xpLastWeek: xpLastWeek._sum.amount ?? 0,
      reviewDue,
      missionsThisWeek,
    };
  }

  async coach(userId: string): Promise<CoachMessage & { aiAvailable: boolean }> {
    const lang = await this.context.activeLanguage(userId);
    const a = await this.analyse(userId, lang);
    const learner = await this.context.learner(userId, lang);
    const next = await this.missions.recommendNext(userId);

    const insights: string[] = [];
    if (a.xpThisWeek > 0) {
      const delta = a.xpLastWeek > 0 ? Math.round(((a.xpThisWeek - a.xpLastWeek) / a.xpLastWeek) * 100) : null;
      insights.push(
        `You earned ${a.xpThisWeek} XP in the last 7 days${delta != null ? ` (${delta >= 0 ? '+' : ''}${delta}% vs. the week before)` : ''} and completed ${a.missionsThisWeek} mission${a.missionsThisWeek === 1 ? '' : 's'}.`,
      );
    }
    if (a.strongest && a.strongest.score >= 50) {
      insights.push(`${DNA_LABELS[a.strongest.dimension]} is your strongest area right now (${a.strongest.score}%).`);
    }
    if (a.weakest) {
      insights.push(`${DNA_LABELS[a.weakest.dimension]} is your biggest opportunity (${a.weakest.score}%).`);
    }
    const top = a.recurring[0];
    if (top) {
      insights.push(
        `A recurring pattern: you wrote “${top.original}” ${top.frequency} times — the natural version is “${top.corrected}”.`,
      );
    }
    if (a.stats.currentStreak >= 2) insights.push(`You're on a ${a.stats.currentStreak}-day streak. Keep it alive today.`);
    if (insights.length === 0) {
      insights.push(`Your plan is ready. Your first conversation will calibrate your Language DNA.`);
    }

    let recommendation: CoachMessage['recommendation'];
    const weakFocus = a.weakest ? DIM_TO_FOCUS[a.weakest.dimension] : undefined;
    if (a.reviewDue >= 10) {
      recommendation = { title: `Review ${a.reviewDue} words`, href: '/vocabulary', minutes: 5, reason: 'Spaced repetition works best when reviews happen on time.' };
    } else if (top && top.frequency >= 3) {
      recommendation = { title: 'Fix your top mistake', href: '/mistakes', minutes: 5, reason: `“${top.original}” keeps coming back — three correct uses in a row will master it.` };
    } else if (weakFocus === 'speaking' && a.stats.totalXp > 0) {
      recommendation = { title: '10-minute speaking session', href: '/speak', minutes: 10, reason: 'Speaking is where you will gain the most this week.' };
    } else if (weakFocus === 'grammar' && a.stats.totalXp > 0) {
      recommendation = { title: 'Grammar in context', href: '/grammar', minutes: 10, reason: learner.weakGrammar[0] ? `Your weakest topic is ${learner.weakGrammar[0]}.` : 'Grammar accuracy is your biggest opportunity.' };
    } else if (next) {
      recommendation = { title: next.title, href: `/missions/${next.slug}`, minutes: next.estimatedMinutes, reason: `A ${next.cefrLevel} mission matched to your level${weakFocus ? ` that trains ${weakFocus}` : ''}.` };
    } else {
      recommendation = { title: 'Brain mode sprint', href: '/brain', minutes: 5, reason: 'Train spontaneous answers under time pressure.' };
    }

    const name = (await this.prisma.client.userProfile.findUnique({ where: { userId }, select: { displayName: true } }))?.displayName;
    const headline =
      a.stats.totalXp === 0
        ? `Welcome${name ? `, ${name}` : ''}! Let's start with a real conversation.`
        : a.weakest && a.strongest
          ? `${DNA_LABELS[a.strongest.dimension]} is growing — now let's lift your ${DNA_LABELS[a.weakest.dimension].toLowerCase()}.`
          : `Nice work${name ? `, ${name}` : ''}. Here's what I recommend today.`;

    const { data, aiAvailable } = await this.ai.complete({
      userId,
      feature: 'coach',
      systemPrompt: coachPrompt({ learner, draft: { headline, insights, recommendationReason: recommendation.reason } }),
      userMessage: 'Write my coach message for today.',
      schema: CoachSchema,
      schemaName: SCHEMA.coach,
      schemaDescription: 'A personal coach message.',
      metered: false,
    });

    return {
      headline: data.headline,
      insights: data.insights,
      recommendation: { ...recommendation, reason: data.recommendationReason },
      aiAvailable,
    };
  }

  /** Today's personalised challenge, created on first request of the day. */
  async dailyChallenge(userId: string) {
    const lang = await this.context.activeLanguage(userId);
    const day = dayKey();
    const existing = await this.prisma.client.dailyChallenge.findUnique({
      where: { userId_languageCode_day: { userId, languageCode: lang, day } },
    });
    if (existing) return existing;

    const profile = await this.prisma.client.learningProfile.findUnique({ where: { userId }, select: { currentLevel: true } });
    const level = (profile?.currentLevel ?? 'A1') as CEFRLevel;
    const a = await this.analyse(userId, lang);
    const top = a.recurring[0];
    const focus = top
      ? CATEGORY_TO_FOCUS[top.category as MistakeCategory]
      : a.weakest
        ? (DIM_TO_FOCUS[a.weakest.dimension] ?? 'speaking')
        : 'speaking';
    const reason = top
      ? `Built around your recurring ${MISTAKE_CATEGORY_LABELS[top.category as MistakeCategory].toLowerCase()} mistake (“${top.original}”).`
      : a.weakest
        ? `Targets your weakest Language DNA area: ${DNA_LABELS[a.weakest.dimension]}.`
        : 'A great first challenge to get you talking.';

    const templates = await this.prisma.client.challengeTemplate.findMany({
      where: { languageCode: lang, cefrLevel: level, isActive: true },
    });
    const pool = templates.filter((t) => t.focus === focus);
    const chosenPool = pool.length ? pool : templates;
    // Deterministic per user+day so a refresh never changes today's challenge.
    const seed = [...`${userId}${day}`].reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const template = chosenPool[seed % Math.max(chosenPool.length, 1)];
    const prompt = template?.prompt ?? 'Describe your day so far in three or four sentences.';

    return this.prisma.client.dailyChallenge.upsert({
      where: { userId_languageCode_day: { userId, languageCode: lang, day } },
      update: {},
      create: { userId, languageCode: lang, day, prompt, focus: template?.focus ?? focus, reason },
    });
  }

  async submitChallenge(userId: string, response: string, meta: { spoken?: boolean; speechConfidence?: number }) {
    const challenge = await this.dailyChallenge(userId);
    if (challenge.completedAt) throw new ConflictException('Today\'s challenge is already completed.');
    const evaluation = await this.assessment.assess(userId, challenge.languageCode, {
      kind: 'challenge',
      prompt: challenge.prompt,
      response,
      spoken: meta.spoken,
      speechConfidence: meta.speechConfidence,
    });
    const reward = await this.gamification.rewardFor('daily_challenge');
    const claimed = await this.prisma.client.dailyChallenge.updateMany({
      where: { id: challenge.id, completedAt: null },
      data: {
        response,
        feedback: evaluation as unknown as Prisma.InputJsonValue,
        completedAt: new Date(),
        xpAwarded: reward,
      },
    });
    if (claimed.count === 0) throw new ConflictException('Today\'s challenge is already completed.');
    const xp = await this.gamification.awardXp(userId, challenge.languageCode, 'daily_challenge', reward, {
      refId: challenge.id,
      minutes: 3,
      speakingMinutes: meta.spoken ? 2 : 0,
    });
    return { evaluation, xpAwarded: reward, totalXp: xp.totalXp, newAchievements: xp.newAchievements };
  }
}
