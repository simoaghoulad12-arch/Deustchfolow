import type { BookingStatus, TutorSpecialty, TutorVerificationStatus } from '@deutschflow/types';

export const SPECIALTY_LABELS: Record<TutorSpecialty, string> = {
  CONVERSATION: 'Sprechen',
  GRAMMAR: 'Grammatik',
  VOCABULARY: 'Vokabeltraining',
  EXAM_PREPARATION: 'Prüfungsvorbereitung',
  CONSULTATION: 'Individuelle Deutschberatung',
  REGULAR_LESSONS: 'Regulärer Deutschunterricht',
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

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  COMPLETED: 'Abgeschlossen',
  CANCELLED: 'Storniert',
  NO_SHOW: 'Nicht erschienen',
  REFUND_PENDING: 'Rückerstattung ausstehend',
  REFUNDED: 'Rückerstattet',
};

export function formatPrice(priceCents: number, currency: string): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(priceCents / 100);
}
