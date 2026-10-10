import { Injectable, Logger } from '@nestjs/common';
import type { z } from 'zod';
import { AiService } from '../../ai/services/ai.service';
import { AiProviderFactory } from '../../ai/providers/ai-provider.factory';
import { MockAiProvider } from '../../ai/providers/mock/mock-ai.provider';
import { AiUsageService } from '../../ai/usage/ai-usage.service';
import type { AiConversationTurn } from '../../ai/providers/ai-provider.interface';

export interface ImmersionAiRequest<T> {
  userId: string;
  feature: string;
  systemPrompt: string;
  userMessage: string;
  history?: AiConversationTurn[];
  schema: z.ZodType<T, z.ZodTypeDef, unknown>;
  schemaName: string;
  schemaDescription: string;
  maxOutputTokens?: number;
  /** Whether this call counts against the plan's daily immersion quota (only for real providers). */
  metered?: boolean;
}

export interface ImmersionAiResult<T> {
  data: T;
  /** False when the real provider failed and the offline engine answered instead. */
  aiAvailable: boolean;
  provider: string;
}

/**
 * Resilience wrapper for every immersion AI call:
 * 1. real provider (validated by AiService against the Zod schema),
 * 2. on any failure → the offline MockAiProvider with the same prompt,
 * so the UI never breaks when the AI is down (spec sections 42/43). The
 * daily quota only applies to real-provider calls — the offline engine
 * costs nothing.
 */
@Injectable()
export class ImmersionAiService {
  private readonly logger = new Logger(ImmersionAiService.name);

  constructor(
    private readonly aiService: AiService,
    private readonly providerFactory: AiProviderFactory,
    private readonly mockProvider: MockAiProvider,
    private readonly usage: AiUsageService,
  ) {}

  isRealProviderActive(): boolean {
    return this.providerFactory.isRealProviderActive();
  }

  async complete<T>(request: ImmersionAiRequest<T>): Promise<ImmersionAiResult<T>> {
    const real = this.providerFactory.isRealProviderActive();
    if (real) {
      try {
        if (request.metered !== false) {
          await this.usage.assertWithinLimitAndRecord(request.userId, 'immersion');
        }
        const data = await this.aiService.complete({
          feature: request.feature,
          systemPrompt: request.systemPrompt,
          userMessage: request.userMessage,
          history: request.history,
          schema: request.schema,
          schemaName: request.schemaName,
          schemaDescription: request.schemaDescription,
          maxOutputTokens: request.maxOutputTokens,
        });
        return { data, aiAvailable: true, provider: 'real' };
      } catch (error) {
        this.logger.warn(
          `Real AI provider failed for ${request.feature}; using offline engine. ${
            error instanceof Error ? error.message : ''
          }`,
        );
      }
    }

    const result = await this.mockProvider.complete({
      systemPrompt: request.systemPrompt,
      userMessage: request.userMessage,
      history: request.history,
      responseSchema: { name: request.schemaName, description: request.schemaDescription, jsonSchema: {} },
    });
    const data = request.schema.parse(result.data);
    return { data, aiAvailable: !real, provider: 'mock' };
  }
}
