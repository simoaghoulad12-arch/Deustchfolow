import { SubscriptionPlan } from '@deutschflow/types';
import { AiUsageService } from '../ai-usage.service';
import { AiUsageLimitExceededError } from '../../services/ai-errors';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { EntitlementsService } from '../../../entitlements/entitlements.service';

function buildDeps(plan: SubscriptionPlan, usedToday = 0) {
  const prisma = {
    client: {
      aiUsageRecord: {
        count: jest.fn().mockResolvedValue(usedToday),
        create: jest.fn().mockResolvedValue({ id: 'record-1' }),
      },
    },
  } as unknown as PrismaService;

  const entitlementsService = {
    getActivePlan: jest.fn().mockResolvedValue(plan),
  } as unknown as EntitlementsService;

  return { prisma, entitlementsService };
}

describe('AiUsageService', () => {
  it('records usage and does not throw when the user is under their daily limit', async () => {
    const { prisma, entitlementsService } = buildDeps(SubscriptionPlan.FREE, 2);
    const service = new AiUsageService(prisma, entitlementsService);

    await service.assertWithinLimitAndRecord('user-1', 'tutor');

    expect(prisma.client.aiUsageRecord.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', feature: 'tutor' },
    });
  });

  it('throws AiUsageLimitExceededError and does not record a new entry once the FREE daily limit is reached', async () => {
    // FREE plan: 10 tutor messages/day (packages/types/src/ai.ts AI_USAGE_LIMITS).
    const { prisma, entitlementsService } = buildDeps(SubscriptionPlan.FREE, 10);
    const service = new AiUsageService(prisma, entitlementsService);

    await expect(service.assertWithinLimitAndRecord('user-1', 'tutor')).rejects.toBeInstanceOf(
      AiUsageLimitExceededError,
    );
    expect(prisma.client.aiUsageRecord.create).not.toHaveBeenCalled();
  });

  it('gives PREMIUM users a materially higher limit than FREE for the same feature', async () => {
    const free = buildDeps(SubscriptionPlan.FREE, 10);
    const premium = buildDeps(SubscriptionPlan.PREMIUM, 10);

    await expect(
      new AiUsageService(free.prisma, free.entitlementsService).assertWithinLimitAndRecord('user-1', 'tutor'),
    ).rejects.toBeInstanceOf(AiUsageLimitExceededError);

    await expect(
      new AiUsageService(premium.prisma, premium.entitlementsService).assertWithinLimitAndRecord(
        'user-1',
        'tutor',
      ),
    ).resolves.toBeUndefined();
  });

  it('resolves limits from the plan via EntitlementsService, never from client-supplied input', async () => {
    const { prisma, entitlementsService } = buildDeps(SubscriptionPlan.FREE, 0);
    const service = new AiUsageService(prisma, entitlementsService);

    await service.getUsageSummary('user-1');

    expect(entitlementsService.getActivePlan).toHaveBeenCalledWith('user-1');
  });

  it('reports today\'s usage per feature separately in the summary', async () => {
    const prisma = {
      client: {
        aiUsageRecord: {
          count: jest.fn().mockImplementation(async ({ where }: { where: { feature: string } }) =>
            where.feature === 'tutor' ? 4 : 1,
          ),
        },
      },
    } as unknown as PrismaService;
    const entitlementsService = {
      getActivePlan: jest.fn().mockResolvedValue(SubscriptionPlan.FREE),
    } as unknown as EntitlementsService;
    const service = new AiUsageService(prisma, entitlementsService);

    const summary = await service.getUsageSummary('user-1');

    expect(summary.usedToday).toEqual({ tutor: 4, writing_correction: 1 });
    expect(summary.limits.tutorMessagesPerDay).toBeGreaterThan(0);
  });
});
