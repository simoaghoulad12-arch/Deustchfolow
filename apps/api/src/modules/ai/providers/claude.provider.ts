import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type {
  AiProvider,
  AiCompletionRequest,
  AiCompletionResult,
} from './ai-provider.interface';

const DEFAULT_MODEL = 'claude-sonnet-5';

// A hung or extremely slow request must not hang an interactive tutor/
// writing request indefinitely — the SDK's own default (10 minutes) is
// far too long for that UX. 30s gives the model enough time for a real
// structured response while still failing fast into the controlled
// fallback path (AiService -> AiProviderError -> Tutor/CorrectionService
// fallback, never a hung request).
const DEFAULT_TIMEOUT_MS = 30_000;

// Retries for transient provider failures are handled entirely by
// @anthropic-ai/sdk's own built-in retry logic: exponential backoff,
// honors Retry-After/Retry-After-Ms response headers, retries on
// 408/409/429/5xx and connection errors (see
// node_modules/@anthropic-ai/sdk/core.js `shouldRetry`/`retryRequest`).
// Deliberately not reimplemented here — a second, custom retry loop
// layered on top of an already-retrying client would silently multiply
// latency and request count on every transient failure. Making
// `maxRetries` explicit (rather than relying on the SDK's implicit
// default) is the whole "retry strategy" this phase asked for — the
// simplest solution that's also already battle-tested by the SDK.
const DEFAULT_MAX_RETRIES = 2;

function readIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

/**
 * The only file in this codebase allowed to import `@anthropic-ai/sdk`.
 * Everything else talks to `AiProvider` (see architecture decision
 * record). Client construction is lazy — importing/constructing this
 * class must never throw just because ANTHROPIC_API_KEY isn't set (e.g.
 * in tests or when AI features aren't exercised), only calling
 * `complete()` does.
 */
@Injectable()
export class ClaudeProvider implements AiProvider {
  readonly name = 'claude';
  private client: Anthropic | null = null;

  async complete(request: AiCompletionRequest): Promise<AiCompletionResult> {
    const startedAt = Date.now();
    const client = this.getClient();

    try {
      const response = await client.messages.create(
        {
          model: process.env.ANTHROPIC_MODEL ?? DEFAULT_MODEL,
          max_tokens: request.maxOutputTokens ?? 1024,
          system: request.systemPrompt,
          messages: [
            ...(request.history ?? []).map((turn) => ({
              role: turn.role,
              content: turn.content,
            })),
            { role: 'user' as const, content: request.userMessage },
          ],
          tools: [
            {
              name: request.responseSchema.name,
              description: request.responseSchema.description,
              input_schema: request.responseSchema.jsonSchema as Anthropic.Tool.InputSchema,
            },
          ],
          // Forces the model to answer via the tool call — no free-text
          // fallback to parse, no risk of prose wrapped around JSON.
          tool_choice: { type: 'tool', name: request.responseSchema.name },
        },
        { signal: request.signal },
      );

      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      );

      if (!toolUseBlock) {
        throw new Error('Claude response did not include the expected tool_use block.');
      }

      return {
        data: toolUseBlock.input,
        provider: this.name,
        model: response.model,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        latencyMs: Date.now() - startedAt,
      };
    } catch (error) {
      throw this.toSafeError(error);
    }
  }

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Missing required environment variable: ANTHROPIC_API_KEY');
      }
      this.client = new Anthropic({
        apiKey,
        timeout: readIntEnv('ANTHROPIC_TIMEOUT_MS', DEFAULT_TIMEOUT_MS),
        maxRetries: readIntEnv('ANTHROPIC_MAX_RETRIES', DEFAULT_MAX_RETRIES),
      });
    }
    return this.client;
  }

  /**
   * Normalizes every failure mode (timeout, rate limit, 5xx, connection
   * error, cancellation via `request.signal`, or the "no tool_use block"
   * case above) into a single plain Error before it leaves this file, so
   * AiService's generic catch-all always sees a consistent shape.
   *
   * `error.message` on the SDK's error classes is built from the API's
   * own error response body — never an echo of our request/prompt — so
   * including status+type here stays within AiObservabilityLogger's
   * "metadata only, never content" logging rule (spec section 27) while
   * making 429/5xx/timeout/abort distinguishable in those logs.
   */
  private toSafeError(error: unknown): Error {
    if (error instanceof Anthropic.APIError) {
      const status = error.status ?? 'unknown';
      const type = error.constructor.name;
      return new Error(`Claude API error (status=${status}, type=${type}): ${error.message}`);
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('Unknown Claude provider error.');
  }
}
