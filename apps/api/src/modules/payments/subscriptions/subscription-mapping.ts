import { SubscriptionPlan, SubscriptionStatus } from '@deutschflow/types';

/**
 * Pure mapping functions for the Subscription lifecycle — no Prisma, no
 * Stripe SDK, unit-testable without mocking anything (same pure-
 * function-first pattern as availability-slots.ts in Phase 5.3).
 */

/** Stripe's raw (lowercase, snake_case) subscription statuses -> our enum. */
const STRIPE_STATUS_MAP: Record<string, SubscriptionStatus> = {
  incomplete: SubscriptionStatus.INCOMPLETE,
  incomplete_expired: SubscriptionStatus.INCOMPLETE_EXPIRED,
  trialing: SubscriptionStatus.TRIALING,
  active: SubscriptionStatus.ACTIVE,
  past_due: SubscriptionStatus.PAST_DUE,
  canceled: SubscriptionStatus.CANCELED,
  unpaid: SubscriptionStatus.UNPAID,
};

export function mapStripeStatusToLocal(stripeStatus: string): SubscriptionStatus {
  const mapped = STRIPE_STATUS_MAP[stripeStatus];
  if (!mapped) {
    throw new Error(`Unrecognized Stripe subscription status: "${stripeStatus}"`);
  }
  return mapped;
}

/** Plan -> Stripe Price id, from deploy-time env config (never the
 * database — see phase-6 implementation notes). */
export function priceIdForPlan(plan: SubscriptionPlan): string {
  if (plan === SubscriptionPlan.FREE) {
    throw new Error('FREE has no Stripe Price — it is never checked out.');
  }
  const envVar = plan === SubscriptionPlan.PREMIUM ? 'STRIPE_PRICE_ID_PREMIUM' : 'STRIPE_PRICE_ID_PRO';
  const priceId = process.env[envVar];
  if (!priceId) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
  return priceId;
}

/** Reverse lookup used by the webhook handler: which plan does this
 * Stripe Price id correspond to? Returns null for an unrecognized price
 * (e.g. a stale/removed Price) — callers must not fabricate a plan for
 * a price they don't recognize. */
export function planForPriceId(priceId: string): SubscriptionPlan | null {
  if (priceId === process.env.STRIPE_PRICE_ID_PREMIUM) return SubscriptionPlan.PREMIUM;
  if (priceId === process.env.STRIPE_PRICE_ID_PRO) return SubscriptionPlan.PRO;
  return null;
}

/** Subscription statuses that entitle a user to their plan's features
 * outright (no grace period involved — see EntitlementsService for the
 * separate PAST_DUE grace-period exception). */
export function isEntitledStatus(status: SubscriptionStatus): boolean {
  return status === SubscriptionStatus.ACTIVE || status === SubscriptionStatus.TRIALING;
}
