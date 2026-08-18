import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { TutorResponseSchema, type TutorResponse, type AiSuggestedExercisePublic } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { EntitlementsService } from '../../entitlements/entitlements.service';
import { AiContextBuilder } from '../context/ai-context-builder.service';
import { PromptManager } from '../prompts/prompt-manager.service';
import { AiUsageService } from '../usage/ai-usage.service';
import { AiService } from './ai.service';
import { ExerciseGenerationService } from './exercise-generation.service';
import type { AiConversationTurn } from '../providers/ai-provider.interface';
import type { AiResponseDepth } from '../prompts/shared';

const MAX_HISTORY_MESSAGES = 10;

export interface TutorTurnResult extends Omit<TutorResponse, 'suggestedExercise'> {
  sessionId: string;
  messageId: string;
  failed: boolean;
  suggestedExercise: AiSuggestedExercisePublic | null;
}

export interface SendTutorMessageInput {
  message: string;
  sessionId?: string;
  lessonId?: string;
  /** Only meaningful when starting a NEW session — ignored for an existing one, which keeps whatever it was started with. */
  simulationId?: string;
}

@Injectable()
export class TutorService {
  constructor(
    private readonly aiService: AiService,
    private readonly contextBuilder: AiContextBuilder,
    private readonly promptManager: PromptManager,
    private readonly usageService: AiUsageService,
    private readonly entitlementsService: EntitlementsService,
    private readonly exerciseGenerationService: ExerciseGenerationService,
    private readonly prisma: PrismaService,
  ) {}

  async sendMessage(userId: string, input: SendTutorMessageInput): Promise<TutorTurnResult> {
    const depth = await this.resolveDepthOrThrow(userId);

    const maxInputChars = (await this.usageService.getUsageSummary(userId)).limits.maxInputChars;
    if (input.message.length > maxInputChars) {
      throw new ForbiddenException(
        `Message exceeds the maximum length of ${maxInputChars} characters for your plan.`,
      );
    }

    await this.usageService.assertWithinLimitAndRecord(userId, 'tutor');

    const session = input.sessionId
      ? await this.getOwnedSession(userId, input.sessionId)
      : await this.createSession(userId, input.simulationId);

    const history = await this.getRecentHistory(session.id);
    const context = await this.contextBuilder.build(userId, { lessonId: input.lessonId });
    const systemPrompt = await this.resolveSystemPrompt(session.simulationId, context, depth);

    let result: TutorResponse;
    let failed = false;
    try {
      result = await this.aiService.complete({
        feature: 'tutor',
        systemPrompt,
        userMessage: input.message,
        history,
        schema: TutorResponseSchema,
        schemaName: 'tutor_response',
        schemaDescription: 'Structured tutor reply with corrections and an optional suggested exercise.',
        maxOutputTokens: 1200,
      });
    } catch {
      failed = true;
      result = this.buildFallback(context.currentLevel, context.currentSkill);
    }

    await this.prisma.client.conversationMessage.create({
      data: { sessionId: session.id, role: 'USER', content: input.message },
    });

    const assistantMessage = await this.prisma.client.conversationMessage.create({
      data: {
        sessionId: session.id,
        role: 'ASSISTANT',
        content: result.response,
        // Full exercise (with correctAnswer) is kept server-side for
        // grading later — never returned to the client as-is (see
        // ExerciseGenerationService.sanitize()).
        metadata: {
          corrections: result.corrections,
          explanation: result.explanation,
          suggestedExercise: result.suggestedExercise,
          level: result.level,
          relevantSkill: result.relevantSkill,
        },
      },
    });

    return {
      sessionId: session.id,
      messageId: assistantMessage.id,
      failed,
      response: result.response,
      corrections: result.corrections,
      explanation: result.explanation,
      level: result.level,
      relevantSkill: result.relevantSkill,
      suggestedExercise: result.suggestedExercise
        ? this.exerciseGenerationService.sanitize(result.suggestedExercise)
        : null,
    };
  }

  async listSessions(userId: string) {
    return this.prisma.client.conversationSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  }

