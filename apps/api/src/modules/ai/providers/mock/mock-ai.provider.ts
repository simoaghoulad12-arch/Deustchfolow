import { Injectable } from '@nestjs/common';
import type { Correction } from '@deutschflow/types';
import type { AiCompletionRequest, AiCompletionResult, AiProvider } from '../ai-provider.interface';
import {
  SCHEMA,
  extractContext,
  type ChaosContextPayload,
  type CoachContextPayload,
  type EvaluationContextPayload,
  type EvaluationOutput,
  type MissionContextPayload,
  type MissionTurnOutput,
} from './contracts';
import {
  TONE_CUES,
  findCorrections,
  improveText,
  looksLikeEnglish,
  matchesKeyword,
  normalizeForMatch,
  phrases,
} from './language-rules';

/**
 * Deterministic-enough, offline AI provider. Selected automatically when
 * no real provider is configured (see AiProviderFactory), so every
 * immersion feature — mission conversations, corrections, hints,
 * scoring, coach — works without an API key. It reads the same
 * `<context>` JSON the real provider receives, which keeps the two
 * interchangeable. Unknown schemas reject, so legacy features that have
 * their own controlled fallback (tutor chat, writing correction) keep
 * using it.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  readonly name = 'mock';

  /** Injectable randomness so tests are reproducible. */
  random: () => number = Math.random;

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const startedAt = Date.now();
    const data = this.generate(request);
    return {
      data,
      provider: this.name,
      model: 'mock-1',
      usage: { inputTokens: null, outputTokens: null },
      latencyMs: Date.now() - startedAt,
    };
  }

  private generate(request: AiCompletionRequest): unknown {
    switch (request.responseSchema.name) {
      case SCHEMA.missionTurn:
        return this.missionTurn(request);
      case SCHEMA.missionHint:
        return this.missionHint(request);
      case SCHEMA.evaluation:
        return this.evaluate(request);
      case SCHEMA.coach:
        return this.coach(request);
      case SCHEMA.chaosTwist:
        return this.chaosTwist(request);
      default:
        throw new Error(`MockAiProvider has no generator for schema "${request.responseSchema.name}".`);
    }
  }

  private pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.random() * items.length) % items.length] as T;
  }

  missionTurn(request: AiCompletionRequest): MissionTurnOutput {
    const ctx = requireContext<MissionContextPayload>(request);
    const lang = ctx.learner.targetLanguage.code;
    const pool = phrases(lang);
    const text = request.userMessage;
    const normalized = normalizeForMatch(text);
    const words = normalized ? normalized.split(' ') : [];

    const unmetBefore = ctx.mission.criteria.filter((c) => !c.met);
    const newlyMet = unmetBefore.filter((c) => c.keywords.some((k) => matchesKeyword(normalized, k)));
    const metIds = new Set([...ctx.mission.criteria.filter((c) => c.met).map((c) => c.id), ...newlyMet.map((c) => c.id)]);
    const stillOpen = ctx.mission.criteria.filter((c) => !metIds.has(c.id));
    const objectiveComplete = ctx.mission.criteria.length > 0 && stillOpen.length === 0;

    const corrections = ctx.correctionAllowed ? findCorrections(lang, text, 1) : [];
    const correction: Correction | null = corrections[0] ?? null;

    const parts: string[] = [];
    const wroteInEnglish = lang !== 'en' && looksLikeEnglish(normalized);

    if (wroteInEnglish && newlyMet.length === 0) {
      parts.push(this.pick(pool.encourageTarget));
      if (stillOpen[0]) parts.push(stillOpen[0].npcPrompt);
    } else if (newlyMet.length > 0) {
      parts.push(...newlyMet.map((c) => c.npcReaction));
      if (objectiveComplete) {
        parts.push(ctx.mission.closingLine ?? this.pick(pool.closing));
      } else if (stillOpen[0]) {
        parts.push(stillOpen[0].npcPrompt);
      }
    } else if (words.length <= 1 && stillOpen[0]) {
      parts.push(this.pick(pool.thinking), stillOpen[0].npcPrompt);
    } else if (stillOpen[0]) {
      // Didn't move the scenario forward — react naturally, then re-steer,
      // offering the frame when the learner seems stuck (easier difficulty).
      parts.push(this.pick(pool.acknowledge), stillOpen[0].npcPrompt);
      if (ctx.learner.difficulty <= 3 && ctx.turnNumber >= 2) {
        parts.push(`(${stillOpen[0].example})`);
      }
    } else {
      parts.push(this.pick(pool.acknowledge), ctx.mission.closingLine ?? this.pick(pool.closing));
    }

    if (ctx.mission.mode === 'DEBATE' && !objectiveComplete) {
      parts.push(debateCounter(lang, this.pick.bind(this)));
    }

    const lengthScore = clamp(35 + words.length * 7, 30, 95);
    const keyPhraseHits = ctx.mission.keyPhrases.filter((p) => matchesKeyword(normalized, p.term)).length;
    const grammarPenalty = findCorrections(lang, text, 3).length * 18;

    return {
      reply: dedupe(parts).join(' '),
      correction,
      criteriaMet: newlyMet.map((c) => c.id),
      objectiveComplete,
      scores: {
        grammar: clamp(92 - grammarPenalty - (wroteInEnglish ? 30 : 0), 20, 100),
        vocabulary: clamp(55 + keyPhraseHits * 12 + Math.min(words.length, 12) * 2, 25, 100),
        fluency: wroteInEnglish ? 30 : lengthScore,
        task: Math.round((metIds.size / Math.max(ctx.mission.criteria.length, 1)) * 100),
      },
    };
  }

  missionHint(request: AiCompletionRequest): { text: string } {
    const ctx = requireContext<MissionContextPayload>(request);
    const level = clamp(ctx.hintLevel ?? 1, 1, 5);
    const next = ctx.mission.criteria.find((c) => !c.met);
    if (!next) return { text: 'You have done everything needed — say goodbye to finish the mission.' };

    const phrasesForGoal = ctx.mission.keyPhrases
      .filter((p) => next.keywords.some((k) => normalizeForMatch(p.term).includes(normalizeForMatch(k))))
      .slice(0, 3);
    const vocab = (phrasesForGoal.length ? phrasesForGoal : ctx.mission.keyPhrases.slice(0, 3))
      .map((p) => `“${p.term}” (${p.translation})`)
      .join(', ');

    switch (level) {
      case 1:
        return { text: `Think about what ${ctx.mission.character?.name ?? 'they'} needs from you next: ${lowerFirst(next.description)}.` };
      case 2:
        return { text: `Useful words: ${vocab}.` };
      case 3:
        return { text: `Sentence frame: ${next.pattern}` };
      case 4:
        return { text: `For example: “${next.example}”` };
      default:
        return {
          text: `Goal: ${next.description}. Use the frame “${next.pattern}”, e.g. “${next.example}”. ${
            ctx.mission.grammarFocus ? `Grammar focus: ${ctx.mission.grammarFocus}.` : ''
          }`.trim(),
        };
    }
  }

  evaluate(request: AiCompletionRequest): EvaluationOutput {
    const ctx = requireContext<EvaluationContextPayload>(request);
    const lang = ctx.learner.targetLanguage.code;
    const text = request.userMessage.trim();
    const normalized = normalizeForMatch(text);
    const words = normalized ? normalized.split(' ') : [];
    const unique = new Set(words.filter((w) => w.length > 2));
    const corrections = findCorrections(lang, text, 4);
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length || (text ? 1 : 0);

    const expectedWords = ctx.task.kind === 'brain' ? 6 : ctx.task.kind === 'journal' ? 40 : 15;
    const grammar = clamp(94 - corrections.length * 14 - (words.length < 3 ? 25 : 0), 15, 100);
    const vocabulary = clamp(40 + unique.size * 4, 20, 98);
    let fluency = clamp(30 + (words.length / expectedWords) * 55, 15, 97);
    if (ctx.task.responseMs && ctx.task.timeLimitMs) {
      const speedFactor = 1 - ctx.task.responseMs / (ctx.task.timeLimitMs * 2);
      fluency = clamp(fluency * 0.6 + speedFactor * 40 + 10, 10, 98);
    }
    const naturalness = clamp((grammar + vocabulary) / 2 + (sentences > 1 ? 5 : 0), 15, 97);
    const pronunciation =
      ctx.task.speechConfidence != null ? clamp(Math.round(ctx.task.speechConfidence * 100), 20, 99) : null;
    const coherence = ['debate', 'journal', 'challenge'].includes(ctx.task.kind)
      ? clamp(40 + sentences * 9 + (/\b(weil|denn|deshalb|aber|because|so|but|however|porque|pero|parce que|mais|perché|ma)\b/i.test(text) ? 15 : 0), 20, 96)
      : null;

    let tone: EvaluationOutput['tone'] = null;
    if (ctx.task.kind === 'emotion' && ctx.task.targetTone) {
      const cues: Record<string, string[]> = TONE_CUES[lang] ?? TONE_CUES.en ?? {};
      const scored = Object.entries(cues)
        .map(([name, list]) => ({ name, hits: list.filter((cue) => (cue === '!' ? text.includes('!') : matchesKeyword(normalized, cue))).length }))
        .sort((a, b) => b.hits - a.hits);
      const top = scored[0];
      const detected = top && top.hits > 0 ? top.name : 'neutral';
      const matchesTarget = detected === ctx.task.targetTone || (cues[ctx.task.targetTone] ?? []).some((cue) => matchesKeyword(normalized, cue));
      tone = {
        detected,
        matchesTarget,
        explanation: matchesTarget
          ? `Your wording reads as ${ctx.task.targetTone}. Listeners would pick that up from your word choice.`
          : `This sounds more ${detected} than ${ctx.task.targetTone}. Try words like: ${(cues[ctx.task.targetTone] ?? []).filter((c) => c !== '!').slice(0, 3).join(', ')}.`,
      };
    }

    const strengths: string[] = [];
    if (grammar >= 80) strengths.push('your grammar was accurate');
    if (vocabulary >= 70) strengths.push('you used a good range of words');
    if (fluency >= 70) strengths.push('you answered fluently');
    const focus = corrections[0]
      ? `Focus next on: ${corrections[0].explanation}`
      : words.length < expectedWords / 2
        ? 'Next time, try to say a little more — add a reason or a detail.'
        : 'Next time, try one more complex sentence (e.g. with a connector).';

    return {
      scores: {
        grammar: Math.round(grammar),
        vocabulary: Math.round(vocabulary),
        fluency: Math.round(fluency),
        naturalness: Math.round(naturalness),
        pronunciation,
        coherence: coherence == null ? null : Math.round(coherence),
      },
      feedback: `${strengths.length ? `Nice — ${strengths.join(', ')}. ` : 'Good effort. '}${focus}`,
      corrections,
      improvedVersion: improveText(lang, text),
      tone,
    };
  }

  coach(request: AiCompletionRequest) {
    const ctx = requireContext<CoachContextPayload>(request);
    return ctx.draft;
  }

  chaosTwist(request: AiCompletionRequest) {
    const ctx = requireContext<ChaosContextPayload>(request);
    return this.pick(ctx.twists);
  }
}

