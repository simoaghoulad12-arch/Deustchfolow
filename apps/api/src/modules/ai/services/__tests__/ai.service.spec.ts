import { z } from 'zod';
import { APIConnectionTimeoutError, RateLimitError } from '@anthropic-ai/sdk';
import { AiService } from '../ai.service';
import { AiProviderError, AiValidationError } from '../ai-errors';
import type { AiProviderFactory } from '../../providers/ai-provider.factory';
import type { AiObservabilityLogger } from '../../logging/ai-observability.logger';
import type { AiProvider } from '../../providers/ai-provider.interface';

const TestSchema = z.object({ response: z.string() });

function buildProviderFactoryMock(provider: AiProvider) {
  return { getProvider: jest.fn().mockReturnValue(provider) } as unknown as AiProviderFactory;
}

function buildObservabilityMock() {
  return { logSuccess: jest.fn(), logFailure: jest.fn() } as unknown as AiObservabilityLogger;
}

describe('AiService', () => {
  it('returns the parsed data when the provider response matches the schema', async () => {
    const provider: AiProvider = {
      name: 'fake',
      complete: jest.fn().mockResolvedValue({
        data: { response: 'Hallo!' },
        provider: 'fake',
        model: 'fake-model',
        usage: { inputTokens: 5, outputTokens: 3 },
        latencyMs: 10,
      }),
    };
    const observability = buildObservabilityMock();
    const service = new AiService(buildProviderFactoryMock(provider), observability);

    const result = await service.complete({
      feature: 'tutor',
      systemPrompt: 'system',
      userMessage: 'hi',
      schema: TestSchema,
      schemaName: 'test_schema',
      schemaDescription: 'desc',
    });

    expect(result).toEqual({ response: 'Hallo!' });
    expect(observability.logSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'tutor', provider: 'fake', model: 'fake-model' }),
    );
  });

  it('throws AiValidationError and never returns unvalidated data when the schema does not match', async () => {
    const provider: AiProvider = {
      name: 'fake',
      complete: jest.fn().mockResolvedValue({
        data: { response: 42 }, // wrong type — response must be a string
        provider: 'fake',
        model: 'fake-model',
        usage: { inputTokens: 5, outputTokens: 3 },
        latencyMs: 10,
      }),
    };
    const observability = buildObservabilityMock();
    const service = new AiService(buildProviderFactoryMock(provider), observability);

    await expect(
      service.complete({
        feature: 'tutor',
        systemPrompt: 'system',
        userMessage: 'hi',
        schema: TestSchema,
        schemaName: 'test_schema',
        schemaDescription: 'desc',
      }),
    ).rejects.toBeInstanceOf(AiValidationError);

    expect(observability.logFailure).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'tutor', provider: 'fake' }),
    );
  });

  it('wraps a provider-level failure (network/auth/etc.) in AiProviderError', async () => {
    const provider: AiProvider = {
      name: 'fake',
      complete: jest.fn().mockRejectedValue(new Error('network down')),
    };
    const observability = buildObservabilityMock();
    const service = new AiService(buildProviderFactoryMock(provider), observability);

    await expect(
      service.complete({
        feature: 'writing_correction',
        systemPrompt: 'system',
        userMessage: 'hi',
        schema: TestSchema,
        schemaName: 'test_schema',
        schemaDescription: 'desc',
      }),
    ).rejects.toBeInstanceOf(AiProviderError);

    expect(observability.logFailure).toHaveBeenCalledWith(
      expect.objectContaining({ feature: 'writing_correction', errorMessage: 'network down' }),
    );
  });

  // Phase 4.5 quality gate, section 13: the app must never crash on a
  // provider timeout or rate limit — both must collapse into the same
  // safe AiProviderError -> controlled fallback path as any other
  // provider failure. Using the real @anthropic-ai/sdk error classes
  // here (not a generic Error) proves that holds for the actual shapes
  // the SDK throws, not just a hypothetical one.
  it('wraps a provider timeout (APIConnectionTimeoutError) in AiProviderError', async () => {
    const provider: AiProvider = {
      name: 'fake',
      complete: jest.fn().mockRejectedValue(new APIConnectionTimeoutError()),
    };
    const service = new AiService(buildProviderFactoryMock(provider), buildObservabilityMock());

    await expect(
      service.complete({
        feature: 'tutor',
        systemPrompt: 'system',
        userMessage: 'hi',
        schema: TestSchema,
        schemaName: 'test_schema',
        schemaDescription: 'desc',
      }),
    ).rejects.toBeInstanceOf(AiProviderError);
  });

  it('wraps a provider rate limit (RateLimitError, status 429) in AiProviderError', async () => {
    const rateLimitError = new RateLimitError(
      429,
      { type: 'rate_limit_error', message: 'Rate limit exceeded' },
      'Rate limit exceeded',
      undefined,
    );
    const provider: AiProvider = {
      name: 'fake',
      complete: jest.fn().mockRejectedValue(rateLimitError),
    };
    const service = new AiService(buildProviderFactoryMock(provider), buildObservabilityMock());

    await expect(
      service.complete({
        feature: 'tutor',
        systemPrompt: 'system',
        userMessage: 'hi',
        schema: TestSchema,
        schemaName: 'test_schema',
        schemaDescription: 'desc',
      }),
    ).rejects.toBeInstanceOf(AiProviderError);
  });
});
