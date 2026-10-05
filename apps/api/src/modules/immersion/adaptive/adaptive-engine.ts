import { CEFR_ORDER, type CEFRLevel } from '@deutschflow/types';
import { clamp, round1 } from '../common/math';

/**
 * Adaptive learning engine (spec section 14) — pure functions so the
 * policy is unit-testable and provider-independent. Difficulty targets a
 * ~75% success zone: above it the engine raises complexity (fewer hints,
 * richer language, faster pace); below it it simplifies and supports.
 */
export const TARGET_PERFORMANCE = 75;

export function nextDifficulty(current: number, performance: number, hintsUsed = 0): number {
  const delta = ((performance - TARGET_PERFORMANCE) / 25) * 0.6 - hintsUsed * 0.15;
  return round1(clamp(current + delta, 1, 10));
}

/**
 * Proficiency is a continuous CEFR estimate (A1=1 … C1=5). Success on a
 * task at level L pulls the estimate toward L + 0.5; failure pulls it
 * toward L - 0.5. Small learning rate so one run never jumps a level.
 */
export function nextProficiency(current: number, taskLevel: CEFRLevel, performance: number): number {
  const levelValue = CEFR_ORDER[taskLevel];
  const target = performance >= 70 ? levelValue + 0.5 : levelValue - 0.5;
  const rate = 0.08 * (Math.abs(performance - 70) / 30 + 0.5);
  return round1(clamp(current + (target - current) * rate, 1, 5.5));
}

export interface DifficultyProfile {
  label: 'supportive' | 'balanced' | 'challenging';
  maxHintLevel: number;
  correctionEveryNTurns: number;
  /** Words per AI turn the character should aim for. */
  replyLength: 'short' | 'medium' | 'long';
}

/** How the difficulty number translates into concrete UX behaviour. */
export function difficultyProfile(difficulty: number): DifficultyProfile {
  if (difficulty < 3.5) return { label: 'supportive', maxHintLevel: 5, correctionEveryNTurns: 1, replyLength: 'short' };
  if (difficulty < 7) return { label: 'balanced', maxHintLevel: 4, correctionEveryNTurns: 2, replyLength: 'medium' };
  return { label: 'challenging', maxHintLevel: 3, correctionEveryNTurns: 2, replyLength: 'long' };
}

/** Exponential smoothing for Language DNA scores. */
export function smoothScore(current: number, samples: number, observation: number): number {
  if (samples <= 0) return clamp(observation, 0, 100);
  const alpha = Math.max(0.2, 1 / (samples + 1));
  return clamp(current + (observation - current) * alpha, 0, 100);
}
