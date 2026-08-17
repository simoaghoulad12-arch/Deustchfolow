export const ProgressStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus];

export const VocabularyStatus = {
  NEW: 'NEW',
  LEARNING: 'LEARNING',
  MASTERED: 'MASTERED',
} as const;

export type VocabularyStatus = (typeof VocabularyStatus)[keyof typeof VocabularyStatus];
