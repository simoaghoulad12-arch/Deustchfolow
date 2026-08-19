import { Entitlement, PLAN_ENTITLEMENTS, SubscriptionPlan, type SubscriptionStatus } from '@deutschflow/types';

/** Mirrors `PLAN_ENTITLEMENTS` (packages/types) purely for display —
 * never used for access control, that stays server-side via
 * `canAccess()`. Actual prices are set in the Stripe Dashboard, not
 * here — Stripe's own hosted Checkout page is the single source of
 * truth for what a plan costs, so this file never states a number. */
export const ENTITLEMENT_LABELS: Record<Entitlement, string> = {
  BASIC_LEARNING: 'Lernpfad A1–C1 (Beispiel-Lektionen)',
  BASIC_PROGRESS: 'Fortschrittstracking',
  LIMITED_AI: 'KI-Tutor (begrenztes Tageskontingent)',
  AI_ADVANCED: 'KI-Tutor (erweitertes Tageskontingent)',
  WRITING_ADVANCED: 'KI-Schreibkorrektur',
  SPEAKING_ADVANCED: 'Sprech-Übungen',
  EXAM_PREPARATION: 'Prüfungsvorbereitung',
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  FREE: 'Free',
  PREMIUM: 'Premium',
  PRO: 'Pro',
};

export const PLAN_ORDER: readonly SubscriptionPlan[] = [
  SubscriptionPlan.FREE,
  SubscriptionPlan.PREMIUM,
  SubscriptionPlan.PRO,
];

export const PLAN_FEATURES: Record<SubscriptionPlan, readonly Entitlement[]> = PLAN_ENTITLEMENTS;

export const SUBSCRIPTION_STATUS_LABELS: Record<SubscriptionStatus, string> = {
  INCOMPLETE: 'Unvollständig',
  INCOMPLETE_EXPIRED: 'Abgelaufen (unvollständig)',
  TRIALING: 'Testphase',
  ACTIVE: 'Aktiv',
  PAST_DUE: 'Zahlung überfällig',
  CANCELED: 'Gekündigt',
  UNPAID: 'Unbezahlt',
};
