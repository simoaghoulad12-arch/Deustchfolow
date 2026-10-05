import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CEFR_ORDER,
  type CEFRLevel,
  type KeyPhrase,
  type LearningSkill,
  type MissionCriterion,
  type MissionMode,
  type MissionSummary,
} from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';

const missionInclude = {
  environment: { select: { slug: true, name: true, icon: true, accent: true } },
  character: { select: { name: true, role: true, avatar: true, personality: true, speakingStyle: true } },
} satisfies Prisma.MissionInclude;

type MissionWithRelations = Prisma.MissionGetPayload<{ include: typeof missionInclude }>;

export function parseCriteria(value: unknown): MissionCriterion[] {
  return Array.isArray(value) ? (value as MissionCriterion[]) : [];
}

export function parseKeyPhrases(value: unknown): KeyPhrase[] {
  return Array.isArray(value) ? (value as KeyPhrase[]) : [];
}

/** A mission is playable at the learner's level and one level above (stretch), never further. */
export function isUnlocked(missionLevel: CEFRLevel, learnerLevel: CEFRLevel): boolean {
  return CEFR_ORDER[missionLevel] <= CEFR_ORDER[learnerLevel] + 1;
}

/**
 * Mission catalog + the Personal Language World (spec sections 9/10):
 * environments with their missions, per-learner status, and the "next
 * mission" recommendation that closes the learning loop.
 */
