/** What the user is trying to achieve in Germany — drives which GermanyPathStep sequence and DocumentRequirements apply. */
export const GermanyGoalType = {
  WORK: 'WORK',
  STUDY: 'STUDY',
  APPRENTICESHIP: 'APPRENTICESHIP',
  FAMILY: 'FAMILY',
  LANGUAGE: 'LANGUAGE',
  JOB_SEARCH: 'JOB_SEARCH',
  OTHER: 'OTHER',
} as const;

export type GermanyGoalType = (typeof GermanyGoalType)[keyof typeof GermanyGoalType];

/**
 * Fixed, ordered path steps. Order here IS the step order — a user's
 * `currentStep` implies every earlier step is done, every later step is
 * upcoming (see GermanyPathService). Deliberately not a workflow engine.
 */
export const GermanyPathStep = {
  ORIENTATION: 'ORIENTATION',
  GERMAN_LEVEL: 'GERMAN_LEVEL',
  QUALIFICATION_CHECK: 'QUALIFICATION_CHECK',
  JOB_OR_APPRENTICESHIP: 'JOB_OR_APPRENTICESHIP',
  DOCUMENTS: 'DOCUMENTS',
  VISA_RESIDENCE_CHECK: 'VISA_RESIDENCE_CHECK',
  ENTRY: 'ENTRY',
  FIRST_STEPS: 'FIRST_STEPS',
  GERMANY_EVERYDAY_LIFE: 'GERMANY_EVERYDAY_LIFE',
} as const;

export type GermanyPathStep = (typeof GermanyPathStep)[keyof typeof GermanyPathStep];

/** The ordered sequence GermanyPathService walks — single source of truth for step order. */
export const GERMANY_PATH_STEP_ORDER: readonly GermanyPathStep[] = [
  GermanyPathStep.ORIENTATION,
  GermanyPathStep.GERMAN_LEVEL,
  GermanyPathStep.QUALIFICATION_CHECK,
  GermanyPathStep.JOB_OR_APPRENTICESHIP,
  GermanyPathStep.DOCUMENTS,
  GermanyPathStep.VISA_RESIDENCE_CHECK,
  GermanyPathStep.ENTRY,
  GermanyPathStep.FIRST_STEPS,
  GermanyPathStep.GERMANY_EVERYDAY_LIFE,
];

export const OfficialSourceTopic = {
  VISA: 'VISA',
  WORK_PERMIT: 'WORK_PERMIT',
  RECOGNITION_OF_QUALIFICATIONS: 'RECOGNITION_OF_QUALIFICATIONS',
  JOB_SEARCH: 'JOB_SEARCH',
  HOUSING: 'HOUSING',
  HEALTH_INSURANCE: 'HEALTH_INSURANCE',
  LANGUAGE: 'LANGUAGE',
  GENERAL: 'GENERAL',
} as const;

export type OfficialSourceTopic = (typeof OfficialSourceTopic)[keyof typeof OfficialSourceTopic];

export const DocumentRequirementStatus = {
  MISSING: 'MISSING',
  UPLOADED: 'UPLOADED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  EXPIRED: 'EXPIRED',
  NOT_REQUIRED: 'NOT_REQUIRED',
} as const;

export type DocumentRequirementStatus =
  (typeof DocumentRequirementStatus)[keyof typeof DocumentRequirementStatus];
