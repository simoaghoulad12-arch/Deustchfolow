import type { CEFRLevel } from '@deutschflow/types';

export const PLACEMENT_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
export const PLACEMENT_MAX_QUESTIONS = 12;

export interface PlacementAnswer {
  level: CEFRLevel;
  correct: boolean;
}

/**
 * Adaptive staircase (spec section 6): start at A2, step up after a
 * correct answer and down after a wrong one. Pure so it is unit-testable
 * and the server can recompute it from stored attempts on every request.
 */
export function nextPlacementLevel(answers: PlacementAnswer[]): CEFRLevel {
  let index = 1;
  for (const a of answers) {
    index = Math.max(0, Math.min(PLACEMENT_LEVELS.length - 1, index + (a.correct ? 1 : -1)));
  }
  return PLACEMENT_LEVELS[index]!;
}

/** Highest level where the learner answered at least 60% correctly (min. 2 items, or 1 at A1). */
export function estimatePlacementLevel(answers: PlacementAnswer[]): CEFRLevel {
  let estimate: CEFRLevel = 'A1';
  for (const level of PLACEMENT_LEVELS) {
    const atLevel = answers.filter((a) => a.level === level);
    const correct = atLevel.filter((a) => a.correct).length;
    const minItems = level === 'A1' ? 1 : 2;
    if (atLevel.length >= minItems && correct / atLevel.length >= 0.6) estimate = level;
  }
  return estimate;
}
