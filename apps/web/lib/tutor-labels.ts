import type { TutorSpecialty, TutorVerificationStatus } from '@deutschflow/types';

export const SPECIALTY_LABELS: Record<TutorSpecialty, string> = {
  CONVERSATION: 'Deutsch-Konversation',
  EXAM_PREPARATION: 'Prüfungsvorbereitung',
  APPLICATION_COACHING: 'Bewerbung',
  PRONUNCIATION: 'Aussprache',
  BUSINESS_GERMAN: 'Business Deutsch',
  EVERYDAY_GERMAN: 'Alltagsdeutsch',
  PROFESSIONAL_GERMAN: 'Fachdeutsch',
};

/** Only ever rendered as-is — never upgraded to a stronger claim than the platform can back (spec: "keine falschen Angaben wie zertifiziert automatisch behaupten"). */
export const VERIFICATION_LABELS: Record<TutorVerificationStatus, string> = {
  PENDING: 'Verifizierung ausstehend',
  UNDER_REVIEW: 'Verifizierung wird geprüft',
  VERIFIED: 'Verifiziert',
  REJECTED: 'Nicht verifiziert',
};

export function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(priceCents / 100);
}
