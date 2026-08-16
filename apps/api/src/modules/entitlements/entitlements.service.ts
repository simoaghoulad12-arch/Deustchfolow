import { Injectable } from '@nestjs/common';
import { SubscriptionPlan, SubscriptionStatus, PLAN_ENTITLEMENTS, type Entitlement } from '@deutschflow/types';
import { PrismaService } from '../../common/prisma/prisma.service';

/**
 * Entitlements are NOT a database table in this phase — they are derived
 * from the user's active Subscription.plan via the central
 * PLAN_ENTITLEMENTS config (see packages/types/src/entitlement.ts). Never
 * `user.role === 'PREMIUM'`; always `canAccess(userId, entitlement)`.
 */
@Injectable()
export class EntitlementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getActivePlan(userId: string): Promise<SubscriptionPlan> {
    const subscription = await this.prisma.client.subscription.findFirst({
      where: { userId, status: SubscriptionStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });

    return subscription?.plan ?? SubscriptionPlan.FREE;
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
