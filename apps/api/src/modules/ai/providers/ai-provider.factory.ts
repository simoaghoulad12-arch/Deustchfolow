import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import { MockAiProvider } from './mock/mock-ai.provider';
import type { AiProvider } from './ai-provider.interface';

/**
 * Single switch point for provider selection. Deliberately simple — a
 * DI-token-based provider registry would be premature; adding another
 * vendor is a contained change here, not a rewrite of the callers (they
 * only ever see `AiProvider`).
 *
 * - `AI_PROVIDER=mock` always uses the offline MockAiProvider.
 * - `AI_PROVIDER=claude` (the default) uses Claude when ANTHROPIC_API_KEY
 *   is configured and falls back to the mock otherwise, so the product
 *   keeps working without credentials and switches to the real model
 *   automatically once a key is set.
 */
@Injectable()
export class AiProviderFactory {
  constructor(
    private readonly claudeProvider: ClaudeProvider,
    private readonly mockProvider: MockAiProvider = new MockAiProvider(),
  ) {}

  getProvider(): AiProvider {
    const providerName = process.env.AI_PROVIDER ?? 'claude';

    switch (providerName) {
      case 'claude':
        return process.env.ANTHROPIC_API_KEY ? this.claudeProvider : this.mockProvider;
      case 'mock':
        return this.mockProvider;
      default:
        throw new Error(`Unknown AI_PROVIDER: "${providerName}".`);
    }
  }

  /** True when a real, billable provider will serve requests. */
  isRealProviderActive(): boolean {
    return this.getProvider().name !== this.mockProvider.name;
  }
}
