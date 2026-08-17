import { AiProviderFactory } from '../ai-provider.factory';
import type { ClaudeProvider } from '../claude.provider';

describe('AiProviderFactory', () => {
  const originalEnv = process.env.AI_PROVIDER;

  afterEach(() => {
    process.env.AI_PROVIDER = originalEnv;
  });

  it('returns the ClaudeProvider by default when AI_PROVIDER is unset', () => {
    delete process.env.AI_PROVIDER;
    const claudeProvider = { name: 'claude' } as unknown as ClaudeProvider;
    const factory = new AiProviderFactory(claudeProvider);

    expect(factory.getProvider()).toBe(claudeProvider);
  });

  it('returns the ClaudeProvider when AI_PROVIDER=claude', () => {
    process.env.AI_PROVIDER = 'claude';
    const claudeProvider = { name: 'claude' } as unknown as ClaudeProvider;
    const factory = new AiProviderFactory(claudeProvider);

    expect(factory.getProvider()).toBe(claudeProvider);
  });

  it('throws for an unknown provider name instead of silently falling back', () => {
    process.env.AI_PROVIDER = 'some-unsupported-provider';
    const claudeProvider = { name: 'claude' } as unknown as ClaudeProvider;
    const factory = new AiProviderFactory(claudeProvider);

    expect(() => factory.getProvider()).toThrow(/Unknown AI_PROVIDER/);
  });
});
