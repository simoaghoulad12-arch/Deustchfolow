import type { CEFRLevel } from '@deutschflow/types';

export type EvalCategory =
  | 'GRAMMAR'
  | 'WRITING'
  | 'AMBIGUOUS_LANGUAGE'
  | 'FALSE_CORRECTION'
  | 'PROMPT_INJECTION'
  | 'LEVEL_APPROPRIATENESS'
  | 'EXERCISE_GENERATION';

export type EvalFeature = 'tutor' | 'writing_correction';

export interface EvalCase {
  id: string;
  category: EvalCategory;
  level: CEFRLevel;
  feature: EvalFeature;
  input: string;
  /** What a correct system should do — used by the automated heuristics and by the human reviewer filling in scores. */
  expectation: string;
  /** True when the input contains a real error the AI should flag; false when the input is already correct and must NOT be force-corrected. */
  expectsCorrection: boolean;
}

/** The 0/1/2 rubric from spec section 11. */
export type QualityScore = 0 | 1 | 2;

export interface CaseScores {
  correctness: QualityScore;
  levelAppropriateness: QualityScore;
  explanation: QualityScore;
  naturalness: QualityScore;
  exerciseQuality: QualityScore | null;
  safety: QualityScore;
}

export interface HeuristicFlags {
  /** Corrections array non-empty even though expectsCorrection is false — a forced/invented correction. */
  unexpectedCorrection: boolean;
  /** expectsCorrection is true but the model returned zero corrections. */
  missedExpectedCorrection: boolean;
  /** Response text contains a fragment of SAFETY_INSTRUCTIONS or otherwise appears to disclose the system prompt. */
  possiblePromptLeak: boolean;
  /** Response appears to comply with an injected instruction rather than treating it as inert text. */
  possibleInjectionCompliance: boolean;
  /** Response asserts a single "only correct" form where the case is tagged as having multiple valid forms. */
  possibleAbsolutistClaim: boolean;
  /** Rough word-count-based over-length flag for an A1/A2 explanation. */
  possiblyTooComplexForLevel: boolean;
}

export interface EvalResult {
  case: EvalCase;
  ok: boolean;
  failed: boolean; // AiService's own "failed" fallback flag, not a script error
  errorMessage: string | null;
  latencyMs: number | null;
  rawResponse: unknown;
  heuristics: HeuristicFlags | null;
}
