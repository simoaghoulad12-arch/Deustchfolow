import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import type {
  CEFRLevel,
  ChatTurn,
  Correction,
  DnaDimension,
  MissionCompletion,
  MissionTurnResult,
} from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  SCHEMA,
  type MissionContextPayload,
} from '../../ai/providers/mock/contracts';
import { ImmersionAiService } from '../ai/immersion-ai.service';
import { ChaosTwistSchema, MissionHintSchema, MissionTurnSchema } from '../ai/immersion-schemas';
import { chaosTwistPrompt, missionHintPrompt, missionTurnPrompt } from '../ai/immersion-prompts';
import { ImmersionContextService } from '../context/immersion-context.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { GamificationService } from '../gamification/gamification.service';
import { DnaService } from '../dna/dna.service';
import { difficultyProfile, nextDifficulty, nextProficiency } from '../adaptive/adaptive-engine';
import { average, clamp } from '../common/math';
import { MissionService, parseCriteria, parseKeyPhrases } from './mission.service';

const HISTORY_LIMIT = 14;

interface RunState {
  twist?: { title: string; situation: string; openingLine: string };
  choice?: { id: string; label: string; consequence?: string };
  stance?: string;
  dnaStart?: Record<string, number>;
  turnScores?: { grammar: number; vocabulary: number; fluency: number; task: number }[];
  corrections?: Correction[];
}

interface MessageMeta {
  kind?: 'hint' | 'system';
  correction?: Correction | null;
  hintLevel?: number;
  responseMs?: number;
}

const runInclude = {
  mission: {
    include: {
      character: true,
      environment: { select: { slug: true, name: true, icon: true, accent: true } },
    },
  },
  conversation: { include: { messages: { orderBy: { createdAt: 'asc' as const } } } },
} satisfies Prisma.MissionRunInclude;

type RunWithRelations = Prisma.MissionRunGetPayload<{ include: typeof runInclude }>;

/**
 * The AI conversation engine (spec sections 11/12/36): starts mission
 * runs, plays each turn through the AI character with full learner
 * context, applies natural (rationed) corrections, feeds error memory,
 * Language DNA and the adaptive engine, serves progressive hints and
 * completes the mission with XP and the next recommendation.
 */