@Injectable()
export class MissionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
  ) {}

  private async learnerLevel(userId: string): Promise<CEFRLevel> {
    const profile = await this.prisma.client.learningProfile.findUnique({
      where: { userId },
      select: { currentLevel: true },
    });
    return (profile?.currentLevel ?? 'A1') as CEFRLevel;
  }

  private async runStatus(userId: string, missionIds: string[]) {
    const runs = await this.prisma.client.missionRun.findMany({
      where: { userId, missionId: { in: missionIds } },
      select: { missionId: true, status: true, score: true },
    });
    const byMission = new Map<string, { completed: boolean; active: boolean; best: number | null }>();
    for (const run of runs) {
      const entry = byMission.get(run.missionId) ?? { completed: false, active: false, best: null };
      if (run.status === 'COMPLETED') {
        entry.completed = true;
        entry.best = Math.max(entry.best ?? 0, run.score ?? 0);
      }
      if (run.status === 'ACTIVE') entry.active = true;
      byMission.set(run.missionId, entry);
    }
    return byMission;
  }

  toSummary(
    mission: MissionWithRelations,
    level: CEFRLevel,
    status?: { completed: boolean; active: boolean; best: number | null },
  ): MissionSummary {
    return {
      id: mission.id,
      slug: mission.slug,
      mode: mission.mode as MissionMode,
      title: mission.title,
      description: mission.description,
      objective: mission.objective,
      cefrLevel: mission.cefrLevel as CEFRLevel,
      difficulty: mission.difficulty,
      requiredSkills: mission.requiredSkills as LearningSkill[],
      estimatedMinutes: mission.estimatedMinutes,
      xpReward: mission.xpReward,
      environment: mission.environment,
      character: mission.character
        ? { name: mission.character.name, role: mission.character.role, avatar: mission.character.avatar }
        : null,
      status: !isUnlocked(mission.cefrLevel as CEFRLevel, level)
        ? 'locked'
        : status?.active
          ? 'in_progress'
          : status?.completed
            ? 'completed'
            : 'available',
      bestScore: status?.best ?? null,
    };
  }

  async world(userId: string) {
    const [lang, level] = await Promise.all([this.context.activeLanguage(userId), this.learnerLevel(userId)]);
    const environments = await this.prisma.client.worldEnvironment.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        missions: {
          where: { languageCode: lang, isActive: true, mode: 'MISSION' },
          orderBy: [{ cefrLevel: 'asc' }, { order: 'asc' }],
          include: missionInclude,
        },
      },
    });
    const status = await this.runStatus(
      userId,
      environments.flatMap((e) => e.missions.map((m) => m.id)),
    );

    return {
      languageCode: lang,
      level,
      environments: environments.map((env) => {
        const missions = env.missions.map((m) => this.toSummary(m, level, status.get(m.id)));
        return {
          slug: env.slug,
          name: env.name,
          description: env.description,
          icon: env.icon,
          accent: env.accent,
          minLevel: env.minLevel,
          unlocked: isUnlocked(env.minLevel as CEFRLevel, level),
          missionCount: missions.length,
          completedCount: missions.filter((m) => m.status === 'completed').length,
          missions,
        };
      }),
    };
  }

  async listByMode(userId: string, mode: MissionMode) {
    const [lang, level] = await Promise.all([this.context.activeLanguage(userId), this.learnerLevel(userId)]);
    const missions = await this.prisma.client.mission.findMany({
      where: { languageCode: lang, isActive: true, mode },
      orderBy: [{ chapter: 'asc' }, { cefrLevel: 'asc' }, { order: 'asc' }],
      include: { ...missionInclude, story: { select: { slug: true, title: true, description: true } } },
    });
    const status = await this.runStatus(userId, missions.map((m) => m.id));
    return missions.map((m) => ({
      ...this.toSummary(m, level, status.get(m.id)),
      chapter: m.chapter,
      story: m.story,
      extra: publicExtra(m.extra),
    }));
  }

  async detail(userId: string, slug: string) {
    const [lang, level] = await Promise.all([this.context.activeLanguage(userId), this.learnerLevel(userId)]);
    const mission = await this.prisma.client.mission.findUnique({
      where: { languageCode_slug: { languageCode: lang, slug } },
      include: missionInclude,
    });
    if (!mission || !mission.isActive) throw new NotFoundException('Mission not found.');
    const status = await this.runStatus(userId, [mission.id]);
    const activeRun = await this.prisma.client.missionRun.findFirst({
      where: { userId, missionId: mission.id, status: 'ACTIVE' },
      select: { id: true },
    });
    return {
      ...this.toSummary(mission, level, status.get(mission.id)),
      scenario: mission.scenario,
      grammarFocus: mission.grammarFocus,
      keyPhrases: parseKeyPhrases(mission.keyPhrases),
      goals: parseCriteria(mission.criteria).map((c) => ({ id: c.id, description: c.description })),
      characterDetail: mission.character,
      extra: publicExtra(mission.extra),
      activeRunId: activeRun?.id ?? null,
    };
  }

  /**
   * Next-mission recommendation: the first uncompleted, unlocked mission
   * at the learner's level, preferring ones that train their weakest
   * Language DNA skill, then world order.
   */
  async recommendNext(userId: string, excludeMissionId?: string) {
    const [lang, level] = await Promise.all([this.context.activeLanguage(userId), this.learnerLevel(userId)]);
    const levels = (Object.keys(CEFR_ORDER) as CEFRLevel[]).filter((l) => isUnlocked(l, level));
    const candidates = await this.prisma.client.mission.findMany({
      where: {
        languageCode: lang,
        isActive: true,
        mode: 'MISSION',
        cefrLevel: { in: levels },
        id: excludeMissionId ? { not: excludeMissionId } : undefined,
        runs: { none: { userId, status: 'COMPLETED' } },
      },
      include: { ...missionInclude, environment: { select: { slug: true, name: true, icon: true, accent: true, order: true } } },
      take: 60,
    });
    if (candidates.length === 0) return null;

    const dna = await this.prisma.client.dnaScore.findMany({
      where: { userId, languageCode: lang, dimension: { in: ['SPEAKING', 'LISTENING', 'READING', 'WRITING', 'GRAMMAR', 'VOCABULARY'] } },
      orderBy: { score: 'asc' },
      take: 1,
    });
    const weakest = dna[0]?.dimension;

    const ranked = [...candidates].sort((a, b) => {
      const levelDiff = Math.abs(CEFR_ORDER[a.cefrLevel as CEFRLevel] - CEFR_ORDER[level]) - Math.abs(CEFR_ORDER[b.cefrLevel as CEFRLevel] - CEFR_ORDER[level]);
      if (levelDiff !== 0) return levelDiff;
      const weakA = weakest && a.requiredSkills.includes(weakest as LearningSkill) ? -1 : 0;
      const weakB = weakest && b.requiredSkills.includes(weakest as LearningSkill) ? -1 : 0;
      if (weakA !== weakB) return weakA - weakB;
      return (a.environment?.order ?? 99) - (b.environment?.order ?? 99) || a.order - b.order;
    });
    const best = ranked[0];
    return best ? this.toSummary(best, level) : null;
  }
}

/** Strip anything that would spoil the scenario (e.g. hidden twists) before it reaches the browser. */
function publicExtra(extra: unknown): Record<string, unknown> | null {
  if (!extra || typeof extra !== 'object') return null;
  const { twists: _twists, closingLine: _closing, ...rest } = extra as Record<string, unknown>;
  return rest;
}
