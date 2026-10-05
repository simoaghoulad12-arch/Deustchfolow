import { VocabularyStatus } from '@deutschflow/types';

/**
 * Leitner-style stages in days (see
 * docs/architecture-decisions/phase-4-vocabulary-training-plan.md,
 * section 3) — deliberately not SM-2, no ML.
 */
export const REVIEW_INTERVALS_DAYS = [1, 2, 4, 7, 14, 30, 60] as const;
const FIRST_INTERVAL_DAYS = 1;
const LAST_INTERVAL_DAYS = 60;
export const MASTERED_INTERVAL_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface ReviewState {
  status: VocabularyStatus;
  intervalDays: number;
  correctCount: number;
}

export interface ScheduledReview {
  status: VocabularyStatus;
  intervalDays: number;
  nextReviewAt: Date;
}

function nextStage(intervalDays: number): number {
  const higher = REVIEW_INTERVALS_DAYS.find((days) => days > intervalDays);
  return higher ?? LAST_INTERVAL_DAYS;
}

/**
 * Pure, deterministic scheduling — no Prisma, no clock access (`now` is
 * passed in), so every transition is unit-testable without a database.
 *
 * - First correct answer for a word schedules it at stage 1 (1 day).
 * - Every later correct answer moves one stage up; ≥ 30 days = MASTERED.
 * - A wrong answer resets to stage 1; a word never answered correctly
 *   stays NEW.
 */
export function scheduleReview(previous: ReviewState | null, wasCorrect: boolean, now: Date): ScheduledReview {
  if (!wasCorrect) {
    const neverCorrect = !previous || previous.correctCount === 0;
    return {
      status: neverCorrect ? VocabularyStatus.NEW : VocabularyStatus.LEARNING,
      intervalDays: FIRST_INTERVAL_DAYS,
      nextReviewAt: new Date(now.getTime() + FIRST_INTERVAL_DAYS * DAY_MS),
    };
  }

  const isFirstCorrect = !previous || previous.correctCount === 0;
  const intervalDays = isFirstCorrect ? FIRST_INTERVAL_DAYS : nextStage(previous.intervalDays);

  return {
    status: intervalDays >= MASTERED_INTERVAL_DAYS ? VocabularyStatus.MASTERED : VocabularyStatus.LEARNING,
    intervalDays,
    nextReviewAt: new Date(now.getTime() + intervalDays * DAY_MS),
  };
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[.!?]+$/, '')
    .replace(/\s+/g, ' ')
    .replace(/^to /, '');
}

/**
 * Same normalization idea as `exercises/grading.ts` (case/whitespace
 * insensitive), plus two vocabulary-specific leniencies: a stored
 * translation may list alternatives separated by `/`, `,` or `;`, and an
 * English infinitive's leading "to " is optional ("speak" = "to speak").
 */
export function isTranslationCorrect(storedTranslation: string, submittedAnswer: string): boolean {
  const answer = normalize(submittedAnswer);
  if (!answer) return false;
  return storedTranslation
    .split(/[/,;]/)
    .map(normalize)
    .filter(Boolean)
    .includes(answer);
}
