/** Commercial plan — separate from Role. FREE is a real, first-class plan. */
export const SubscriptionPlan = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

/**
 * Product-facing plan names (NORMAL / PRO / MAX) — presentation only.
 * The technical identifier (`SubscriptionPlan`, its DB enum values, the
 * `STRIPE_PRICE_ID_PREMIUM`/`STRIPE_PRICE_ID_PRO` env vars, and every
 * existing test) deliberately keeps using FREE/PREMIUM/PRO: renaming
 * those would mean a Postgres enum migration plus reassigning Stripe
 * Price ids in the dashboard for no functional gain. Every user-facing
 * surface (pricing page, settings, dashboard) must render through this
 * map — never hardcode a plan label inline.
 */
export const PLAN_DISPLAY_NAME: Record<SubscriptionPlan, string> = {
  [SubscriptionPlan.FREE]: 'Normal',
  [SubscriptionPlan.PREMIUM]: 'Pro',
  [SubscriptionPlan.PRO]: 'Max',
};

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
