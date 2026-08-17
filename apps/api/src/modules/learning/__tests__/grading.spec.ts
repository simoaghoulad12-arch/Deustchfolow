import { gradeAttempt } from '../exercises/grading';

describe('gradeAttempt', () => {
  it('grades MULTIPLE_CHOICE by the selected option id', () => {
    const exercise = {
      type: 'MULTIPLE_CHOICE' as const,
      questions: [
        {
          correctAnswer: null,
          options: [
            { id: 'a', text: 'Richtig', isCorrect: true, order: 0 },
            { id: 'b', text: 'Falsch', isCorrect: false, order: 1 },
          ],
        },
      ],
    };

    expect(gradeAttempt(exercise, 'a')).toBe(true);
    expect(gradeAttempt(exercise, 'b')).toBe(false);
    expect(gradeAttempt(exercise, 'nonexistent-option')).toBe(false);
  });

  it('grades TRUE_FALSE the same way as MULTIPLE_CHOICE', () => {
    const exercise = {
      type: 'TRUE_FALSE' as const,
      questions: [
        {
          correctAnswer: null,
          options: [
            { id: 'true', text: 'Richtig', isCorrect: true, order: 0 },
            { id: 'false', text: 'Falsch', isCorrect: false, order: 1 },
          ],
        },
      ],
    };

    expect(gradeAttempt(exercise, 'true')).toBe(true);
    expect(gradeAttempt(exercise, 'false')).toBe(false);
  });

  it('grades ORDER_WORDS by reconstructing the correct sentence from option order', () => {
    const exercise = {
      type: 'ORDER_WORDS' as const,
      questions: [
        {
          correctAnswer: null,
          options: [
            { id: '1', text: 'ist', isCorrect: false, order: 1 },
            { id: '2', text: 'Das', isCorrect: false, order: 0 },
            { id: '3', text: 'gut', isCorrect: false, order: 2 },
          ],
        },
      ],
    };

    expect(gradeAttempt(exercise, 'Das ist gut')).toBe(true);
    expect(gradeAttempt(exercise, '  das   IST  gut  ')).toBe(true); // whitespace/case-insensitive
    expect(gradeAttempt(exercise, 'gut ist Das')).toBe(false);
  });

  it('grades text-based types (FILL_BLANK, TRANSLATION, SHORT_ANSWER) against correctAnswer', () => {
    const exercise = {
      type: 'SHORT_ANSWER' as const,
      questions: [{ correctAnswer: 'Onkel', options: [] }],
    };

    expect(gradeAttempt(exercise, 'Onkel')).toBe(true);
    expect(gradeAttempt(exercise, 'onkel')).toBe(true);
    expect(gradeAttempt(exercise, '  Onkel  ')).toBe(true);
    expect(gradeAttempt(exercise, 'Tante')).toBe(false);
  });

  it('returns false for an exercise with no questions', () => {
    const exercise = { type: 'MULTIPLE_CHOICE' as const, questions: [] };
    expect(gradeAttempt(exercise, 'anything')).toBe(false);
  });
});
