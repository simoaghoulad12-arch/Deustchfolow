import { NotFoundException } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus, type AuthenticatedUser } from '@deutschflow/types';
import { SubscriptionController } from '../subscription.controller';
import type { EntitlementsService } from '../entitlements.service';

function buildEntitlementsMock(row: unknown) {
  return {
    getActiveSubscriptionRow: jest.fn().mockResolvedValue(row),
  } as unknown as EntitlementsService;
}

const user: AuthenticatedUser = { id: 'user-1', role: 'STUDENT' } as AuthenticatedUser;

describe('SubscriptionController', () => {
  it('returns the plan/status/dates for an ACTIVE subscription', async () => {
    const row = {
      plan: SubscriptionPlan.PRO,
      status: SubscriptionStatus.ACTIVE,
      startedAt: new Date('2026-01-01'),
      expiresAt: null,
      cancelAtPeriodEnd: false,
    };
    const controller = new SubscriptionController(buildEntitlementsMock(row));

    const result = await controller.mySubscription(user);

    expect(result).toEqual(row);
  });

  it('returns the plan for a TRIALING subscription — never silently falls back to FREE', async () => {
    const row = {
      plan: SubscriptionPlan.PREMIUM,
      status: SubscriptionStatus.TRIALING,
      startedAt: new Date('2026-01-01'),
      expiresAt: null,
      cancelAtPeriodEnd: false,
    };
    const controller = new SubscriptionController(buildEntitlementsMock(row));

    const result = await controller.mySubscription(user);

    expect(result.plan).toBe(SubscriptionPlan.PREMIUM);
  });

  it('delegates to EntitlementsService.getActiveSubscriptionRow — the same lookup that drives canAccess()', async () => {
    const mock = buildEntitlementsMock(null);
    const controller = new SubscriptionController(mock);

    await expect(controller.mySubscription(user)).rejects.toThrow(NotFoundException);
    expect(mock.getActiveSubscriptionRow).toHaveBeenCalledWith('user-1');
  });

  it('404s when no row is entitled (bare FREE user) — the frontend already treats this as FREE', async () => {
    const controller = new SubscriptionController(buildEntitlementsMock(null));

    await expect(controller.mySubscription(user)).rejects.toThrow('No active subscription found.');
  });
});
