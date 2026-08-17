/** Admin review status of a tutor's verification (see TutorVerificationDocument). */
export const TutorVerificationStatus = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
} as const;

export type TutorVerificationStatus =
  (typeof TutorVerificationStatus)[keyof typeof TutorVerificationStatus];

/** Fixed marketplace categories — exact-match, filterable, not free text. */
export const TutorSpecialty = {
  CONVERSATION: 'CONVERSATION',
  EXAM_PREPARATION: 'EXAM_PREPARATION',
  APPLICATION_COACHING: 'APPLICATION_COACHING',
  PRONUNCIATION: 'PRONUNCIATION',
  BUSINESS_GERMAN: 'BUSINESS_GERMAN',
  EVERYDAY_GERMAN: 'EVERYDAY_GERMAN',
  PROFESSIONAL_GERMAN: 'PROFESSIONAL_GERMAN',
} as const;

export type TutorSpecialty = (typeof TutorSpecialty)[keyof typeof TutorSpecialty];
