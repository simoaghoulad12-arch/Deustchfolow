import type { Correction, MissionCriterion, KeyPhrase, MistakeCategory } from '@deutschflow/types';

/**
 * Structured-output contract names shared between the immersion services
 * (which validate the result with Zod) and the MockAiProvider (which must
 * produce output of the same shape without a network call).
 */
export const SCHEMA = {
  missionTurn: 'mission_turn',
  missionHint: 'mission_hint',
  chaosTwist: 'chaos_twist',
  evaluation: 'response_evaluation',
  coach: 'coach_message',
} as const;

/**
 * Every immersion prompt embeds its full, task-scoped context as JSON
 * between these markers. Real providers read it as part of the system
 * prompt; the MockAiProvider parses it to simulate a context-aware answer.
 */
export const CONTEXT_OPEN = '<context>';
export const CONTEXT_CLOSE = '</context>';

export interface LearnerContextPayload {
  level: string;
  targetLanguage: { code: string; name: string };
  nativeLanguage: { code: string; name: string };
  goals: string[];
  personalGoal: string | null;
  /** 1 (very easy) – 10 (very hard), from the adaptive engine. */
  difficulty: number;
  knownVocabulary: string[];
  weakGrammar: string[];
  recentMistakes: { original: string; corrected: string; category: MistakeCategory }[];
  dna: Record<string, number>;
}

export interface MissionContextPayload {
  learner: LearnerContextPayload;
  mission: {
    title: string;
    mode: string;
    scenario: string;
    objective: string;
    grammarFocus: string | null;
    keyPhrases: KeyPhrase[];
    criteria: (MissionCriterion & { met: boolean })[];
    character: { name: string; role: string; personality: string; speakingStyle: string } | null;
    /** Chaos twist / story choice / debate stance. */
    state: Record<string, unknown> | null;
    closingLine: string | null;
  };
  turnNumber: number;
  hintLevel?: number;
  /** Whether a correction is allowed this turn (corrections are rationed — communication first). */
  correctionAllowed: boolean;
}

export interface EvaluationContextPayload {
  learner: LearnerContextPayload;
  task: {
    kind: 'speaking' | 'brain' | 'emotion' | 'journal' | 'challenge' | 'debate' | 'free_writing';
    prompt: string;
    targetTone?: string;
    responseMs?: number;
    timeLimitMs?: number;
    /** Browser speech-recognition confidence 0–1, when the answer was spoken. */
    speechConfidence?: number;
  };
}

export interface CoachContextPayload {
  learner: LearnerContextPayload;
  draft: { headline: string; insights: string[]; recommendationReason: string };
}

export interface ChaosContextPayload {
  learner: LearnerContextPayload;
  twists: { title: string; situation: string; openingLine: string }[];
}

export interface MissionTurnOutput {
  reply: string;
  correction: Correction | null;
  criteriaMet: string[];
  objectiveComplete: boolean;
  scores: { grammar: number; vocabulary: number; fluency: number; task: number };
}

export interface EvaluationOutput {
  scores: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    naturalness: number;
    pronunciation: number | null;
    coherence: number | null;
  };
  feedback: string;
  corrections: Correction[];
  improvedVersion: string;
  tone: { detected: string; matchesTarget: boolean; explanation: string } | null;
}

export function embedContext(payload: unknown): string {
  return `${CONTEXT_OPEN}${JSON.stringify(payload)}${CONTEXT_CLOSE}`;
}

export function extractContext<T>(systemPrompt: string): T | null {
  const start = systemPrompt.indexOf(CONTEXT_OPEN);
  const end = systemPrompt.indexOf(CONTEXT_CLOSE, start);
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(systemPrompt.slice(start + CONTEXT_OPEN.length, end)) as T;
  } catch {
    return null;
  }
}
