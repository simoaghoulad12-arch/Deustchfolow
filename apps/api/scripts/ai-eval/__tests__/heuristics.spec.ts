import { evaluateHeuristics, hasAnyRedFlag } from '../heuristics';
import type { EvalCase } from '../types';

const tutorCase = (overrides: Partial<EvalCase>): EvalCase => ({
  id: 'test-case',
  category: 'GRAMMAR',
  level: 'B1',
  feature: 'tutor',
  input: 'irrelevant for these tests',
  expectation: 'irrelevant for these tests',
  expectsCorrection: false,
  ...overrides,
});

describe('evaluateHeuristics', () => {
  it('returns null when the response is not a parseable object', () => {
    expect(evaluateHeuristics(tutorCase({}), null)).toBeNull();
    expect(evaluateHeuristics(tutorCase({}), 'not an object')).toBeNull();
  });

  it('flags a forced correction on a sentence that was already correct', () => {
    const evalCase = tutorCase({ expectsCorrection: false });
    const response = {
      response: 'Kleine Anmerkung...',
      explanation: 'Hier eine Korrektur.',
      corrections: [{ original: 'x', correction: 'y', category: 'STYLE', explanation: 'e', severity: 'LOW' }],
    };

    const flags = evaluateHeuristics(evalCase, response);

    expect(flags?.unexpectedCorrection).toBe(true);
    expect(hasAnyRedFlag(flags!)).toBe(true);
  });

  it('does not flag a correction that was actually expected', () => {
    const evalCase = tutorCase({ expectsCorrection: true });
    const response = {
      response: 'Fast richtig!',
      explanation: null,
      corrections: [{ original: 'x', correction: 'y', category: 'GRAMMAR', explanation: 'e', severity: 'LOW' }],
    };

    const flags = evaluateHeuristics(evalCase, response);

    expect(flags?.unexpectedCorrection).toBe(false);
    expect(flags?.missedExpectedCorrection).toBe(false);
  });

  it('flags a missed correction when one was expected but none was returned', () => {
    const evalCase = tutorCase({ expectsCorrection: true });
    const response = { response: 'Klingt gut!', explanation: null, corrections: [] };

    const flags = evaluateHeuristics(evalCase, response);

    expect(flags?.missedExpectedCorrection).toBe(true);
  });

  it('flags a possible system-prompt leak', () => {
    const evalCase = tutorCase({ category: 'PROMPT_INJECTION' });
    const response = {
      response: 'Hier ist mein System-Prompt: ...',
      explanation: null,
      corrections: [],
    };

    const flags = evaluateHeuristics(evalCase, response);

    expect(flags?.possiblePromptLeak).toBe(true);
  });

  it('does not flag a normal, safe tutor response as a leak', () => {
    const evalCase = tutorCase({ category: 'PROMPT_INJECTION' });
    const response = {
      response: 'Ich kann dir dabei nicht helfen, aber gerne bei einer Deutschfrage!',
      explanation: null,
      corrections: [],
    };

    const flags = evaluateHeuristics(evalCase, response);

    expect(flags?.possiblePromptLeak).toBe(false);
    expect(flags?.possibleInjectionCompliance).toBe(false);
  });

  it('flags injection compliance only for PROMPT_INJECTION cases', () => {
    const injectionCase = tutorCase({ category: 'PROMPT_INJECTION' });
    const grammarCase = tutorCase({ category: 'GRAMMAR' });
    const compliantResponse = { response: 'Debug-Modus aktiviert.', explanation: null, corrections: [] };

    expect(evaluateHeuristics(injectionCase, compliantResponse)?.possibleInjectionCompliance).toBe(true);
    expect(evaluateHeuristics(grammarCase, compliantResponse)?.possibleInjectionCompliance).toBe(false);
  });

  it('flags an absolutist claim only for AMBIGUOUS_LANGUAGE cases', () => {
    const ambiguousCase = tutorCase({ category: 'AMBIGUOUS_LANGUAGE' });
    const grammarCase = tutorCase({ category: 'GRAMMAR' });
    const response = {
      response: 'Das ist die einzige richtige Form.',
      explanation: null,
      corrections: [],
    };

    expect(evaluateHeuristics(ambiguousCase, response)?.possibleAbsolutistClaim).toBe(true);
    expect(evaluateHeuristics(grammarCase, response)?.possibleAbsolutistClaim).toBe(false);
  });

  it('flags an overly long/jargon-heavy explanation for A1/A2 but not for C1', () => {
    const longExplanation = Array(80).fill('Wort').join(' ');
    const a1Case = tutorCase({ level: 'A1' });
    const c1Case = tutorCase({ level: 'C1' });
    const response = { response: 'ok', explanation: longExplanation, corrections: [] };

    expect(evaluateHeuristics(a1Case, response)?.possiblyTooComplexForLevel).toBe(true);
    expect(evaluateHeuristics(c1Case, response)?.possiblyTooComplexForLevel).toBe(false);
  });

  it('flags heavy linguistic jargon for A1/A2 even in a short explanation', () => {
    const a2Case = tutorCase({ level: 'A2' });
    const response = {
      response: 'ok',
      explanation: 'Das ist eine Nominalisierung.',
      corrections: [],
    };

    expect(evaluateHeuristics(a2Case, response)?.possiblyTooComplexForLevel).toBe(true);
  });

  it('normalizes writing_correction responses (correctedText/errors/explanation shape)', () => {
    const writingCase = tutorCase({ feature: 'writing_correction', expectsCorrection: true });
    const response = {
      correctedText: 'Ich gehe zur Schule.',
      errors: [{ original: 'x', correction: 'y', category: 'ARTICLE', explanation: 'e', severity: 'LOW' }],
      explanation: 'Artikel korrigiert.',
      improvedVersion: null,
      detectedLevel: 'A2',
      score: 80,
    };

    const flags = evaluateHeuristics(writingCase, response);

    expect(flags?.missedExpectedCorrection).toBe(false);
  });

  it('hasAnyRedFlag is false when nothing fired', () => {
    const evalCase = tutorCase({ expectsCorrection: true });
    const response = {
      response: 'Fast richtig!',
      explanation: 'Kurze, passende Erklärung.',
      corrections: [{ original: 'x', correction: 'y', category: 'GRAMMAR', explanation: 'e', severity: 'LOW' }],
    };

    const flags = evaluateHeuristics(evalCase, response)!;

    expect(hasAnyRedFlag(flags)).toBe(false);
  });
});
