import { Injectable } from '@nestjs/common';
import { AI_USAGE_LIMITS, type AiUsageFeature, type AiUsageLimits } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { AiUsageLimitExceededError } from '../services/ai-errors';

/**
 * DB-backed daily usage cap — see architecture decision record, section
 * 3, for why this is not the in-memory rate limiter. Limits come from the
 * user's plan (resolved via the existing EntitlementsService, never a
 * client-supplied value) and the central `AI_USAGE_LIMITS` config — never
 * a hardcoded `if (plan === 'PREMIUM')` scattered per feature.
 *
 * The check-then-record pair below is not perfectly atomic under heavy
 * concurrent requests from the same user — acceptable for a soft daily
 * quota (cost control, not a hard security boundary); revisit with a DB
 * constraint/transaction if that ever becomes a real problem.
 */
@Injectable()
export class AiUsageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementsService: EntitlementsService,
  ) {}

  async assertWithinLimitAndRecord(userId: string, feature: AiUsageFeature): Promise<void> {
    const limits = await this.getLimitsForUser(userId);
    const limitForFeature = this.limitForFeature(limits, feature);

    const usedToday = await this.countUsedToday(userId, feature);
    if (usedToday >= limitForFeature) {
      throw new AiUsageLimitExceededError(
        `Daily limit of ${limitForFeature} reached for "${feature}".`,
      );
    }

    await this.prisma.client.aiUsageRecord.create({ data: { userId, feature } });
  }

  async getUsageSummary(
    userId: string,
  ): Promise<{ limits: AiUsageLimits; usedToday: Record<AiUsageFeature, number> }> {
    const limits = await this.getLimitsForUser(userId);
    const [tutor, writingCorrection] = await Promise.all([
      this.countUsedToday(userId, 'tutor'),
      this.countUsedToday(userId, 'writing_correction'),
    ]);

    return { limits, usedToday: { tutor, writing_correction: writingCorrection } };
  }

  private async getLimitsForUser(userId: string): Promise<AiUsageLimits> {
    const plan = await this.entitlementsService.getActivePlan(userId);
    return AI_USAGE_LIMITS[plan];
  }

  private limitForFeature(limits: AiUsageLimits, feature: AiUsageFeature): number {
    return feature === 'tutor' ? limits.tutorMessagesPerDay : limits.writingCorrectionsPerDay;
  }

  private async countUsedToday(userId: string, feature: AiUsageFeature): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return this.prisma.client.aiUsageRecord.count({
      where: { userId, feature, createdAt: { gte: startOfDay } },
    });
  }
}
