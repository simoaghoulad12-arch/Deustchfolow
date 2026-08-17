import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import type {
  AiProvider,
  AiCompletionRequest,
  AiCompletionResult,
} from './ai-provider.interface';

const DEFAULT_MODEL = 'claude-sonnet-5';

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

    const response = await client.messages.create({
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
    });

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
  }

  private getClient(): Anthropic {
    if (!this.client) {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('Missing required environment variable: ANTHROPIC_API_KEY');
      }
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }
}
