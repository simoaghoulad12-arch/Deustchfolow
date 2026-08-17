/**
 * Provider-agnostic contract. Nothing in the rest of the AI module (or
 * any Learning Engine code) may depend on a specific vendor's SDK types —
 * only on this interface. See
 * docs/architecture-decisions/phase-4-ai-learning-system.md.
 */

export interface AiConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface AiResponseSchema {
  /** Short machine name for the structured output (used as the tool name for tool-use-capable providers). */
  name: string;
  description: string;
  /** JSON Schema describing the required output shape. */
  jsonSchema: Record<string, unknown>;
}

export interface AiCompletionRequest {
  systemPrompt: string;
  userMessage: string;
  /** Prior turns, oldest first — does NOT include `userMessage`. Bounded by the caller (see AIContextBuilder). */
  history?: AiConversationTurn[];
  responseSchema: AiResponseSchema;
  maxOutputTokens?: number;
}

export interface AiCompletionResult {
  /** Raw structured output — NOT yet validated against a Zod schema. Callers must validate before use. */
  data: unknown;
  provider: string;
  model: string;
  usage: {
    inputTokens: number | null;
    outputTokens: number | null;
  };
  latencyMs: number;
}

export interface AiProvider {
  readonly name: string;
  complete(request: AiCompletionRequest): Promise<AiCompletionResult>;
}
