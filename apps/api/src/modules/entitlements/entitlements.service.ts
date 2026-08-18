import { Injectable } from '@nestjs/common';
import {
  SubscriptionPlan,
  SubscriptionStatus,
  PLAN_ENTITLEMENTS,
  ENTITLED_SUBSCRIPTION_STATUSES,
  type Entitlement,
} from '@deutschflow/types';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PaymentPolicyService } from '../payments/policy/payment-policy.service';
import { isWithinPastDueGracePeriod } from './past-due-grace-period';

/**
 * Entitlements are NOT a database table in this phase — they are derived
 * from the user's active Subscription.plan via the central
 * PLAN_ENTITLEMENTS config (see packages/types/src/entitlement.ts). Never
 * `user.role === 'PREMIUM'`; always `canAccess(userId, entitlement)`.
 */
@Injectable()
export class EntitlementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paymentPolicy: PaymentPolicyService,
  ) {}

  /**
   * Two-step lookup — see phase-6-implementation.md "Phase 6.11" for the
   * full reasoning. Step 1 covers the ordinary ACTIVE/TRIALING case; step
   * 2 is the approval's configurable PAST_DUE grace period (default 7
   * days) before entitlements fall back to FREE. Nothing here writes to
   * Subscription — the "pause" is this function simply stopping to match
   * step 2 once the grace window elapses, re-evaluated on every call.
   */
  async getActivePlan(userId: string): Promise<SubscriptionPlan> {
    const entitled = await this.prisma.client.subscription.findFirst({
      where: { userId, status: { in: [...ENTITLED_SUBSCRIPTION_STATUSES] as SubscriptionStatus[] } },
      orderBy: { createdAt: 'desc' },
    });
    if (entitled) return entitled.plan;

    const pastDue = await this.prisma.client.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.PAST_DUE },
      orderBy: { createdAt: 'desc' },
    });
    if (pastDue) {
      const policy = await this.paymentPolicy.get();
      if (isWithinPastDueGracePeriod(pastDue.pastDueSince, policy.pastDueGracePeriodDays)) {
        return pastDue.plan;
      }
    }

    return SubscriptionPlan.FREE;
  }

  async getEntitlements(userId: string): Promise<Entitlement[]> {
    const plan = await this.getActivePlan(userId);
    return [...PLAN_ENTITLEMENTS[plan]];
  }

  async canAccess(userId: string, entitlement: Entitlement): Promise<boolean> {
    const entitlements = await this.getEntitlements(userId);
    return entitlements.includes(entitlement);
  }
}