@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ai: ImmersionAiService,
    private readonly context: ImmersionContextService,
    private readonly errors: ErrorMemoryService,
    private readonly gamification: GamificationService,
    private readonly dna: DnaService,
    private readonly missions: MissionService,
  ) {}

  async start(userId: string, slug: string, options: { choiceId?: string } = {}) {
    const lang = await this.context.activeLanguage(userId);
    const mission = await this.prisma.client.mission.findUnique({
      where: { languageCode_slug: { languageCode: lang, slug } },
      include: { character: true },
    });
    if (!mission || !mission.isActive) throw new NotFoundException('Mission not found.');

    const existing = await this.prisma.client.missionRun.findFirst({
      where: { userId, missionId: mission.id, status: 'ACTIVE' },
      select: { id: true },
    });
    if (existing) return { runId: existing.id };

    const stats = await this.gamification.ensureStats(userId, lang);
    const extra = (mission.extra ?? {}) as Record<string, unknown>;
    const state: RunState = { dnaStart: await this.dna.get(userId, lang), turnScores: [], corrections: [] };
    let opening = mission.openingLine;

    if (mission.mode === 'CHAOS') {
      const learner = await this.context.learner(userId, lang);
      const twists = Array.isArray(extra.twists) ? (extra.twists as RunState['twist'][]) : [];
      if (twists.length > 0) {
        const { data } = await this.ai.complete({
          userId,
          feature: 'chaos_twist',
          systemPrompt: chaosTwistPrompt({ learner, twists: twists.filter(Boolean) as NonNullable<RunState['twist']>[] }),
          userMessage: 'Generate the twist.',
          schema: ChaosTwistSchema,
          schemaName: SCHEMA.chaosTwist,
          schemaDescription: 'An unexpected real-life twist for Chaos mode.',
        });
        state.twist = data;
        opening = data.openingLine;
      }
    }
    if (mission.mode === 'STORY') {
      const choices = Array.isArray(extra.choices) ? (extra.choices as NonNullable<RunState['choice']>[]) : [];
      const choice = choices.find((c) => c.id === options.choiceId) ?? choices[0];
      if (choice) state.choice = choice;
    }
    if (mission.mode === 'DEBATE' && typeof extra.stance === 'string') {
      state.stance = extra.stance;
    }

    const run = await this.prisma.client.$transaction(async (tx) => {
      const conversation = await tx.conversationSession.create({
        data: {
          userId,
          title: mission.title,
          messages: { create: { role: 'ASSISTANT', content: opening, metadata: { kind: 'system' } } },
        },
      });
      return tx.missionRun.create({
        data: {
          userId,
          missionId: mission.id,
          conversationId: conversation.id,
          difficulty: stats.difficulty,
          state: state as unknown as Prisma.InputJsonValue,
        },
      });
    });
    return { runId: run.id };
  }

  private async loadRun(userId: string, runId: string): Promise<RunWithRelations> {
    const run = await this.prisma.client.missionRun.findFirst({
      where: { id: runId, userId },
      include: runInclude,
    });
    if (!run) throw new NotFoundException('Mission run not found.');
    return run;
  }

  private toTurns(run: RunWithRelations): ChatTurn[] {
    return run.conversation.messages.map((m) => {
      const meta = (m.metadata ?? {}) as MessageMeta;
      return {
        id: m.id,
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
        correction: meta.correction ?? null,
        hint: meta.kind === 'hint' ? { level: meta.hintLevel ?? 1, text: m.content } : null,
        createdAt: m.createdAt.toISOString(),
      };
    });
  }

  async get(userId: string, runId: string) {
    const run = await this.loadRun(userId, runId);
    const criteria = parseCriteria(run.mission.criteria);
    const state = (run.state ?? {}) as RunState;
    return {
      id: run.id,
      status: run.status,
      score: run.score,
      xpAwarded: run.xpAwarded,
      hintsUsed: run.hintsUsed,
      maxHintLevel: difficultyProfile(run.difficulty).maxHintLevel,
      difficulty: run.difficulty,
      mission: {
        slug: run.mission.slug,
        title: run.mission.title,
        mode: run.mission.mode,
        objective: run.mission.objective,
        scenario: state.twist ? `${state.twist.title}: ${state.twist.situation}` : run.mission.scenario,
        cefrLevel: run.mission.cefrLevel,
        xpReward: run.mission.xpReward,
        keyPhrases: parseKeyPhrases(run.mission.keyPhrases),
        environment: run.mission.environment,
        character: run.mission.character
          ? { name: run.mission.character.name, role: run.mission.character.role, avatar: run.mission.character.avatar }
          : null,
      },
      goals: criteria.map((c) => ({ id: c.id, description: c.description, met: run.criteriaMet.includes(c.id) })),
      state: { twist: state.twist ?? null, choice: state.choice ?? null, stance: state.stance ?? null },
      turns: this.toTurns(run),
    };
  }

  private async buildContext(userId: string, run: RunWithRelations, correctionAllowed: boolean, hintLevel?: number): Promise<MissionContextPayload> {
    const learner = await this.context.learner(userId, run.mission.languageCode);
    learner.difficulty = run.difficulty;
    const criteria = parseCriteria(run.mission.criteria);
    const state = (run.state ?? {}) as RunState;
    const extra = (run.mission.extra ?? {}) as Record<string, unknown>;
    const c = run.mission.character;
    return {
      learner,
      mission: {
        title: run.mission.title,
        mode: run.mission.mode,
        scenario: run.mission.scenario,
        objective: run.mission.objective,
        grammarFocus: run.mission.grammarFocus,
        keyPhrases: parseKeyPhrases(run.mission.keyPhrases),
        criteria: criteria.map((cr) => ({ ...cr, met: run.criteriaMet.includes(cr.id) })),
        character: c ? { name: c.name, role: c.role, personality: c.personality, speakingStyle: c.speakingStyle } : null,
        state: { twist: state.twist ?? null, choice: state.choice ?? null, stance: state.stance ?? null },
        closingLine: typeof extra.closingLine === 'string' ? extra.closingLine : null,
      },
      turnNumber: run.turnCount + 1,
      hintLevel,
      correctionAllowed,
    };
  }

  async turn(
    userId: string,
    runId: string,
    input: { text: string; responseMs?: number; spoken?: boolean; speechConfidence?: number },
  ): Promise<MissionTurnResult> {
    const text = input.text.trim();
    if (!text) throw new BadRequestException('Message must not be empty.');
    const run = await this.loadRun(userId, runId);
    if (run.status !== 'ACTIVE') throw new ConflictException('This mission run has already ended.');

    const profile = difficultyProfile(run.difficulty);
    const correctionAllowed = (run.turnCount + 1) % profile.correctionEveryNTurns === 0 || run.turnCount === 0;
    const ctx = await this.buildContext(userId, run, correctionAllowed);

    const history = run.conversation.messages
      .filter((m) => ((m.metadata ?? {}) as MessageMeta).kind !== 'hint')
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role === 'USER' ? ('user' as const) : ('assistant' as const), content: m.content }));

    const { data, aiAvailable } = await this.ai.complete({
      userId,
      feature: 'mission_turn',
      systemPrompt: missionTurnPrompt(ctx),
      userMessage: text,
      history,
      schema: MissionTurnSchema,
      schemaName: SCHEMA.missionTurn,
      schemaDescription: 'The character reply, optional natural correction, criteria met and scores.',
      maxOutputTokens: 700,
    });

    const validIds = new Set(ctx.mission.criteria.map((c) => c.id));
    const newlyMet = data.criteriaMet.filter((id) => validIds.has(id) && !run.criteriaMet.includes(id));
    const criteriaMet = [...run.criteriaMet, ...newlyMet];
    const correction = correctionAllowed ? data.correction : null;
    const state = (run.state ?? {}) as RunState;
    state.turnScores = [...(state.turnScores ?? []), data.scores];
    if (correction) state.corrections = [...(state.corrections ?? []), correction];

    const [userMsg, aiMsg] = await this.prisma.client.$transaction([
      this.prisma.client.conversationMessage.create({
        data: {
          sessionId: run.conversationId,
          role: 'USER',
          content: text,
          metadata: { correction, responseMs: input.responseMs } as unknown as Prisma.InputJsonValue,
        },
      }),
      this.prisma.client.conversationMessage.create({
        data: { sessionId: run.conversationId, role: 'ASSISTANT', content: data.reply },
      }),
      this.prisma.client.missionRun.update({
        where: { id: run.id },
        data: {
          turnCount: { increment: 1 },
          criteriaMet,
          scores: averageScores(state.turnScores) as unknown as Prisma.InputJsonValue,
          state: state as unknown as Prisma.InputJsonValue,
        },
      }),
    ]);

    if (correction) await this.errors.record(userId, run.mission.languageCode, correction, 'mission');

    const observation: Partial<Record<DnaDimension, number>> = {
      GRAMMAR: data.scores.grammar,
      ACCURACY: data.scores.grammar,
      VOCABULARY: data.scores.vocabulary,
      FLUENCY: data.scores.fluency,
      [input.spoken ? 'SPEAKING' : 'WRITING']: average([data.scores.grammar, data.scores.vocabulary, data.scores.fluency]),
    };
    if (input.spoken && input.speechConfidence != null) {
      observation.PRONUNCIATION = clamp(Math.round(input.speechConfidence * 100), 0, 100);
    }
    if (input.responseMs != null) {
      observation.RESPONSE_SPEED = clamp(100 - (input.responseMs / 1000 - 4) * 4, 10, 100);
    }
    await this.dna.observe(userId, run.mission.languageCode, observation);

    const allMet = validIds.size > 0 && criteriaMet.length >= validIds.size;
    const completion = allMet || data.objectiveComplete ? await this.complete(userId, run.id) : null;

    return {
      runId: run.id,
      userTurn: {
        id: userMsg.id,
        role: 'user',
        content: text,
        correction,
        createdAt: userMsg.createdAt.toISOString(),
      },
      reply: { id: aiMsg.id, role: 'assistant', content: data.reply, createdAt: aiMsg.createdAt.toISOString() },
      criteriaMet,
      totalCriteria: validIds.size,
      completion,
      aiAvailable,
    };
  }

  async hint(userId: string, runId: string) {
    const run = await this.loadRun(userId, runId);
    if (run.status !== 'ACTIVE') throw new ConflictException('This mission run has already ended.');
    const maxLevel = difficultyProfile(run.difficulty).maxHintLevel;
    const level = Math.min(run.hintsUsed + 1, maxLevel);
    const ctx = await this.buildContext(userId, run, false, level);
    const { data } = await this.ai.complete({
      userId,
      feature: 'mission_hint',
      systemPrompt: missionHintPrompt(ctx),
      userMessage: `Hint level ${level}, please.`,
      schema: MissionHintSchema,
      schemaName: SCHEMA.missionHint,
      schemaDescription: 'A progressive hint for the next mission goal.',
      metered: false,
    });
    const message = await this.prisma.client.conversationMessage.create({
      data: {
        sessionId: run.conversationId,
        role: 'ASSISTANT',
        content: data.text,
        metadata: { kind: 'hint', hintLevel: level },
      },
    });
    await this.prisma.client.missionRun.update({ where: { id: run.id }, data: { hintsUsed: { increment: 1 } } });
    return {
      level,
      maxLevel,
      turn: {
        id: message.id,
        role: 'assistant',
        content: data.text,
        hint: { level, text: data.text },
        createdAt: message.createdAt.toISOString(),
      } satisfies ChatTurn,
    };
  }

  /** Learner ends the mission early: completes if at least half the goals were reached, else abandons. */
  async finish(userId: string, runId: string) {
    const run = await this.loadRun(userId, runId);
    if (run.status !== 'ACTIVE') throw new ConflictException('This mission run has already ended.');
    const total = parseCriteria(run.mission.criteria).length;
    if (total > 0 && run.criteriaMet.length / total >= 0.5) {
      return { status: 'COMPLETED' as const, completion: await this.complete(userId, run.id) };
    }
    await this.prisma.client.missionRun.update({
      where: { id: run.id },
      data: { status: 'ABANDONED', completedAt: new Date() },
    });
    return { status: 'ABANDONED' as const, completion: null };
  }

  async complete(userId: string, runId: string): Promise<MissionCompletion> {
    const run = await this.loadRun(userId, runId);
    const lang = run.mission.languageCode;
    const state = (run.state ?? {}) as RunState;
    const criteria = parseCriteria(run.mission.criteria);
    const avg = averageScores(state.turnScores ?? []);
    const taskScore = criteria.length ? (run.criteriaMet.length / criteria.length) * 100 : 100;
    const score = Math.round(
      clamp(taskScore * 0.4 + avg.grammar * 0.2 + avg.vocabulary * 0.2 + avg.fluency * 0.2 - run.hintsUsed * 2, 0, 100),
    );

    const claimed = await this.prisma.client.missionRun.updateMany({
      where: { id: run.id, status: 'ACTIVE' },
      data: { status: 'COMPLETED', score, completedAt: new Date() },
    });
    if (claimed.count === 0) {
      // Already completed concurrently — never double-award XP.
      throw new ConflictException('This mission run has already ended.');
    }

    const source = run.mission.mode === 'DAILY' ? 'daily_challenge' : 'mission';
    const base = await this.gamification.rewardFor(source);
    const reward = run.mission.xpReward || base;
    const xp = Math.round(reward * (0.5 + score / 200));
    const minutes = clamp((Date.now() - run.startedAt.getTime()) / 60_000, 1, 60);
    const xpResult = await this.gamification.awardXp(userId, lang, source, xp, { refId: run.id, minutes });
    await this.prisma.client.missionRun.update({ where: { id: run.id }, data: { xpAwarded: xp } });

    // Adaptive engine: performance moves difficulty and the proficiency estimate.
    const stats = await this.gamification.ensureStats(userId, lang);
    await this.prisma.client.learnerStats.update({
      where: { id: stats.id },
      data: {
        difficulty: nextDifficulty(stats.difficulty, score, run.hintsUsed),
        proficiency: nextProficiency(stats.proficiency, run.mission.cefrLevel as CEFRLevel, score),
      },
    });

    await this.addKeyPhrasesToDeck(userId, lang, run);

    const dnaNow = await this.dna.get(userId, lang);
    const dnaChanges = (Object.keys(dnaNow) as DnaDimension[])
      .map((d) => ({ dimension: d, before: Math.round(state.dnaStart?.[d] ?? 0), after: dnaNow[d] }))
      .filter((c) => c.after !== c.before);

    const highlights: string[] = [];
    if (taskScore >= 100) highlights.push('You reached every goal of the mission.');
    if (avg.grammar >= 80) highlights.push('Your sentences were grammatically strong.');
    if (avg.vocabulary >= 75) highlights.push('You used the key vocabulary naturally.');
    if (run.hintsUsed === 0) highlights.push('You did it without any hints.');
    if (highlights.length === 0) highlights.push('You kept the conversation going — that is what counts.');

    const practiceNext = (state.corrections ?? []).slice(0, 3).map((c) => `${c.better} — ${c.explanation}`);
    const next = await this.missions.recommendNext(userId, run.missionId);

    return {
      score,
      xpAwarded: xp,
      totalXp: xpResult.totalXp,
      streak: xpResult.streak,
      newAchievements: xpResult.newAchievements,
      dnaChanges,
      highlights,
      practiceNext,
      nextMission: next
        ? { slug: next.slug, title: next.title, cefrLevel: next.cefrLevel, estimatedMinutes: next.estimatedMinutes }
        : null,
    };
  }

  /** Mission vocabulary flows into the learner's spaced-repetition deck. */
  private async addKeyPhrasesToDeck(userId: string, languageCode: string, run: RunWithRelations) {
    // Vocabulary rows store the bare word (article separately), so match
    // the whole phrase and its last word ("die Rechnung" → "rechnung").
    const terms = parseKeyPhrases(run.mission.keyPhrases).flatMap((p) => {
      const lower = p.term.trim().toLowerCase().replace(/[.!?,]/g, '');
      return [lower, lower.split(/\s+/).pop() ?? lower];
    });
    if (terms.length === 0) return;
    const vocab = await this.prisma.client.vocabulary.findMany({
      where: { languageCode, normalizedWord: { in: terms } },
      select: { id: true },
    });
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.client.userVocabulary.createMany({
      data: vocab.map((v) => ({ userId, vocabularyId: v.id, status: 'LEARNING' as const, nextReviewAt: tomorrow })),
      skipDuplicates: true,
    });
  }
}

function averageScores(scores: { grammar: number; vocabulary: number; fluency: number; task: number }[]) {
  return {
    grammar: Math.round(average(scores.map((s) => s.grammar))),
    vocabulary: Math.round(average(scores.map((s) => s.vocabulary))),
    fluency: Math.round(average(scores.map((s) => s.fluency))),
    task: Math.round(average(scores.map((s) => s.task))),
  };
}