function requireContext<T>(request: AiCompletionRequest): T {
  const ctx = extractContext<T>(request.systemPrompt);
  if (!ctx) throw new Error('MockAiProvider: prompt is missing its <context> block.');
  return ctx;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lowerFirst(text: string): string {
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function dedupe(parts: string[]): string[] {
  return parts.filter((p, i) => p && parts.indexOf(p) === i);
}

const DEBATE_COUNTERS: Record<string, string[]> = {
  de: [
    'Aber ist das wirklich so? Viele sehen das ganz anders.',
    'Das überzeugt mich noch nicht. Haben Sie ein Beispiel?',
    'Interessant – aber was ist mit den Nachteilen?',
  ],
  en: [
    "But is that really true? Plenty of people would disagree.",
    "I'm not convinced yet. Can you give me an example?",
    'Interesting — but what about the downsides?',
  ],
  es: ['¿Pero de verdad es así? Mucha gente no está de acuerdo.', 'No me convence todavía. ¿Tiene un ejemplo?'],
  fr: ["Mais est-ce vraiment le cas ? Beaucoup ne sont pas d'accord.", "Je ne suis pas encore convaincu. Un exemple ?"],
  it: ['Ma è davvero così? Molti non sono d’accordo.', 'Non mi convince ancora. Ha un esempio?'],
};

function debateCounter(lang: string, pick: <T>(items: readonly T[]) => T): string {
  return pick(DEBATE_COUNTERS[lang] ?? DEBATE_COUNTERS.en ?? ['?']);
}
