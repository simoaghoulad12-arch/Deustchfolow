export const CareerModuleType = {
  CV: 'CV',
  COVER_LETTER: 'COVER_LETTER',
  INTERVIEW: 'INTERVIEW',
  WORKPLACE_GERMAN: 'WORKPLACE_GERMAN',
  PROFESSIONAL_EMAIL: 'PROFESSIONAL_EMAIL',
} as const;

export type CareerModuleType = (typeof CareerModuleType)[keyof typeof CareerModuleType];
