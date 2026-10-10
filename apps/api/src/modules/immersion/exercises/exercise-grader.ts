import type { PracticeExercisePayload, PracticeExerciseType } from '@deutschflow/types';

export interface GradeResult {
  isCorrect: boolean;
  /** 0–100; partial credit for matching. */
  score: number;
  expected: string;
}

/** Lenient comparison: case, surrounding punctuation, whitespace and typographic quotes don't matter. */
export function normalizeAnswer(value: string): string {
  return value
    .toLowerCase()
    .replace(/[„“”"«»‘’']/g, '')
    .replace(/[.!?¿¡,;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Types the engine grades deterministically; the rest are open answers assessed by the AI. */
export const AUTO_GRADED: PracticeExerciseType[] = [
  'MULTIPLE_CHOICE',
  'FILL_BLANK',
  'SENTENCE_ORDER',
  'TRANSLATION',
  'ERROR_CORRECTION',
  'MATCHING',
  'READING_COMPREHENSION',
  'LISTENING_COMPREHENSION',
];

export function isAutoGraded(type: PracticeExerciseType): boolean {
  return AUTO_GRADED.includes(type);
}

/**
 * Exercise engine grading (spec section 25). Matching answers arrive as a
 * JSON object {left: right}; everything else is a plain string.
 */
export function gradeExercise(type: PracticeExerciseType, payload: PracticeExercisePayload, answer: string): GradeResult {
  const given = normalizeAnswer(answer);
  switch (type) {
    case 'MATCHING': {
      const pairs = payload.pairs ?? [];
      let mapping: Record<string, string> = {};
      try {
        const parsed: unknown = JSON.parse(answer);
        if (parsed && typeof parsed === 'object') mapping = parsed as Record<string, string>;
      } catch {
        mapping = {};
      }
      const correct = pairs.filter((p) => normalizeAnswer(String(mapping[p.left] ?? '')) === normalizeAnswer(p.right)).length;
      const score = pairs.length ? Math.round((correct / pairs.length) * 100) : 0;
      return { isCorrect: pairs.length > 0 && correct === pairs.length, score, expected: pairs.map((p) => `${p.left} → ${p.right}`).join(', ') };
    }
    default: {
      const expected = payload.answer ?? '';
      const accepted = [expected, ...(payload.acceptable ?? [])].map(normalizeAnswer).filter(Boolean);
      const isCorrect = accepted.includes(given);
      return { isCorrect, score: isCorrect ? 100 : 0, expected };
    }
  }
}

/** What the browser may see: never the answer or accepted alternatives. */
export function publicPayload(type: PracticeExerciseType, payload: PracticeExercisePayload) {
  const { answer: _answer, acceptable: _acceptable, ...rest } = payload;
  if (type === 'MATCHING' && payload.pairs) {
    const rights = payload.pairs.map((p) => p.right);
    // Rotate rather than random-shuffle so the order is stable across reloads but never already solved.
    const rotated = rights.length > 1 ? [...rights.slice(1), rights[0]!] : rights;
    return { lefts: payload.pairs.map((p) => p.left), rights: rotated };
  }
  return rest;
}
