import { Injectable } from '@nestjs/common';
import { zodToJsonSchema } from 'zod-to-json-schema';
import type { z } from 'zod';
import type { ZodSchema } from 'zod/v3';
import { AiProviderFactory } from '../providers/ai-provider.factory';
import { AiObservabilityLogger } from '../logging/ai-observability.logger';
import type { AiConversationTurn } from '../providers/ai-provider.interface';
import { AiProviderError, AiValidationError } from './ai-errors';

export interface AiCompletionOptions<T> {
  /** Short feature name for observability/usage tracking, e.g. "tutor", "writing_correction". */
  feature: string;
  systemPrompt: string;
  userMessage: string;
  history?: AiConversationTurn[];
  // Constrained only on the Output type param — schemas with `.default()`
  // fields (e.g. WritingCorrectionResponseSchema) have a wider Input type
  // than Output, and `z.ZodType<T>` alone forces TS to unify T with both,
  // producing incorrect/excessively-deep inference. Only the parsed
  // Output type (T) matters to callers.
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  schemaName: string;
  schemaDescription: string;
  maxOutputTokens?: number;
  /** Optional cancellation, passed straight through to the provider (see AiProvider.complete). */
  signal?: AbortSignal;
}

/**
 * The one place that calls `AiProvider.complete()` and enforces "never
 * store broken AI data" (spec section 7): every response is validated
 * against the caller's Zod schema before it's returned. Callers
 * (CorrectionService, TutorService, ExerciseGenerationService) catch
 * `AiValidationError`/`AiProviderError` and fall back to a controlled
 * response — they never see unvalidated data.
 */
@Injectable()
export class AiService {
  constructor(
    private readonly providerFactory: AiProviderFactory,
    private readonly observability: AiObservabilityLogger,
  ) {}

  async complete<T>(options: AiCompletionOptions<T>): Promise<T> {
    const provider = this.providerFactory.getProvider();
    const startedAt = Date.now();

    // zodToJsonSchema's typings come from the `zod/v3` compat subpath,
    // which is structurally near-identical to (but not nominally the same
    // as) our root `zod` import's types — comparing them fully sends tsc
    // into an excessively-deep structural check. Casting through the exact
    // type zodToJsonSchema expects (rather than `any`) is the precise fix.
    const jsonSchema = zodToJsonSchema(options.schema as unknown as ZodSchema<T>) as Record<
      string,
      unknown
    >;
    delete jsonSchema.$schema;

    let latencyMs = 0;
    try {
      const result = await provider.complete({
        systemPrompt: options.systemPrompt,
        userMessage: options.userMessage,
        history: options.history,
        maxOutputTokens: options.maxOutputTokens,
        signal: options.signal,
        responseSchema: {
          name: options.schemaName,
          description: options.schemaDescription,
          jsonSchema,
        },
      });
      latencyMs = result.latencyMs;

      const parsed = options.schema.safeParse(result.data);
      if (!parsed.success) {
        this.observability.logFailure({
          feature: options.feature,
          provider: result.provider,
          latencyMs,
          errorMessage: `schema_validation_failed: ${parsed.error.issues.map((i) => i.path.join('.')).join(',')}`,
        });
        throw new AiValidationError('AI response did not match the expected schema.');
      }

      this.observability.logSuccess({
        feature: options.feature,
        provider: result.provider,
        model: result.model,
        latencyMs,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });

      return parsed.data;
    } catch (error) {
      if (error instanceof AiValidationError) {
        throw error;
      }

      this.observability.logFailure({
        feature: options.feature,
        provider: provider.name,
        latencyMs: latencyMs || Date.now() - startedAt,
        errorMessage: error instanceof Error ? error.message : 'unknown_error',
      });
      throw new AiProviderError('AI provider request failed.');
    }
  }
}
