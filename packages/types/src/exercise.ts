/** Supported exercise types. Kept intentionally small — no audio/video content yet. */
export const ExerciseType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FILL_BLANK: 'FILL_BLANK',
  TRANSLATION: 'TRANSLATION',
  TRUE_FALSE: 'TRUE_FALSE',
  ORDER_WORDS: 'ORDER_WORDS',
  SHORT_ANSWER: 'SHORT_ANSWER',
} as const;

export type ExerciseType = (typeof ExerciseType)[keyof typeof ExerciseType];

/** Option-graded types resolve correctness via `Option.isCorrect`/`order`; the rest via `Question.correctAnswer`. */
export const OPTION_GRADED_EXERCISE_TYPES: readonly ExerciseType[] = [
  ExerciseType.MULTIPLE_CHOICE,
  ExerciseType.TRUE_FALSE,
  ExerciseType.ORDER_WORDS,
];
