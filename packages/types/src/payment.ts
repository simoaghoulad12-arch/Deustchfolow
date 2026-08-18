/**
 * Payments & Monetization (Phase 6). See
 * docs/architecture-decisions/phase-6-payment-architecture-quality-gate.md
 * and phase-6-implementation.md for the reasoning behind every enum here.
 */

/** Mirrors a Stripe PaymentIntent's real lifecycle for a one-time booking
 * payment — deliberately not the same enum as BookingStatus. */
export const PaymentStatus = {
  REQUIRES_PAYMENT_METHOD: 'REQUIRES_PAYMENT_METHOD',
  REQUIRES_CONFIRMATION: 'REQUIRES_CONFIRMATION',
  PROCESSING: 'PROCESSING',
  SUCCEEDED: 'SUCCEEDED',
  CANCELED: 'CANCELED',
  REFUND_PENDING: 'REFUND_PENDING',
  PARTIALLY_REFUNDED: 'PARTIALLY_REFUNDED',
  REFUNDED: 'REFUNDED',
  DISPUTED: 'DISPUTED',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const RefundStatus = {
  PENDING: 'PENDING',
  SUCCEEDED: 'SUCCEEDED',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
} as const;

export type RefundStatus = (typeof RefundStatus)[keyof typeof RefundStatus];

/** Who/what initiated a refund — deliberately its own enum, not a reuse
 * of Role (SYSTEM covers a future automated path, not a human role). */
export const RefundInitiatorRole = {
  STUDENT: 'STUDENT',
  SUPPORT: 'SUPPORT',
  ADMIN: 'ADMIN',
  SYSTEM: 'SYSTEM',
} as const;

export type RefundInitiatorRole = (typeof RefundInitiatorRole)[keyof typeof RefundInitiatorRole];

/** Tutor Connect onboarding/capability lifecycle — offerings are only
 * bookable once a tutor's account reaches ENABLED. */
export const TutorConnectAccountStatus = {
  ONBOARDING_INCOMPLETE: 'ONBOARDING_INCOMPLETE',
  RESTRICTED: 'RESTRICTED',
  ENABLED: 'ENABLED',
} as const;

export type TutorConnectAccountStatus =
  (typeof TutorConnectAccountStatus)[keyof typeof TutorConnectAccountStatus];

export const TutorPayoutStatus = {
  PENDING: 'PENDING',
  IN_TRANSIT: 'IN_TRANSIT',
  PAID: 'PAID',
  FAILED: 'FAILED',
  CANCELED: 'CANCELED',
} as const;

export type TutorPayoutStatus = (typeof TutorPayoutStatus)[keyof typeof TutorPayoutStatus];

export const WebhookProcessingStatus = {
  PENDING: 'PENDING',
  PROCESSED: 'PROCESSED',
  FAILED: 'FAILED',
  IGNORED: 'IGNORED',
} as const;

export type WebhookProcessingStatus =
  (typeof WebhookProcessingStatus)[keyof typeof WebhookProcessingStatus];

/** Subscription statuses that entitle a user to their plan's features.
 * PAST_DUE is deliberately excluded here — see EntitlementsService's
 * grace-period logic (Phase 6.11), which is a separate, explicit check,
 * not folded into this list, so the "still entitled during grace period"
 * exception stays visible at the call site rather than hidden in a type. */
export const ENTITLED_SUBSCRIPTION_STATUSES = ['ACTIVE', 'TRIALING'] as const;
