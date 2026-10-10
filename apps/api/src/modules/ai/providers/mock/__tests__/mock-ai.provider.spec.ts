import { EvaluationSchema, MissionHintSchema, MissionTurnSchema } from '../../../../immersion/ai/immersion-schemas';
import { SCHEMA, embedContext, type EvaluationContextPayload, type LearnerContextPayload, type MissionContextPayload } from '../contracts';
import { findCorrections, improveText } from '../language-rules';
import { MockAiProvider } from '../mock-ai.provider';

const learner = (code = 'de', difficulty = 3): LearnerContextPayload => ({
  level: 'A1',
  targetLanguage: { code, name: code },
  nativeLanguage: { code: 'en', name: 'English' },
  goals: ['travel'],
  personalGoal: null,
  difficulty,
  knownVocabulary: [],
  weakGrammar: [],
  recentMistakes: [],
  dna: {},
});

const cafeMission = (metFirst = false): MissionContextPayload => ({
  learner: learner(),
  mission: {
    title: 'At the Café',
    mode: 'MISSION',
    scenario: 'Order breakfast.',
    objective: 'Order a drink and pay.',
    grammarFocus: 'Accusative',
    keyPhrases: [{ term: 'Ich möchte', translation: 'I would like' }],
    criteria: [
      { id: 'order', description: 'Order a drink', keywords: ['kaffee', 'tee'], pattern: 'Ich möchte …', example: 'Ich möchte einen Kaffee.', npcPrompt: 'Was darf es sein?', npcReaction: 'Sehr gern!', met: metFirst },
      { id: 'pay', description: 'Pay', keywords: ['zahlen', 'kostet'], pattern: 'Ich möchte zahlen.', example: 'Ich möchte bitte zahlen.', npcPrompt: 'Möchten Sie zahlen?', npcReaction: 'Das macht 4,50 €.', met: false },
    ],
    character: { name: 'Lena', role: 'Barista', personality: 'warm', speakingStyle: 'short' },
    state: null,
    closingLine: 'Schönen Tag noch!',
  },
  turnNumber: 1,
  hintLevel: 1,
  correctionAllowed: true,
});

const request = (schema: string, context: unknown, userMessage: string) => ({
  systemPrompt: `You are a character.\n${embedContext(context)}`,
  userMessage,
  responseSchema: { name: schema, description: '', jsonSchema: {} },
});

describe('MockAiProvider', () => {
  let provider: MockAiProvider;
  beforeEach(() => {
    provider = new MockAiProvider();
    provider.random = () => 0;
  });

  it('returns a valid mission turn that corrects the learner naturally and tracks goals', async () => {
    const result = await provider.complete(request(SCHEMA.missionTurn, cafeMission(), 'Ich möchte ein Kaffee mit Milch, bitte.'));
    const turn = MissionTurnSchema.parse(result.data);
    expect(result.provider).toBe('mock');
    expect(turn.criteriaMet).toEqual(['order']);
    expect(turn.objectiveComplete).toBe(false);
    expect(turn.reply).toContain('Sehr gern!');
    expect(turn.reply).toContain('Möchten Sie zahlen?');
    expect(turn.correction?.better).toContain('einen Kaffee');
  });

  it('completes the objective once every goal is met', async () => {
    const turn = MissionTurnSchema.parse((await provider.complete(request(SCHEMA.missionTurn, cafeMission(true), 'Was kostet das? Ich möchte zahlen.'))).data);
    expect(turn.objectiveComplete).toBe(true);
    expect(turn.reply).toContain('Schönen Tag noch!');
    expect(turn.scores.task).toBe(100);
  });

  it('does not correct when corrections are rationed for this turn', async () => {
    const ctx = { ...cafeMission(), correctionAllowed: false };
    const turn = MissionTurnSchema.parse((await provider.complete(request(SCHEMA.missionTurn, ctx, 'Ich möchte ein Kaffee.'))).data);
    expect(turn.correction).toBeNull();
  });

  it('re-steers a learner who answers in English', async () => {
    const turn = MissionTurnSchema.parse((await provider.complete(request(SCHEMA.missionTurn, cafeMission(), 'I would like something please'))).data);
    expect(turn.criteriaMet).toEqual([]);
    expect(turn.scores.fluency).toBe(30);
  });

  it('produces a hint that points at the next open goal', async () => {
    const hint = MissionHintSchema.parse((await provider.complete(request(SCHEMA.missionHint, { ...cafeMission(), hintLevel: 3 }, ''))).data);
    expect(hint.text.length).toBeGreaterThan(0);
  });

  it('evaluates free answers with scores, corrections and an improved version', async () => {
    const ctx: EvaluationContextPayload = { learner: learner(), task: { kind: 'speaking', prompt: 'Introduce yourself' } };
    const evaluation = EvaluationSchema.parse((await provider.complete(request(SCHEMA.evaluation, ctx, 'Ich heiße Sam. Ich möchte ein Kaffee.'))).data);
    expect(evaluation.corrections.length).toBeGreaterThan(0);
    expect(evaluation.improvedVersion).toContain('einen Kaffee');
    expect(evaluation.scores.pronunciation).toBeNull();
  });

  it('detects tone in emotion mode', async () => {
    const ctx: EvaluationContextPayload = { learner: learner('en'), task: { kind: 'emotion', prompt: 'Ask your neighbour', targetTone: 'polite' } };
    const evaluation = EvaluationSchema.parse((await provider.complete(request(SCHEMA.evaluation, ctx, 'Could you please turn the music down? Thank you.'))).data);
    expect(evaluation.tone?.matchesTarget).toBe(true);
  });

  it('rejects schemas it does not implement so legacy fallbacks keep working', async () => {
    await expect(provider.complete(request('tutor_reply', cafeMission(), 'hi'))).rejects.toThrow(/no generator/);
  });

  it('rejects prompts without a context block', async () => {
    await expect(provider.complete({ systemPrompt: 'no context', userMessage: 'x', responseSchema: { name: SCHEMA.missionTurn, description: '', jsonSchema: {} } })).rejects.toThrow(/context/);
  });
});

describe('language rules', () => {
  it.each([
    ['de', 'Ich möchte ein Kaffee.', 'einen Kaffee'],
    ['de', 'Heute ich gehe ins Kino.', 'Heute gehe ich'],
  ])('%s: corrects "%s"', (lang, text, expected) => {
    expect(findCorrections(lang, text).map((c) => c.better).join(' ')).toContain(expected);
  });

  it('leaves correct sentences alone', () => {
    expect(findCorrections('de', 'Ich möchte einen Kaffee, bitte.')).toEqual([]);
    expect(improveText('de', 'Ich möchte einen Kaffee, bitte.')).toBe('Ich möchte einen Kaffee, bitte.');
  });

  it('returns no corrections for unknown languages', () => {
    expect(findCorrections('xx', 'anything')).toEqual([]);
  });
});
