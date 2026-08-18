/** Commercial plan — separate from Role. FREE is a real, first-class plan. */
export const SubscriptionPlan = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

/** Stripe's own subscription lifecycle, adopted verbatim — see
 * docs/architecture-decisions/phase-6-implementation.md for why the
 * previous 3-value enum was replaced rather than extended. */
export const SubscriptionStatus = {
  INCOMPLETE: 'INCOMPLETE',
  INCOMPLETE_EXPIRED: 'INCOMPLETE_EXPIRED',
  TRIALING: 'TRIALING',
  ACTIVE: 'ACTIVE',
  PAST_DUE: 'PAST_DUE',
  CANCELED: 'CANCELED',
  UNPAID: 'UNPAID',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
