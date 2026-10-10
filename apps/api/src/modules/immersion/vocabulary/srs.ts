/**
 * SM-2 spaced repetition (spec section 23). Grades: 0 = forgot … 5 = perfect.
 * Pure so it is unit-testable; the service persists the result.
 */
export interface SrsState {
  repetitions: number;
  intervalDays: number;
  easeFactor: number;
}

export interface SrsResult extends SrsState {
  nextReviewAt: Date;
  status: 'LEARNING' | 'MASTERED';
}

/** A card counts as mastered once its interval reaches three weeks. */
export const MASTERED_INTERVAL_DAYS = 21;
/** Failed cards come back in ten minutes, in the same session if the learner continues. */
const RELEARN_DAYS = 10 / (24 * 60);

export function reviewCard(state: SrsState, grade: number, now = new Date()): SrsResult {
  const q = Math.max(0, Math.min(5, Math.round(grade)));
  let { repetitions, intervalDays } = state;
  const easeFactor = Math.max(1.3, state.easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  if (q < 3) {
    repetitions = 0;
    intervalDays = RELEARN_DAYS;
  } else {
    repetitions += 1;
    intervalDays = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.round(intervalDays * easeFactor * 10) / 10;
  }

  return {
    repetitions,
    intervalDays,
    easeFactor: Math.round(easeFactor * 100) / 100,
    nextReviewAt: new Date(now.getTime() + intervalDays * 86_400_000),
    status: intervalDays >= MASTERED_INTERVAL_DAYS ? 'MASTERED' : 'LEARNING',
  };
}
