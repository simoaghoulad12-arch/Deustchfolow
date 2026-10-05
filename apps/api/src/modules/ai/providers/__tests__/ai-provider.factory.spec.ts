import { AiProviderFactory } from '../ai-provider.factory';
import type { ClaudeProvider } from '../claude.provider';
import { MockAiProvider } from '../mock/mock-ai.provider';

describe('AiProviderFactory', () => {
  const originalProvider = process.env.AI_PROVIDER;
  const originalKey = process.env.ANTHROPIC_API_KEY;
  const claudeProvider = { name: 'claude' } as unknown as ClaudeProvider;
  const mockProvider = new MockAiProvider();

  afterEach(() => {
    process.env.AI_PROVIDER = originalProvider;
    if (originalKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalKey;
  });

  it('returns the ClaudeProvider by default when a key is configured', () => {
    delete process.env.AI_PROVIDER;
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const factory = new AiProviderFactory(claudeProvider, mockProvider);

    expect(factory.getProvider()).toBe(claudeProvider);
    expect(factory.isRealProviderActive()).toBe(true);
  });

  it('falls back to the MockAiProvider when no key is configured', () => {
    process.env.AI_PROVIDER = 'claude';
    delete process.env.ANTHROPIC_API_KEY;
    const factory = new AiProviderFactory(claudeProvider, mockProvider);

    expect(factory.getProvider()).toBe(mockProvider);
    expect(factory.isRealProviderActive()).toBe(false);
  });

  it('returns the MockAiProvider when AI_PROVIDER=mock even with a key', () => {
    process.env.AI_PROVIDER = 'mock';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    const factory = new AiProviderFactory(claudeProvider, mockProvider);

    expect(factory.getProvider()).toBe(mockProvider);
  });

  it('throws for an unknown provider name instead of silently falling back', () => {
    process.env.AI_PROVIDER = 'some-unsupported-provider';
    const factory = new AiProviderFactory(claudeProvider, mockProvider);

    expect(() => factory.getProvider()).toThrow(/Unknown AI_PROVIDER/);
  });
});
