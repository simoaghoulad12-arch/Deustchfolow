import { ExerciseType, OPTION_GRADED_EXERCISE_TYPES } from '@deutschflow/types';

interface GradableOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface GradableQuestion {
  correctAnswer: string | null;
  options: GradableOption[];
}

interface GradableExercise {
  type: ExerciseType;
  questions: GradableQuestion[];
}

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Pure, deterministic grading — no AI, no external calls (see
 * architecture decision record section 29: the learning engine must work
 * without an AI layer). Only the exercise's first Question is graded;
 * multi-question exercises are a later extension.
 */
export function gradeAttempt(exercise: GradableExercise, submittedAnswer: string): boolean {
  const question = exercise.questions[0];
  if (!question) return false;

  if (exercise.type === ExerciseType.ORDER_WORDS) {
    const correctOrder = [...question.options]
      .sort((a, b) => a.order - b.order)
      .map((option) => option.text)
      .join(' ');
    return normalize(submittedAnswer) === normalize(correctOrder);
  }

  if (OPTION_GRADED_EXERCISE_TYPES.includes(exercise.type)) {
    const selected = question.options.find((option) => option.id === submittedAnswer);
    return selected?.isCorrect ?? false;
  }

  return normalize(submittedAnswer) === normalize(question.correctAnswer ?? '');
}
