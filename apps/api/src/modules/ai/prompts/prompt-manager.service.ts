import { Injectable } from '@nestjs/common';
import { PROMPT_VERSION, type AiResponseDepth } from './shared';
import { buildTutorSystemPrompt } from './tutor/tutor.prompt';
import { buildWritingCorrectionSystemPrompt } from './writing/writing-correction.prompt';
import type { AiLearnerContext } from '../context/ai-context.types';

/**
 * Single entry point services use to get a system prompt — they never
 * import a `*.prompt.ts` file directly. Keeps prompt text organized by
 * folder (spec section 18) instead of scattered string literals, and
 * gives observability/debugging one place to report which prompt
 * version produced a given request.
 */
@Injectable()
export class PromptManager {
  readonly version = PROMPT_VERSION;

  buildTutorPrompt(context: AiLearnerContext, depth: AiResponseDepth): string {
    return buildTutorSystemPrompt(context, depth);
  }

  buildWritingCorrectionPrompt(context: AiLearnerContext, depth: AiResponseDepth): string {
    return buildWritingCorrectionSystemPrompt(context, depth);
  }
}
