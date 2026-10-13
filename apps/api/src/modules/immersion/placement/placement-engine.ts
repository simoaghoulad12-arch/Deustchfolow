import type { CEFRLevel } from '@deutschflow/types';

export const PLACEMENT_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];
export const PLACEMENT_MAX_QUESTIONS = 18;

/** Skills the placement test reports on (spec section 8). Speaking only when the browser can record. */
export const PLACEMENT_SKILLS = ['GRAMMAR', 'VOCABULARY', 'READING', 'LISTENING', 'WRITING', 'SPEAKING'] as const;
export type PlacementSkill = (typeof PLACEMENT_SKILLS)[number];

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

/** Next skill to test: the least-tested available skill, in the fixed spec order on ties. */
export function nextPlacementSkill(answeredSkills: string[], available: readonly string[]): string | null {
  const order = PLACEMENT_SKILLS.filter((skill) => available.includes(skill));
  if (order.length === 0) return null;
  const count = (skill: string) => answeredSkills.filter((s) => s === skill).length;
  return [...order].sort((a, b) => count(a) - count(b) || order.indexOf(a) - order.indexOf(b))[0]!;
}

/** Per-skill percentage, in spec order, for every skill that was tested. */
export function placementSkillScores(attempts: { skill: string; correct: boolean }[]): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const skill of PLACEMENT_SKILLS) {
    const items = attempts.filter((a) => a.skill === skill);
    if (items.length) scores[skill] = Math.round((items.filter((a) => a.correct).length / items.length) * 100);
  }
  return scores;
}
