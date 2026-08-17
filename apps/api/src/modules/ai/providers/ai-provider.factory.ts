import { Injectable } from '@nestjs/common';
import { ClaudeProvider } from './claude.provider';
import type { AiProvider } from './ai-provider.interface';

/**
 * Single switch point for provider selection. Deliberately simple — with
 * exactly one provider today, a DI-token-based provider registry would be
 * premature; swapping to one later is a contained change here, not a
 * rewrite of the callers (they only ever see `AiProvider`).
 */
@Injectable()
export class AiProviderFactory {
  constructor(private readonly claudeProvider: ClaudeProvider) {}

  getProvider(): AiProvider {
    const providerName = process.env.AI_PROVIDER ?? 'claude';

    switch (providerName) {
      case 'claude':
        return this.claudeProvider;
      default:
        throw new Error(`Unknown AI_PROVIDER: "${providerName}".`);
    }
  }
}
