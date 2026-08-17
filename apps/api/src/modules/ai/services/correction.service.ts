import { ForbiddenException, Injectable } from '@nestjs/common';
import { WritingCorrectionResponseSchema, type WritingCorrectionResponse } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { AiContextBuilder } from '../context/ai-context-builder.service';
import { PromptManager } from '../prompts/prompt-manager.service';
import { AiUsageService } from '../usage/ai-usage.service';
import { AiService } from './ai.service';
import type { AiResponseDepth } from '../prompts/shared';

export interface WritingCorrectionResult extends WritingCorrectionResponse {
  id: string;
  failed: boolean;
}

export interface CorrectWritingInput {
  text: string;
  lessonId?: string;
  targetLevel?: WritingCorrectionResponse['detectedLevel'];
}

@Injectable()
export class CorrectionService {
  constructor(
    private readonly aiService: AiService,
    private readonly contextBuilder: AiContextBuilder,
    private readonly promptManager: PromptManager,
    private readonly usageService: AiUsageService,
    private readonly entitlementsService: EntitlementsService,
    private readonly prisma: PrismaService,
  ) {}

  async correctWriting(userId: string, input: CorrectWritingInput): Promise<WritingCorrectionResult> {
    const depth = await this.resolveDepthOrThrow(userId);

    const context = await this.contextBuilder.build(userId, { lessonId: input.lessonId });
    const maxInputChars = (await this.usageService.getUsageSummary(userId)).limits.maxInputChars;
    if (input.text.length > maxInputChars) {
      throw new ForbiddenException(
        `Text exceeds the maximum length of ${maxInputChars} characters for your plan.`,
      );
    }

    await this.usageService.assertWithinLimitAndRecord(userId, 'writing_correction');

    const effectiveContext = input.targetLevel
      ? { ...context, currentLevel: input.targetLevel }
      : context;

    let result: WritingCorrectionResponse;
    let failed = false;
    try {
      result = await this.aiService.complete({
        feature: 'writing_correction',
        systemPrompt: this.promptManager.buildWritingCorrectionPrompt(effectiveContext, depth),
        userMessage: input.text,
        schema: WritingCorrectionResponseSchema,
        schemaName: 'writing_correction_result',
        schemaDescription: 'Structured correction of a German writing submission.',
        maxOutputTokens: 1500,
      });
    } catch {
      failed = true;
      result = this.buildFallback(input.text, context.currentLevel);
    }

    const submission = await this.prisma.client.writingSubmission.create({
      data: {
        userId,
        lessonId: input.lessonId,
        text: input.text,
        correctedText: failed ? null : result.correctedText,
        errors: failed ? undefined : result.errors,
        detectedLevel: failed ? null : result.detectedLevel,
        score: failed ? null : result.score,
      },
    });

    return { id: submission.id, failed, ...result };
  }

  private async resolveDepthOrThrow(userId: string): Promise<AiResponseDepth> {
    const [hasBasic, hasAdvanced] = await Promise.all([
      this.entitlementsService.canAccess(userId, 'LIMITED_AI'),
      this.entitlementsService.canAccess(userId, 'WRITING_ADVANCED'),
    ]);

    if (!hasBasic && !hasAdvanced) {
      throw new ForbiddenException('Your plan does not include AI writing correction.');
    }

    return hasAdvanced ? 'advanced' : 'basic';
  }

  /** Echoes the original text back (not fabricated content) with `failed: true` set by the caller. */
  private buildFallback(
    originalText: string,
    level: WritingCorrectionResponse['detectedLevel'],
  ): WritingCorrectionResponse {
    return {
      correctedText: originalText,
      errors: [],
      explanation:
        'Die Korrektur konnte gerade nicht erstellt werden. Bitte versuche es in Kürze erneut.',
      improvedVersion: null,
      detectedLevel: level,
      score: 0,
    };
  }
}