  async getSessionWithMessages(userId: string, sessionId: string) {
    const session = await this.getOwnedSession(userId, sessionId);

    const messages = await this.prisma.client.conversationMessage.findMany({
      where: { sessionId: session.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, role: true, content: true, metadata: true, createdAt: true },
    });

    return {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt,
      messages: messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt,
        // Same sanitization as the live response — a stored suggested
        // exercise's correctAnswer must never leak via history either.
        suggestedExercise: sanitizeStoredExercise(message.metadata),
      })),
    };
  }

  private async resolveDepthOrThrow(userId: string): Promise<AiResponseDepth> {
    const [hasBasic, hasAdvanced] = await Promise.all([
      this.entitlementsService.canAccess(userId, 'LIMITED_AI'),
      this.entitlementsService.canAccess(userId, 'AI_ADVANCED'),
    ]);

    if (!hasBasic && !hasAdvanced) {
      throw new ForbiddenException('Your plan does not include AI tutor access.');
    }

    return hasAdvanced ? 'advanced' : 'basic';
  }

  private async createSession(userId: string, simulationId?: string) {
    if (!simulationId) {
      return this.prisma.client.conversationSession.create({ data: { userId } });
    }

    const simulation = await this.prisma.client.simulation.findUnique({ where: { id: simulationId } });
    if (!simulation || !simulation.isActive) {
      throw new NotFoundException('Simulation not found.');
    }

    return this.prisma.client.conversationSession.create({
      data: { userId, simulationId, title: simulation.title },
    });
  }

  /** Real-Life Simulations (spec section 15) get a role-play system prompt instead of the general tutor one — same TutorResponseSchema contract either way, so nothing downstream needs to know which prompt produced a turn. */
  private async resolveSystemPrompt(
    simulationId: string | null,
    context: Awaited<ReturnType<AiContextBuilder['build']>>,
    depth: AiResponseDepth,
  ): Promise<string> {
    if (!simulationId) {
      return this.promptManager.buildTutorPrompt(context, depth);
    }

    const simulation = await this.prisma.client.simulation.findUnique({ where: { id: simulationId } });
    if (!simulation) {
      // Session already exists with this simulationId — a data
      // inconsistency, not a client error. Fall back to the general
      // tutor framing rather than failing the whole turn.
      return this.promptManager.buildTutorPrompt(context, depth);
    }

    return this.promptManager.buildSimulationPrompt(context, depth, {
      title: simulation.title,
      situation: simulation.situation,
      goal: simulation.goal,
      roles: simulation.roles,
      cefrLevel: simulation.cefrLevel,
    });
  }

  /** Ownership: a NotFoundException (not Forbidden) avoids confirming that another user's sessionId exists at all. */
  private async getOwnedSession(userId: string, sessionId: string) {
    const session = await this.prisma.client.conversationSession.findUnique({
      where: { id: sessionId },
    });
    if (!session || session.userId !== userId) {
      throw new NotFoundException('Conversation session not found.');
    }
    return session;
  }

  private async getRecentHistory(sessionId: string): Promise<AiConversationTurn[]> {
    // Simple context strategy (spec section 14): last N messages, no
    // summarization/memory yet — bounds cost and keeps context relevant
    // without a separate summarization AI call.
    const messages = await this.prisma.client.conversationMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      take: MAX_HISTORY_MESSAGES,
      select: { role: true, content: true },
    });

    return messages.reverse().map((message) => ({
      role: message.role === 'USER' ? ('user' as const) : ('assistant' as const),
      content: message.content,
    }));
  }

  private buildFallback(
    level: TutorResponse['level'],
    relevantSkill: TutorResponse['relevantSkill'] | null,
  ): TutorResponse {
    return {
      response: 'Entschuldigung, ich konnte gerade nicht antworten. Bitte versuche es erneut.',
      corrections: [],
      explanation: null,
      suggestedExercise: null,
      level,
      relevantSkill: relevantSkill ?? 'GRAMMAR',
    };
  }
}

function sanitizeStoredExercise(metadata: unknown): AiSuggestedExercisePublic | null {
  if (!metadata || typeof metadata !== 'object' || !('suggestedExercise' in metadata)) {
    return null;
  }
  const exercise = (metadata as { suggestedExercise?: unknown }).suggestedExercise;
  if (!exercise || typeof exercise !== 'object') return null;
  const { correctAnswer: _correctAnswer, ...publicFields } = exercise as Record<string, unknown>;
  return publicFields as AiSuggestedExercisePublic;
}
