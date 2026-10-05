import { difficultyProfile, nextDifficulty, nextProficiency, smoothScore, TARGET_PERFORMANCE } from '../adaptive/adaptive-engine';
import { nextStreak } from '../gamification/streak';
import { generateLearningPlan, nextLevel } from '../plan/learning-plan';
import { MASTERED_INTERVAL_DAYS, reviewCard } from '../vocabulary/srs';
import { estimatePlacementLevel, nextPlacementLevel, type PlacementAnswer } from '../placement/placement-engine';
import { gradeExercise, isAutoGraded, normalizeAnswer, publicPayload } from '../exercises/exercise-grader';
import { mistakeKey, nextMastery } from '../errors/mistake-key';
import { countWords } from '../journal/journal.service';
import { deckCandidates } from '../missions/conversation.service';

describe('adaptive engine', () => {
  it('keeps difficulty steady at the target performance', () => {
    expect(nextDifficulty(5, TARGET_PERFORMANCE)).toBe(5);
  });

  it('raises difficulty after strong runs and lowers it after weak runs or hint use', () => {
    expect(nextDifficulty(5, 100)).toBeGreaterThan(5);
    expect(nextDifficulty(5, 40)).toBeLessThan(5);
    expect(nextDifficulty(5, TARGET_PERFORMANCE, 2)).toBeLessThan(5);
  });

  it('clamps difficulty to 1–10', () => {
    expect(nextDifficulty(10, 100)).toBe(10);
    expect(nextDifficulty(1, 0, 5)).toBe(1);
  });

  it('moves proficiency slowly toward the task level', () => {
    const up = nextProficiency(1, 'A1', 95);
    expect(up).toBeGreaterThan(1);
    expect(up).toBeLessThan(1.5);
    expect(nextProficiency(2, 'A2', 30)).toBeLessThan(2);
  });

  it('maps difficulty numbers to UX profiles', () => {
    expect(difficultyProfile(2).label).toBe('supportive');
    expect(difficultyProfile(5).label).toBe('balanced');
    expect(difficultyProfile(8).label).toBe('challenging');
    expect(difficultyProfile(8).maxHintLevel).toBeLessThan(difficultyProfile(2).maxHintLevel);
  });

  it('smooths DNA scores and takes the first observation as is', () => {
    expect(smoothScore(0, 0, 80)).toBe(80);
    const next = smoothScore(50, 10, 100);
    expect(next).toBeGreaterThan(50);
    expect(next).toBeLessThan(100);
  });
});

describe('streak', () => {
  it('keeps, extends or resets the streak', () => {
    expect(nextStreak('2026-10-05', 4, '2026-10-05')).toBe(4);
    expect(nextStreak('2026-10-04', 4, '2026-10-05')).toBe(5);
    expect(nextStreak('2026-10-01', 4, '2026-10-05')).toBe(1);
    expect(nextStreak(null, 0, '2026-10-05')).toBe(1);
  });

  it('handles month boundaries', () => {
    expect(nextStreak('2026-09-30', 2, '2026-10-01')).toBe(3);
  });
});

describe('learning plan', () => {
  const base = { languageName: 'German', startLevel: 'A1' as const, dailyMinutes: 20, goals: ['travel'], styles: ['speaking'], personalGoal: null };

  it('targets the next CEFR level, capped at B2', () => {
    expect(nextLevel('A1')).toBe('A2');
    expect(nextLevel('B2')).toBe('B2');
    expect(generateLearningPlan(base).targetLevel).toBe('A2');
  });

  it('fills the daily routine to exactly the chosen minutes', () => {
    for (const dailyMinutes of [5, 10, 20, 30, 60]) {
      const plan = generateLearningPlan({ ...base, dailyMinutes });
      expect(plan.dailyRoutine.reduce((s, a) => s + a.minutes, 0)).toBe(dailyMinutes);
    }
  });

  it('uses goal themes and the personal goal', () => {
    const plan = generateLearningPlan({ ...base, personalGoal: 'Order food in Berlin' });
    expect(plan.weeks).toHaveLength(4);
    expect(plan.weeks[0]!.theme).toBe('Getting around');
    expect(plan.headline).toContain('Order food in Berlin');
    expect(plan.focusSkills).toEqual(['SPEAKING']);
  });

  it('needs fewer weeks with more daily time', () => {
    expect(generateLearningPlan({ ...base, dailyMinutes: 60 }).estimatedWeeks).toBeLessThan(generateLearningPlan({ ...base, dailyMinutes: 10 }).estimatedWeeks);
  });
});

describe('SRS (SM-2)', () => {
  const fresh = { repetitions: 0, intervalDays: 0, easeFactor: 2.5 };
  const now = new Date('2026-10-05T10:00:00Z');

  it('schedules 1 day, then 3 days, then grows by the ease factor', () => {
    const first = reviewCard(fresh, 5, now);
    expect(first.intervalDays).toBe(1);
    const second = reviewCard(first, 5, now);
    expect(second.intervalDays).toBe(3);
    const third = reviewCard(second, 4, now);
    expect(third.intervalDays).toBeGreaterThan(3);
    expect(third.nextReviewAt.getTime()).toBe(now.getTime() + third.intervalDays * 86_400_000);
  });

  it('resets a forgotten card to a short relearn step and lowers ease', () => {
    const learned = { repetitions: 4, intervalDays: 15, easeFactor: 2.5 };
    const failed = reviewCard(learned, 1, now);
    expect(failed.repetitions).toBe(0);
    expect(failed.intervalDays).toBeLessThan(0.01);
    expect(failed.easeFactor).toBeLessThan(2.5);
    expect(failed.status).toBe('LEARNING');
  });

  it('never lets the ease factor drop below 1.3', () => {
    let state = fresh;
    for (let i = 0; i < 10; i++) state = reviewCard(state, 0, now);
    expect(state.easeFactor).toBe(1.3);
  });

  it('marks a card mastered at a three-week interval', () => {
    const result = reviewCard({ repetitions: 5, intervalDays: 10, easeFactor: 2.5 }, 5, now);
    expect(result.intervalDays).toBeGreaterThanOrEqual(MASTERED_INTERVAL_DAYS);
    expect(result.status).toBe('MASTERED');
  });
});

