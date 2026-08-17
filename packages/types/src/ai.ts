import { z } from 'zod';
import { CEFRLevel } from './cefr-level';
import { LearningSkill } from './learning-skill';
import { ExerciseType } from './exercise';
import { SubscriptionPlan } from './subscription';

const CEFR_LEVEL_VALUES = Object.values(CEFRLevel) as [CEFRLevel, ...CEFRLevel[]];
const LEARNING_SKILL_VALUES = Object.values(LearningSkill) as [LearningSkill, ...LearningSkill[]];

/**
 * Provider-agnostic AI domain types. Nothing here mentions Claude,
 * Anthropic, or any specific SDK — see
 * docs/architecture-decisions/phase-4-ai-learning-system.md.
 */

export const ConversationRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
} as const;
export type ConversationRole = (typeof ConversationRole)[keyof typeof ConversationRole];

export const ErrorCategory = {
  GRAMMAR: 'GRAMMAR',
  VOCABULARY: 'VOCABULARY',
  WORD_ORDER: 'WORD_ORDER',
  SPELLING: 'SPELLING',
  ARTICLE: 'ARTICLE',
  PREPOSITION: 'PREPOSITION',
  TENSE: 'TENSE',
  REGISTER: 'REGISTER',
  STYLE: 'STYLE',
} as const;
export type ErrorCategory = (typeof ErrorCategory)[keyof typeof ErrorCategory];
const ERROR_CATEGORY_VALUES = Object.values(ErrorCategory) as [ErrorCategory, ...ErrorCategory[]];

export const ErrorSeverity = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
} as const;
export type ErrorSeverity = (typeof ErrorSeverity)[keyof typeof ErrorSeverity];
const ERROR_SEVERITY_VALUES = Object.values(ErrorSeverity) as [ErrorSeverity, ...ErrorSeverity[]];

/** One detected error. `explanation` must already be pitched at the user's CEFR level — see AI context/prompts. */
export const CorrectionItemSchema = z.object({
  original: z.string().min(1).max(500),
  correction: z.string().min(1).max(500),
  category: z.enum(ERROR_CATEGORY_VALUES),
  explanation: z.string().min(1).max(500),
  severity: z.enum(ERROR_SEVERITY_VALUES),
});
export type CorrectionItem = z.infer<typeof CorrectionItemSchema>;

/**
 * A short, unambiguously gradeable practice item generated inline by the
 * AI. Deliberately restricted to option- or short-text-graded types (no
 * ORDER_WORDS/TRANSLATION) to keep ad-hoc generated exercises simple.
 * Includes the correct answer — this is the *internal* shape used to
 * validate the raw AI output and to grade a reply server-side. It must be
 * stripped of `correctAnswer` before being sent to the browser (see
 * apps/api AI exercise sanitization, mirroring the Phase 3 pattern for
 * curriculum exercises).
 */
export const AiExerciseOptionSchema = z.object({
  id: z.string().min(1).max(10),
  text: z.string().min(1).max(200),
});
export type AiExerciseOption = z.infer<typeof AiExerciseOptionSchema>;

export const AI_EXERCISE_TYPES = [
  ExerciseType.MULTIPLE_CHOICE,
  ExerciseType.TRUE_FALSE,
  ExerciseType.FILL_BLANK,
  ExerciseType.SHORT_ANSWER,
] as const;

export const AiSuggestedExerciseSchema = z.object({
  type: z.enum(AI_EXERCISE_TYPES),
  prompt: z.string().min(1).max(500),
  options: z.array(AiExerciseOptionSchema).max(6).optional(),
  correctAnswer: z.string().min(1).max(200),
  skill: z.enum(LEARNING_SKILL_VALUES),
});
export type AiSuggestedExercise = z.infer<typeof AiSuggestedExerciseSchema>;

/** Public-safe view of `AiSuggestedExercise` — never contains the answer. */
export type AiSuggestedExercisePublic = Omit<AiSuggestedExercise, 'correctAnswer'>;

/** Structured output contract for POST /api/v1/ai/tutor. */
export const TutorResponseSchema = z.object({
  response: z.string().min(1).max(2000),
  corrections: z.array(CorrectionItemSchema).max(5).default([]),
  explanation: z.string().max(1000).nullable(),
  suggestedExercise: AiSuggestedExerciseSchema.nullable(),
  level: z.enum(CEFR_LEVEL_VALUES),
  relevantSkill: z.enum(LEARNING_SKILL_VALUES),
});
export type TutorResponse = z.infer<typeof TutorResponseSchema>;

/** Structured output contract for POST /api/v1/ai/writing/correct. */
export const WritingCorrectionResponseSchema = z.object({
  correctedText: z.string().min(1).max(5000),
  errors: z.array(CorrectionItemSchema).max(20).default([]),
  explanation: z.string().max(1000),
  improvedVersion: z.string().max(5000).nullable(),
  detectedLevel: z.enum(CEFR_LEVEL_VALUES),
  score: z.number().int().min(0).max(100),
});
export type WritingCorrectionResponse = z.infer<typeof WritingCorrectionResponseSchema>;

export interface AiUsageLimits {
  tutorMessagesPerDay: number;
  writingCorrectionsPerDay: number;
  maxInputChars: number;
}

/**
 * Zentral konfigurierbare Grenzen pro Plan — nie verstreute `if (plan ===
 * 'PREMIUM')`-Checks (spec section 16). Enforced by AiUsageService against
 * the plan resolved from the existing EntitlementsService, never from a
 * client-supplied value.
 */
export const AI_USAGE_LIMITS: Record<SubscriptionPlan, AiUsageLimits> = {
  [SubscriptionPlan.FREE]: {
    tutorMessagesPerDay: 10,
    writingCorrectionsPerDay: 3,
    maxInputChars: 500,
  },
  [SubscriptionPlan.PREMIUM]: {
    tutorMessagesPerDay: 100,
    writingCorrectionsPerDay: 30,
    maxInputChars: 2000,
  },
  [SubscriptionPlan.PRO]: {
    tutorMessagesPerDay: 300,
    writingCorrectionsPerDay: 100,
    maxInputChars: 4000,
  },
};

export type AiUsageFeature = 'tutor' | 'writing_correction';
