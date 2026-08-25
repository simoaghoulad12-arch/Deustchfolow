import { Controller, Get, NotFoundException } from '@nestjs/common';
import type { AuthenticatedUser } from '@deutschflow/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EntitlementsService } from './entitlements.service';

@Controller('users/me/subscription')
export class SubscriptionController {
  constructor(private readonly entitlementsService: EntitlementsService) {}

  /**
   * Always scoped to the caller's own id (`@CurrentUser()`), never a
   * client-supplied userId — the strongest available IDOR defense: there
   * is no id parameter to tamper with in the first place.
   *
   * Delegates to `EntitlementsService.getActiveSubscriptionRow`, the same
   * ACTIVE/TRIALING-then-grace-period-PAST_DUE lookup that drives actual
   * feature access — a hand-rolled `status: ACTIVE`-only query here would
   * silently disagree with `canAccess()` for a TRIALING or still-in-
   * grace-period PAST_DUE user, showing them as FREE when they are not.
   */
  @Get()
  async mySubscription(@CurrentUser() user: AuthenticatedUser) {
    const subscription = await this.entitlementsService.getActiveSubscriptionRow(user.id);

    if (!subscription) {
      throw new NotFoundException('No active subscription found.');
    }

    return {
      plan: subscription.plan,
      status: subscription.status,
      startedAt: subscription.startedAt,
      expiresAt: subscription.expiresAt,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    };
  }
}
