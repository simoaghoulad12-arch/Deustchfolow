import { SubscriptionPlan } from './subscription';

/**
 * Marketing copy for the pricing page — the actual access control never
 * reads from here. `canAccess(userId, entitlement)` against
 * `PLAN_ENTITLEMENTS` (entitlement.ts) remains the single source of
 * truth for what a plan actually grants; this file only describes it in
 * words for the UI. The live-lesson quota line intentionally has no
 * number baked in — the real, currently-configured weekly quota is
 * fetched from the API (PaymentPolicy) at render time, never hardcoded
 * here (see Phase 7 "PRO/MAX Live-Kontingente").
 */
export interface PlanCatalogEntry {
  plan: SubscriptionPlan;
  tagline: string;
  features: string[];
  /** Whether this plan includes a weekly live-lesson quota at all — the
   * exact minutes/week come from PaymentPolicy, not from here. */
  hasLiveLessonQuota: boolean;
}

export const PLAN_CATALOG: Record<SubscriptionPlan, PlanCatalogEntry> = {
  [SubscriptionPlan.FREE]: {
    plan: SubscriptionPlan.FREE,
    tagline: 'Kostenlos Deutsch lernen, jederzeit startbar.',
    features: [
      'Alle Kurse und Lektionen',
      'Fortschritts-Tracking',
      'KI-Tutor mit begrenztem Nutzungskontingent',
      'Alltagssimulationen, Karriere-Module und Deutschland-Coach',
      'Tutoren buchen und einzeln bezahlen',
    ],
    hasLiveLessonQuota: false,
  },
  [SubscriptionPlan.PREMIUM]: {
    plan: SubscriptionPlan.PREMIUM,
    tagline: 'Mehr KI-Unterstützung plus wöchentlicher Live-Unterricht.',
    features: [
      'Alles aus Normal',
      'Erweiterter KI-Tutor ohne enges Nutzungslimit',
      'Erweiterte Schreibkorrektur',
      'Wöchentliches Kontingent an Live-Unterricht inklusive',
    ],
    hasLiveLessonQuota: true,
  },
  [SubscriptionPlan.PRO]: {
    plan: SubscriptionPlan.PRO,
    tagline: 'Volle KI-Tiefe plus größeres Live-Unterrichtskontingent.',
    features: [
      'Alles aus Pro',
      'Erweiterte Sprechübungen',
      'Prüfungsvorbereitung',
      'Größeres wöchentliches Kontingent an Live-Unterricht inklusive',
    ],
    hasLiveLessonQuota: true,
  },
};
