import { Injectable } from '@nestjs/common';
import type { Correction } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { mistakeKey, nextMastery } from './mistake-key';

/**
 * Personal error memory (spec section 13). Every correction the AI makes
 * is stored once per distinct mistake; repeats bump `frequency` and reset
 * mastery. Mistakes with frequency ≥ 2 feed future practice: daily
 * challenges, review sessions and the AI context.
 */
@Injectable()
export class ErrorMemoryService {
  constructor(private readonly prisma: PrismaService) {}

  async record(userId: string, languageCode: string, correction: Correction, source: string) {
    const key = mistakeKey(correction.original, correction.better);
    return this.prisma.client.mistake.upsert({
      where: { userId_languageCode_key: { userId, languageCode, key } },
      update: {
        frequency: { increment: 1 },
        correctStreak: 0,
        masteryState: 'NEW',
        lastSeenAt: new Date(),
        explanation: correction.explanation,
      },
      create: {
        userId,
        languageCode,
        key,
        category: correction.category,
        original: correction.original,
        corrected: correction.better,
        explanation: correction.explanation,
        source,
      },
    });
  }

  async list(userId: string, languageCode: string, filter: { state?: 'NEW' | 'PRACTICING' | 'MASTERED' } = {}) {
    return this.prisma.client.mistake.findMany({
      where: { userId, languageCode, ...(filter.state ? { masteryState: filter.state } : {}) },
      orderBy: [{ masteryState: 'asc' }, { frequency: 'desc' }, { lastSeenAt: 'desc' }],
      take: 100,
    });
  }

  /** Recurring, not-yet-mastered mistakes — the input for auto-generated practice. */
  async recurring(userId: string, languageCode: string, take = 5) {
    return this.prisma.client.mistake.findMany({
      where: { userId, languageCode, masteryState: { not: 'MASTERED' }, frequency: { gte: 2 } },
      orderBy: [{ frequency: 'desc' }, { lastSeenAt: 'desc' }],
      take,
    });
  }

  /** The learner practised a stored mistake; `correct` says whether they produced the corrected form. */
  async practice(userId: string, mistakeId: string, correct: boolean) {
    const mistake = await this.prisma.client.mistake.findFirst({ where: { id: mistakeId, userId } });
    if (!mistake) return null;
    const correctStreak = correct ? mistake.correctStreak + 1 : 0;
    const updated = await this.prisma.client.mistake.update({
      where: { id: mistake.id },
      data: { correctStreak, masteryState: nextMastery(correctStreak) },
    });
    await this.prisma.client.reviewLog.create({
      data: { userId, itemType: 'mistake', itemId: mistake.id, grade: correct ? 4 : 1 },
    });
    return updated;
  }

  async summary(userId: string, languageCode: string) {
    const rows = await this.prisma.client.mistake.groupBy({
      by: ['category'],
      where: { userId, languageCode, masteryState: { not: 'MASTERED' } },
      _sum: { frequency: true },
      _count: true,
    });
    return rows
      .map((r) => ({ category: r.category, distinct: r._count, occurrences: r._sum.frequency ?? 0 }))
      .sort((a, b) => b.occurrences - a.occurrences);
  }
}
