import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CoachService } from '../coach/coach.service';
import { DnaService } from '../dna/dna.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { MissionService } from '../missions/mission.service';
import { dayKey } from '../common/dates';
import { LearnerService } from './learner.service';

/** One round-trip for the dashboard: everything the learner sees on /home. */
@Injectable()
export class HomeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly learner: LearnerService,
    private readonly coach: CoachService,
    private readonly dna: DnaService,
    private readonly errors: ErrorMemoryService,
    private readonly missions: MissionService,
  ) {}

  async home(userId: string) {
    const me = await this.learner.me(userId);
    if (!me.targetLanguage) return { me, ready: false as const };
    const lang = me.targetLanguage.code;
    const startOfDay = new Date(`${dayKey()}T00:00:00.000Z`);

    const [coach, challenge, nextMission, dna, reviewDue, mistakes, xpToday, activeRun, achievements] = await Promise.all([
      this.coach.coach(userId).catch(() => null),
      this.coach.dailyChallenge(userId),
      this.missions.recommendNext(userId),
      this.dna.get(userId, lang),
      this.prisma.client.userVocabulary.count({
        where: { userId, vocabulary: { languageCode: lang }, nextReviewAt: { lte: new Date() }, status: { not: 'MASTERED' } },
      }),
      this.errors.summary(userId, lang),
      this.prisma.client.xpEvent.aggregate({
        where: { userId, languageCode: lang, createdAt: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      this.prisma.client.missionRun.findFirst({
        where: { userId, status: 'ACTIVE', mission: { languageCode: lang } },
        orderBy: { startedAt: 'desc' },
        select: { id: true, mission: { select: { title: true, slug: true } } },
      }),
      this.prisma.client.userAchievement.findMany({
        where: { userId },
        orderBy: { unlockedAt: 'desc' },
        take: 3,
        include: { achievement: { select: { code: true, title: true, icon: true } } },
      }),
    ]);

    return {
      ready: true as const,
      me,
      coach,
      challenge: {
        id: challenge.id,
        prompt: challenge.prompt,
        focus: challenge.focus,
        reason: challenge.reason,
        completed: Boolean(challenge.completedAt),
        xpAwarded: challenge.xpAwarded,
        feedback: challenge.feedback,
      },
      nextMission,
      activeRun: activeRun ? { id: activeRun.id, title: activeRun.mission.title, slug: activeRun.mission.slug } : null,
      dna,
      reviewDue,
      mistakes,
      xpToday: xpToday._sum.amount ?? 0,
      recentAchievements: achievements.map((a) => ({ ...a.achievement, unlockedAt: a.unlockedAt })),
    };
  }
}
