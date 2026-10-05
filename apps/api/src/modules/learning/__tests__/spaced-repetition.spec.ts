import {
  REVIEW_INTERVALS_DAYS,
  isTranslationCorrect,
  scheduleReview,
} from '../vocabulary/spaced-repetition';

const NOW = new Date('2026-10-05T10:00:00.000Z');
const DAY_MS = 24 * 60 * 60 * 1000;

describe('scheduleReview', () => {
  it('schedules a first correct answer at stage 1 (1 day), LEARNING', () => {
    const result = scheduleReview(null, true, NOW);
    expect(result).toEqual({
      status: 'LEARNING',
      intervalDays: 1,
      nextReviewAt: new Date(NOW.getTime() + DAY_MS),
    });
  });

  it('keeps a never-correct word NEW after a wrong answer', () => {
    expect(scheduleReview(null, false, NOW).status).toBe('NEW');
    expect(scheduleReview({ status: 'NEW', intervalDays: 1, correctCount: 0 }, false, NOW).status).toBe('NEW');
  });

  it.each([
    [1, 2],
    [2, 4],
    [4, 7],
    [7, 14],
    [14, 30],
    [30, 60],
    [60, 60],
  ])('moves stage %i → %i on a correct answer', (from, to) => {
    const result = scheduleReview({ status: 'LEARNING', intervalDays: from, correctCount: 3 }, true, NOW);
    expect(result.intervalDays).toBe(to);
    expect(result.nextReviewAt.getTime()).toBe(NOW.getTime() + to * DAY_MS);
  });

  it('marks a word MASTERED from 30 days on', () => {
    expect(scheduleReview({ status: 'LEARNING', intervalDays: 7, correctCount: 4 }, true, NOW).status).toBe(
      'LEARNING',
    );
    expect(scheduleReview({ status: 'LEARNING', intervalDays: 14, correctCount: 5 }, true, NOW).status).toBe(
      'MASTERED',
    );
  });

  it('resets even a MASTERED word to stage 1 (LEARNING) on a wrong answer', () => {
    const result = scheduleReview({ status: 'MASTERED', intervalDays: 60, correctCount: 9 }, false, NOW);
    expect(result).toEqual({
      status: 'LEARNING',
      intervalDays: REVIEW_INTERVALS_DAYS[0],
      nextReviewAt: new Date(NOW.getTime() + DAY_MS),
    });
  });
});

describe('isTranslationCorrect', () => {
  it('ignores case, surrounding whitespace and trailing punctuation', () => {
    expect(isTranslationCorrect('house', '  House. ')).toBe(true);
  });

  it('treats the English infinitive "to" as optional', () => {
    expect(isTranslationCorrect('to speak', 'speak')).toBe(true);
    expect(isTranslationCorrect('to speak', 'to speak')).toBe(true);
  });

  it('accepts any listed alternative', () => {
    expect(isTranslationCorrect('mother / mum', 'mum')).toBe(true);
    expect(isTranslationCorrect('good, fine', 'fine')).toBe(true);
  });

  it('rejects wrong and empty answers', () => {
    expect(isTranslationCorrect('house', 'home')).toBe(false);
    expect(isTranslationCorrect('house', '   ')).toBe(false);
  });
});
