import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { SubscriptionStatus } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { StripeService } from '../stripe/stripe.service';
import { StripeCustomerService } from '../customers/stripe-customer.service';
import { mapStripeStatusToLocal, planForPriceId } from './subscription-mapping';

/** Minimal shape this service needs from a Stripe Subscription object —
 * kept narrow and structural (not `Stripe.Subscription` directly) so the
 * webhook handler (Phase 6.5) can pass either a real SDK object or a
 * test double without a type mismatch. */
export interface StripeSubscriptionEventData {
  id: string;
  status: string;
  customer: string;
  currentPeriodEnd: number; // unix seconds
  cancelAtPeriodEnd: boolean;
  priceId: string;
}

/**
 * Owns every write to Subscription.status/plan/stripeSubscriptionId/
 * stripePriceId/currentPeriodEnd/cancelAtPeriodEnd/pastDueSince for PAID
 * plans. This is the concrete
 * mechanism behind "Entitlements dürfen nicht aus Client-Plan kommen" —
 * `upsertFromStripeSubscription` is only ever called from the webhook
 * handler (Phase 6.5), never from a client-facing endpoint. The one
 * self-service action a user gets directly (`requestCancelAtPeriodEnd`)
 * only ever calls Stripe's API — it never writes `status` itself; the
 * subsequent webhook event is what actually updates the row, so a
 * failed Stripe call never leaves the database in a state Stripe itself
 * doesn't agree with.
 */
@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger('Subscription');

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly stripeCustomers: StripeCustomerService,
  ) {}

  /**
   * Webhook-driven upsert, keyed by stripeSubscriptionId — the only
   * place a paid Subscription row is created or its lifecycle fields
   * change. An unrecognized price id is not an error: Stripe products
   * can change, and a webhook for a plan we no longer sell must not
   * crash the handler — it's recorded with `plan` left at whatever it
   * already was (or skipped entirely on first-sight, logged loudly) so
   * an operator notices via logs rather than the DB silently drifting.
   */
  async upsertFromStripeSubscription(data: StripeSubscriptionEventData): Promise<void> {
    const plan = planForPriceId(data.priceId);
    if (!plan) {
      this.logger.error(
        JSON.stringify({
          event: 'subscription_unrecognized_price',
          stripeSubscriptionId: data.id,
          priceId: data.priceId,
        }),
      );
      return;
    }

    const userId = await this.stripeCustomers.findUserIdByStripeCustomerId(data.customer);
    if (!userId) {
      this.logger.error(
        JSON.stringify({
          event: 'subscription_unknown_customer',
          stripeSubscriptionId: data.id,
          stripeCustomerId: data.customer,
        }),
      );
      return;
    }

    const status = mapStripeStatusToLocal(data.status);
    const existing = await this.prisma.client.subscription.findUnique({
      where: { stripeSubscriptionId: data.id },
    });

    const pastDueSince = this.computePastDueSince(status, existing?.status ?? null, existing?.pastDueSince ?? null);

    const writeFields = {
      plan,
      status,
      stripePriceId: data.priceId,
      currentPeriodEnd: new Date(data.currentPeriodEnd * 1000),
      cancelAtPeriodEnd: data.cancelAtPeriodEnd,
      pastDueSince,
    };

    if (existing) {
      await this.prisma.client.subscription.update({
        where: { id: existing.id },
        data: writeFields,
      });
    } else {
      await this.prisma.client.subscription.create({
        data: { userId, stripeSubscriptionId: data.id, ...writeFields },
      });
    }
  }

  /**
   * Pure-ish decision (kept as an instance method only for symmetry with
   * the rest of the class, but takes no I/O — easy to unit test):
   * sets pastDueSince the FIRST time status becomes PAST_DUE, clears it
   * the moment status moves away from PAST_DUE, and otherwise leaves it
   * untouched (a webhook redelivered for an already-PAST_DUE
   * subscription must not reset the grace-period clock).
   */
  private computePastDueSince(
    newStatus: SubscriptionStatus,
    previousStatus: SubscriptionStatus | null,
    existingPastDueSince: Date | null,
  ): Date | null {
    if (newStatus === SubscriptionStatus.PAST_DUE) {
      return previousStatus === SubscriptionStatus.PAST_DUE && existingPastDueSince
        ? existingPastDueSince
        : new Date();
    }
    return null;
  }

  /**
   * Self-service cancellation. Only calls Stripe — never writes
   * `cancelAtPeriodEnd` or `status` locally itself. The
   * `customer.subscription.updated` webhook that Stripe sends as a
   * result of this call is what actually updates the row (see class
   * doc comment).
   */
  async requestCancelAtPeriodEnd(userId: string): Promise<void> {
    const subscription = await this.prisma.client.subscription.findFirst({
      where: { userId, stripeSubscriptionId: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    if (!subscription?.stripeSubscriptionId) {
      throw new NotFoundException('No paid subscription found.');
    }

    await this.stripe.client.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });
  }

  /** Scoped to the calling user's own id — see SubscriptionController. */
  async getCurrentForUser(userId: string) {
    return this.prisma.client.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
