/** Admin review status of a tutor's verification (see TutorVerificationDocument). */
export const TutorVerificationStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type TutorVerificationStatus =
  (typeof TutorVerificationStatus)[keyof typeof TutorVerificationStatus];

/**
 * Fixed marketplace categories — exact-match, filterable, not free text.
 * GRAMMAR/VOCABULARY/CONSULTATION/REGULAR_LESSONS were added in Phase 7
 * to cover the full "Sprechen, Grammatik, Vokabeltraining,
 * Prüfungsvorbereitung, individuelle Deutschberatung, regulärer
 * Deutschunterricht" list of bookable live-lesson services — purely
 * additive, no existing value renamed or removed.
 */
export const TutorSpecialty = {
  CONVERSATION: 'CONVERSATION',
  GRAMMAR: 'GRAMMAR',
  VOCABULARY: 'VOCABULARY',
  EXAM_PREPARATION: 'EXAM_PREPARATION',
  CONSULTATION: 'CONSULTATION',
  REGULAR_LESSONS: 'REGULAR_LESSONS',
  APPLICATION_COACHING: 'APPLICATION_COACHING',
  PRONUNCIATION: 'PRONUNCIATION',
  BUSINESS_GERMAN: 'BUSINESS_GERMAN',
  EVERYDAY_GERMAN: 'EVERYDAY_GERMAN',
  PROFESSIONAL_GERMAN: 'PROFESSIONAL_GERMAN',
} as const;

export type TutorSpecialty = (typeof TutorSpecialty)[keyof typeof TutorSpecialty];