describe('placement engine', () => {
  const a = (level: PlacementAnswer['level'], correct: boolean): PlacementAnswer => ({ level, correct });

  it('starts at A2 and moves up or down by one level', () => {
    expect(nextPlacementLevel([])).toBe('A2');
    expect(nextPlacementLevel([a('A2', true)])).toBe('B1');
    expect(nextPlacementLevel([a('A2', false)])).toBe('A1');
  });

  it('stays within A1–B2', () => {
    expect(nextPlacementLevel([a('A2', false), a('A1', false), a('A1', false)])).toBe('A1');
    expect(nextPlacementLevel([a('A2', true), a('B1', true), a('B2', true), a('B2', true)])).toBe('B2');
  });

  it('estimates the highest level with at least 60% correct', () => {
    expect(estimatePlacementLevel([])).toBe('A1');
    expect(estimatePlacementLevel([a('A2', true), a('A2', true), a('B1', true), a('B1', false), a('B1', false)])).toBe('A2');
    expect(estimatePlacementLevel([a('B1', true), a('B1', true), a('B2', true), a('B2', true), a('B2', false)])).toBe('B2');
  });

  it('needs at least two answers above A1', () => {
    expect(estimatePlacementLevel([a('B2', true)])).toBe('A1');
  });
});

describe('exercise grader', () => {
  it('normalises case, punctuation and quotes', () => {
    expect(normalizeAnswer('  „Ich   möchte EINEN Kaffee!“ ')).toBe('ich möchte einen kaffee');
  });

  it('accepts the answer and listed alternatives', () => {
    const payload = { answer: 'einen', acceptable: ['nen'] };
    expect(gradeExercise('FILL_BLANK', payload, 'Einen.').isCorrect).toBe(true);
    expect(gradeExercise('FILL_BLANK', payload, 'nen').isCorrect).toBe(true);
    const wrong = gradeExercise('FILL_BLANK', payload, 'ein');
    expect(wrong).toEqual({ isCorrect: false, score: 0, expected: 'einen' });
  });

  it('gives partial credit for matching and survives bad JSON', () => {
    const payload = { pairs: [{ left: 'Hund', right: 'dog' }, { left: 'Katze', right: 'cat' }] };
    expect(gradeExercise('MATCHING', payload, JSON.stringify({ Hund: 'dog', Katze: 'cat' }))).toMatchObject({ isCorrect: true, score: 100 });
    expect(gradeExercise('MATCHING', payload, JSON.stringify({ Hund: 'dog', Katze: 'dog' }))).toMatchObject({ isCorrect: false, score: 50 });
    expect(gradeExercise('MATCHING', payload, 'not json')).toMatchObject({ isCorrect: false, score: 0 });
  });

  it('only auto-grades closed exercise types', () => {
    expect(isAutoGraded('MULTIPLE_CHOICE')).toBe(true);
    expect(isAutoGraded('SPEAKING')).toBe(false);
  });

  it('never leaks answers to the browser', () => {
    const pub = publicPayload('MULTIPLE_CHOICE', { options: ['a', 'b'], answer: 'a', acceptable: ['A'] });
    expect(pub).toEqual({ options: ['a', 'b'] });
    const matching = publicPayload('MATCHING', { pairs: [{ left: 'x', right: '1' }, { left: 'y', right: '2' }] });
    expect(matching).toEqual({ lefts: ['x', 'y'], rights: ['2', '1'] });
  });
});

describe('error memory', () => {
  it('treats casing and punctuation variants as the same mistake', () => {
    expect(mistakeKey('Ich möchte ein Kaffee.', 'Ich möchte einen Kaffee.')).toBe(mistakeKey('ich möchte ein kaffee', 'ich möchte einen kaffee!'));
    expect(mistakeKey('ein Kaffee', 'einen Kaffee')).not.toBe(mistakeKey('ein Tee', 'einen Tee'));
  });

  it('masters a mistake after three correct uses in a row', () => {
    expect(nextMastery(0)).toBe('NEW');
    expect(nextMastery(2)).toBe('PRACTICING');
    expect(nextMastery(3)).toBe('MASTERED');
  });
});

describe('journal', () => {
  it('counts words regardless of whitespace', () => {
    expect(countWords('  Heute   war ich\nim Park. ')).toBe(5);
    expect(countWords('')).toBe(0);
  });
});

describe('mission vocabulary to deck', () => {
  it('finds article-stored nouns from inflected key phrases', () => {
    const candidates = deckCandidates(['Ich möchte einen Kaffee.', 'la cuenta', "l'addition"]);
    expect(candidates).toEqual(expect.arrayContaining(['der kaffee', 'ich möchte einen kaffee', 'la cuenta', "l'addition"]));
  });
});
