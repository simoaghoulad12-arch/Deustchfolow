import { SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';
import { EntitlementsService } from '../entitlements.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';

function buildPrismaMock(subscription: { plan: SubscriptionPlan } | null) {
  return {
    client: {
      subscription: {
        findFirst: jest.fn().mockResolvedValue(subscription),
      },
    },
  } as unknown as PrismaService;
}

describe('EntitlementsService', () => {
  it('defaults to FREE plan entitlements when no active subscription exists', async () => {
    const service = new EntitlementsService(buildPrismaMock(null));

    const entitlements = await service.getEntitlements('user-1');

    expect(entitlements).toEqual(
      expect.arrayContaining(['BASIC_LEARNING', 'BASIC_PROGRESS', 'LIMITED_AI']),
    );
    expect(entitlements).not.toContain('AI_ADVANCED');
  });

  it('grants PREMIUM entitlements for a PREMIUM subscription', async () => {
    const service = new EntitlementsService(buildPrismaMock({ plan: SubscriptionPlan.PREMIUM }));

    expect(await service.canAccess('user-1', 'AI_ADVANCED')).toBe(true);
    expect(await service.canAccess('user-1', 'SPEAKING_ADVANCED')).toBe(false);
  });

  it('grants the full entitlement set for PRO', async () => {
    const service = new EntitlementsService(buildPrismaMock({ plan: SubscriptionPlan.PRO }));

    expect(await service.canAccess('user-1', 'SPEAKING_ADVANCED')).toBe(true);
    expect(await service.canAccess('user-1', 'EXAM_PREPARATION')).toBe(true);
  });

  it('never grants access based on role — only on the resolved plan', async () => {
    // No role is passed anywhere in this service at all — canAccess only
    // ever takes a userId and an entitlement, structurally preventing
    // `user.role === 'PREMIUM'`-style checks.
    const service = new EntitlementsService(buildPrismaMock({ plan: SubscriptionPlan.FREE }));

    expect(await service.canAccess('user-1', 'AI_ADVANCED')).toBe(false);
  });

  it('falls back to FREE when the subscription status is not ACTIVE', async () => {
    const prisma = buildPrismaMock(null);
    const service = new EntitlementsService(prisma);

    await service.getActivePlan('user-1');

    expect((prisma.client.subscription.findFirst as jest.Mock).mock.calls[0][0].where.status).toBe(
      SubscriptionStatus.ACTIVE,
    );
  });
});
