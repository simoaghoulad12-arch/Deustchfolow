import { ForbiddenException } from '@nestjs/common';
import { CorrectionService } from '../correction.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { AiService } from '../ai.service';
import type { AiContextBuilder } from '../../context/ai-context-builder.service';
import type { PromptManager } from '../../prompts/prompt-manager.service';
import type { AiUsageService } from '../../usage/ai-usage.service';
import type { EntitlementsService } from '../../../entitlements/entitlements.service';
import type { AiLearnerContext } from '../../context/ai-context.types';
import type { WritingCorrectionResponse } from '@deutschflow/types';

const fakeContext: AiLearnerContext = {
  userId: 'user-1',
  currentLevel: 'A2' as WritingCorrectionResponse['detectedLevel'],
  targetLevel: null,
  learningGoal: null,
  currentSkill: null,
  currentLessonTitle: null,
  recentErrorCategories: [],
  weakSkills: [],
};

const validCorrection: WritingCorrectionResponse = {
  correctedText: 'Ich gehe zur Schule.',
  errors: [
    {
      original: 'Ich gehe zu Schule.',
      correction: 'Ich gehe zur Schule.',
      category: 'ARTICLE',
      explanation: 'Nach "gehen zu" braucht "die Schule" den Dativ-Artikel "zur".',
      severity: 'LOW',
    },
  ],
  explanation: 'Kleiner Artikelfehler.',
  improvedVersion: null,
  detectedLevel: 'A2',
  score: 85,
};

function buildDeps(options?: { hasBasic?: boolean; hasAdvanced?: boolean; maxInputChars?: number }) {
  const prisma = {
    client: {
      writingSubmission: {
        create: jest.fn().mockResolvedValue({ id: 'submission-1' }),
      },
    },
  } as unknown as PrismaService;

  const aiService = { complete: jest.fn() } as unknown as AiService;
  const contextBuilder = { build: jest.fn().mockResolvedValue(fakeContext) } as unknown as AiContextBuilder;
  const promptManager = {
    buildWritingCorrectionPrompt: jest.fn().mockReturnValue('a system prompt'),
  } as unknown as PromptManager;
  const usageService = {
    getUsageSummary: jest.fn().mockResolvedValue({
      limits: { maxInputChars: options?.maxInputChars ?? 500, writingCorrectionsPerDay: 3, tutorMessagesPerDay: 10 },
      usedToday: { tutor: 0, writing_correction: 0 },
    }),
    assertWithinLimitAndRecord: jest.fn().mockResolvedValue(undefined),
  } as unknown as AiUsageService;
  const entitlementsService = {
    canAccess: jest.fn().mockImplementation(async (_userId: string, entitlement: string) => {
      if (entitlement === 'LIMITED_AI') return options?.hasBasic ?? true;
      if (entitlement === 'WRITING_ADVANCED') return options?.hasAdvanced ?? false;
      return false;
    }),
  } as unknown as EntitlementsService;

  return { prisma, aiService, contextBuilder, promptManager, usageService, entitlementsService };
}

describe('CorrectionService', () => {
  it('persists a successful correction and returns it with failed: false', async () => {
    const deps = buildDeps();
    (deps.aiService.complete as jest.Mock).mockResolvedValue(validCorrection);
    const service = new CorrectionService(
      deps.aiService,
      deps.contextBuilder,
      deps.promptManager,
      deps.usageService,
      deps.entitlementsService,
      deps.prisma,
    );

    const result = await service.correctWriting('user-1', { text: 'Ich gehe zu Schule.' });

    expect(result.failed).toBe(false);
    expect(result.id).toBe('submission-1');
    expect(result.correctedText).toBe('Ich gehe zur Schule.');
    expect(deps.prisma.client.writingSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: 'user-1',
          text: 'Ich gehe zu Schule.',
          correctedText: 'Ich gehe zur Schule.',
          detectedLevel: 'A2',
          score: 85,
        }),
      }),
    );
  });

  it('falls back to a controlled response (never invented content) when the AI call fails', async () => {
    const deps = buildDeps();
    (deps.aiService.complete as jest.Mock).mockRejectedValue(new Error('provider down'));
    const service = new CorrectionService(
      deps.aiService,
      deps.contextBuilder,
      deps.promptManager,
      deps.usageService,
      deps.entitlementsService,
      deps.prisma,
    );

    const result = await service.correctWriting('user-1', { text: 'Ich gehe zu Schule.' });

    expect(result.failed).toBe(true);
    expect(result.correctedText).toBe('Ich gehe zu Schule.'); // echoes the original, nothing invented
    expect(result.errors).toEqual([]);
    expect(deps.prisma.client.writingSubmission.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ correctedText: null, detectedLevel: null, score: null }),
      }),
    );
  });

  it('rejects with ForbiddenException when the plan has no AI writing entitlement at all', async () => {
    const deps = buildDeps({ hasBasic: false, hasAdvanced: false });
    const service = new CorrectionService(
      deps.aiService,
      deps.contextBuilder,
      deps.promptManager,
      deps.usageService,
      deps.entitlementsService,
      deps.prisma,
    );

    await expect(service.correctWriting('user-1', { text: 'Text.' })).rejects.toBeInstanceOf(
      ForbiddenException,
    );
    expect(deps.aiService.complete).not.toHaveBeenCalled();
  });

  it('rejects with ForbiddenException when the text exceeds the plan input-length limit', async () => {
    const deps = buildDeps({ maxInputChars: 10 });
    const service = new CorrectionService(
      deps.aiService,
      deps.contextBuilder,
      deps.promptManager,
      deps.usageService,
      deps.entitlementsService,
      deps.prisma,
    );

    await expect(
      service.correctWriting('user-1', { text: 'This text is much longer than ten characters.' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(deps.usageService.assertWithinLimitAndRecord).not.toHaveBeenCalled();
    expect(deps.aiService.complete).not.toHaveBeenCalled();
  });

  it('resolves the deeper "advanced" prompt depth only for WRITING_ADVANCED entitlement holders', async () => {
    const deps = buildDeps({ hasBasic: true, hasAdvanced: true });
    (deps.aiService.complete as jest.Mock).mockResolvedValue(validCorrection);
    const service = new CorrectionService(
      deps.aiService,
      deps.contextBuilder,
      deps.promptManager,
      deps.usageService,
      deps.entitlementsService,
      deps.prisma,
    );

    await service.correctWriting('user-1', { text: 'Ich gehe zu Schule.' });

    expect(deps.promptManager.buildWritingCorrectionPrompt).toHaveBeenCalledWith(fakeContext, 'advanced');
  });
});
