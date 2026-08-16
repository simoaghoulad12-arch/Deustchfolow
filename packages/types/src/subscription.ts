/** Commercial plan — separate from Role. FREE is a real, first-class plan. */
export const SubscriptionPlan = {
  FREE: 'FREE',
  PREMIUM: 'PREMIUM',
  PRO: 'PRO',
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];
