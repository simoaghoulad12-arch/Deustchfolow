import { Injectable } from '@nestjs/common';
import { DNA_DIMENSIONS, type DnaDimension } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { smoothScore } from '../adaptive/adaptive-engine';
import { dayKey } from '../common/dates';

export type DnaObservation = Partial<Record<DnaDimension, number>>;

/**
 * Language DNA (spec section 15): ten smoothed 0–100 dimensions per
 * learner and language, updated from every scored interaction, plus a
 * daily snapshot for trend charts. The coach and recommendation engine
 * read these values to decide what comes next.
 */
@Injectable()
export class DnaService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string, languageCode: string): Promise<Record<DnaDimension, number>> {
    const rows = await this.prisma.client.dnaScore.findMany({ where: { userId, languageCode } });
    const map = Object.fromEntries(DNA_DIMENSIONS.map((d) => [d, 0])) as Record<DnaDimension, number>;
    for (const row of rows) map[row.dimension as DnaDimension] = Math.round(row.score);
    return map;
  }

  async observe(userId: string, languageCode: string, observation: DnaObservation) {
    const db = this.prisma.client;
    const entries = Object.entries(observation).filter(
      (e): e is [DnaDimension, number] => typeof e[1] === 'number' && Number.isFinite(e[1]),
    );
    if (entries.length === 0) return [];

    const existing = await db.dnaScore.findMany({
      where: { userId, languageCode, dimension: { in: entries.map(([d]) => d) } },
    });
    const byDim = new Map(existing.map((r) => [r.dimension, r]));

    const changes = await db.$transaction(
      entries.map(([dimension, value]) => {
        const row = byDim.get(dimension);
        const score = smoothScore(row?.score ?? 0, row?.samples ?? 0, value);
        return db.dnaScore.upsert({
          where: { userId_languageCode_dimension: { userId, languageCode, dimension } },
          update: { score, samples: { increment: 1 } },
          create: { userId, languageCode, dimension, score, samples: 1 },
        });
      }),
    );

    await this.snapshot(userId, languageCode);

    return changes.map((row) => ({
      dimension: row.dimension as DnaDimension,
      before: Math.round(byDim.get(row.dimension)?.score ?? 0),
      after: Math.round(row.score),
    }));
  }

  async snapshot(userId: string, languageCode: string) {
    const [scores, stats] = await Promise.all([
      this.get(userId, languageCode),
      this.prisma.client.learnerStats.findUnique({ where: { userId_languageCode: { userId, languageCode } } }),
    ]);
    const day = dayKey();
    await this.prisma.client.dnaSnapshot.upsert({
      where: { userId_languageCode_day: { userId, languageCode, day } },
      update: { scores, xp: stats?.totalXp ?? 0 },
      create: { userId, languageCode, day, scores, xp: stats?.totalXp ?? 0 },
    });
  }
}
