import { SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';
import { EntitlementsService } from '../entitlements.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import type { PaymentPolicyService } from '../../payments/policy/payment-policy.service';

function buildPrismaMock(overrides?: { subscription?: Partial<Record<string, jest.Mock>> }) {
  return {
    client: {
      subscription: {
        findFirst: jest.fn().mockResolvedValue(null),
        ...overrides?.subscription,
      },
    },
  } as unknown as PrismaService;
}

function buildPaymentPolicyMock(pastDueGracePeriodDays = 7) {
  return {
    get: jest.fn().mockResolvedValue({ pastDueGracePeriodDays }),
  } as unknown as PaymentPolicyService;
}

describe('EntitlementsService', () => {
  it('defaults to FREE plan entitlements when no active subscription exists', async () => {
    const service = new EntitlementsService(buildPrismaMock(), buildPaymentPolicyMock());

    const entitlements = await service.getEntitlements('user-1');

    expect(entitlements).toEqual(
      expect.arrayContaining(['BASIC_LEARNING', 'BASIC_PROGRESS', 'LIMITED_AI']),
    );
    expect(entitlements).not.toContain('AI_ADVANCED');
  });

  it('grants PREMIUM entitlements for a PREMIUM subscription', async () => {
    const prisma = buildPrismaMock({
      subscription: { findFirst: jest.fn().mockResolvedValue({ plan: SubscriptionPlan.PREMIUM }) },
    });
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock());

    expect(await service.canAccess('user-1', 'AI_ADVANCED')).toBe(true);
    expect(await service.canAccess('user-1', 'SPEAKING_ADVANCED')).toBe(false);
  });

  it('grants the full entitlement set for PRO', async () => {
    const prisma = buildPrismaMock({
      subscription: { findFirst: jest.fn().mockResolvedValue({ plan: SubscriptionPlan.PRO }) },
    });
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock());

    expect(await service.canAccess('user-1', 'SPEAKING_ADVANCED')).toBe(true);
    expect(await service.canAccess('user-1', 'EXAM_PREPARATION')).toBe(true);
  });

  it('never grants access based on role — only on the resolved plan', async () => {
    // No role is passed anywhere in this service at all — canAccess only
    // ever takes a userId and an entitlement, structurally preventing
    // `user.role === 'PREMIUM'`-style checks.
    const prisma = buildPrismaMock({
      subscription: { findFirst: jest.fn().mockResolvedValue({ plan: SubscriptionPlan.FREE }) },
    });
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock());

    expect(await service.canAccess('user-1', 'AI_ADVANCED')).toBe(false);
  });

  it('queries ACTIVE/TRIALING statuses first, never a client-supplied plan', async () => {
    const prisma = buildPrismaMock();
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock());

    await service.getActivePlan('user-1');

    expect((prisma.client.subscription.findFirst as jest.Mock).mock.calls[0][0].where).toEqual({
      userId: 'user-1',
      status: { in: ['ACTIVE', 'TRIALING'] },
    });
  });

  it('grants the plan for a PAST_DUE subscription still within the configurable grace period', async () => {
    const recentlyPastDue = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(null) // step 1: no ACTIVE/TRIALING row
      .mockResolvedValueOnce({ plan: SubscriptionPlan.PREMIUM, status: SubscriptionStatus.PAST_DUE, pastDueSince: recentlyPastDue });
    const prisma = buildPrismaMock({ subscription: { findFirst } });
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock(7));

    const plan = await service.getActivePlan('user-1');

    expect(plan).toBe(SubscriptionPlan.PREMIUM);
    expect(findFirst).toHaveBeenNthCalledWith(2, {
      where: { userId: 'user-1', status: SubscriptionStatus.PAST_DUE },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('falls back to FREE for a PAST_DUE subscription whose grace period has elapsed — no write happens, only the read result changes', async () => {
    const longPastDue = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ plan: SubscriptionPlan.PREMIUM, status: SubscriptionStatus.PAST_DUE, pastDueSince: longPastDue });
    const prisma = buildPrismaMock({ subscription: { findFirst } });
    const service = new EntitlementsService(prisma, buildPaymentPolicyMock(7));

    const plan = await service.getActivePlan('user-1');

    expect(plan).toBe(SubscriptionPlan.FREE);
  });

  it('falls back to FREE when there is no ACTIVE/TRIALING row and no PAST_DUE row at all', async () => {
    const service = new EntitlementsService(buildPrismaMock(), buildPaymentPolicyMock());

    const plan = await service.getActivePlan('user-1');

    expect(plan).toBe(SubscriptionPlan.FREE);
  });

  it('reads the grace period length from PaymentPolicyService, never a hardcoded constant', async () => {
    const recentlyPastDue = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000); // 10 days ago
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ plan: SubscriptionPlan.PRO, status: SubscriptionStatus.PAST_DUE, pastDueSince: recentlyPastDue });
    const prisma = buildPrismaMock({ subscription: { findFirst } });
    const policy = buildPaymentPolicyMock(30); // a longer, admin-configured grace period
    const service = new EntitlementsService(prisma, policy);

    const plan = await service.getActivePlan('user-1');

    expect(policy.get).toHaveBeenCalled();
    expect(plan).toBe(SubscriptionPlan.PRO);
  });
});
