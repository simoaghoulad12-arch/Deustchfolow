import { Injectable, Logger } from '@nestjs/common';

interface AiRequestLogBase {
  feature: string;
  provider: string;
}

interface AiRequestSuccessLog extends AiRequestLogBase {
  model: string;
  latencyMs: number;
  inputTokens: number | null;
  outputTokens: number | null;
}

interface AiRequestFailureLog extends AiRequestLogBase {
  latencyMs: number;
  errorMessage: string;
}

/**
 * Structured logging for AI calls (spec section 27). Deliberately never
 * receives the user's message or the model's response text — only
 * request metadata (provider, model, latency, token counts,
 * success/failure). Grep-able via `event":"ai_request"`.
 */
@Injectable()
export class AiObservabilityLogger {
  private readonly logger = new Logger('AI');

  logSuccess(entry: AiRequestSuccessLog): void {
    this.logger.log(
      JSON.stringify({
        event: 'ai_request',
        status: 'success',
        ...entry,
      }),
    );
  }

  logFailure(entry: AiRequestFailureLog): void {
    this.logger.error(
      JSON.stringify({
        event: 'ai_request',
        status: 'failure',
        ...entry,
      }),
    );
  }
}
