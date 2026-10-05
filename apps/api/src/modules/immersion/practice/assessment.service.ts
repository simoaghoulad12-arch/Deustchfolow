import { Injectable } from '@nestjs/common';
import type { DnaDimension } from '@deutschflow/types';
import { SCHEMA, type EvaluationContextPayload } from '../../ai/providers/mock/contracts';
import { ImmersionAiService } from '../ai/immersion-ai.service';
import { EvaluationSchema, type Evaluation } from '../ai/immersion-schemas';
import { evaluationPrompt } from '../ai/immersion-prompts';
import { ImmersionContextService } from '../context/immersion-context.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { DnaService, type DnaObservation } from '../dna/dna.service';
import { average } from '../common/math';

export type AssessmentKind = EvaluationContextPayload['task']['kind'];

export interface AssessmentInput {
  kind: AssessmentKind;
  prompt: string;
  response: string;
  targetTone?: string;
  responseMs?: number;
  timeLimitMs?: number;
  speechConfidence?: number;
  spoken?: boolean;
}

export interface AssessmentResult extends Evaluation {
  overall: number;
  aiAvailable: boolean;
}

/**
 * AssessmentService (spec section 34): scores an open-ended answer
 * (speaking, brain mode, emotion, journal, daily challenge, debate) with
 * the AI, stores its corrections in error memory and feeds the matching
 * Language DNA dimensions.
 */
@Injectable()
export class AssessmentService {
  constructor(
    private readonly ai: ImmersionAiService,
    private readonly context: ImmersionContextService,
    private readonly errors: ErrorMemoryService,
    private readonly dna: DnaService,
  ) {}

  async assess(userId: string, languageCode: string, input: AssessmentInput): Promise<AssessmentResult> {
    const learner = await this.context.learner(userId, languageCode);
    const ctx: EvaluationContextPayload = {
      learner,
      task: {
        kind: input.kind,
        prompt: input.prompt,
        targetTone: input.targetTone,
        responseMs: input.responseMs,
        timeLimitMs: input.timeLimitMs,
        speechConfidence: input.speechConfidence,
      },
    };
    const { data, aiAvailable } = await this.ai.complete({
      userId,
      feature: `assess_${input.kind}`,
      systemPrompt: evaluationPrompt(ctx),
      userMessage: input.response,
      schema: EvaluationSchema,
      schemaName: SCHEMA.evaluation,
      schemaDescription: 'Scores, feedback, corrections and an improved version of the learner answer.',
      maxOutputTokens: 1000,
    });

    for (const correction of data.corrections.slice(0, 3)) {
      await this.errors.record(userId, languageCode, correction, input.kind);
    }

    const s = data.scores;
    const observation: DnaObservation = {
      GRAMMAR: s.grammar,
      ACCURACY: s.grammar,
      VOCABULARY: s.vocabulary,
      FLUENCY: s.fluency,
    };
    const channel: DnaDimension = input.spoken ? 'SPEAKING' : 'WRITING';
    observation[channel] = average([s.grammar, s.vocabulary, s.fluency, s.naturalness]);
    if (s.pronunciation != null) observation.PRONUNCIATION = s.pronunciation;
    if (input.responseMs != null && input.timeLimitMs) {
      observation.RESPONSE_SPEED = Math.max(5, Math.min(100, 100 - (input.responseMs / input.timeLimitMs) * 70));
    }
    await this.dna.observe(userId, languageCode, observation);

    const parts = [s.grammar, s.vocabulary, s.fluency, s.naturalness, s.pronunciation, s.coherence].filter(
      (v): v is number => typeof v === 'number',
    );
    return { ...data, overall: Math.round(average(parts)), aiAvailable };
  }
}
