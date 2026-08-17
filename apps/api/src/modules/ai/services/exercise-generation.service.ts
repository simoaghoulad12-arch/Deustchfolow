import { Injectable, NotFoundException } from '@nestjs/common';
import type { AiSuggestedExercise, AiSuggestedExercisePublic } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProgressService } from '../../learning/progress/progress.service';

function normalize(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

/**
 * Owns the lifecycle of an AI-suggested exercise: never persisted as a
 * curriculum Exercise row (see architecture decision record, section 1);
 * lives only in `ConversationMessage.metadata`, sanitized before it ever
 * reaches the browser, graded server-side, and fed into
 * `ProgressService.recordSkillAttempt()` — the same entry point real
 * lessons use. AI never touches UserSkillProgress directly.
 */
@Injectable()
export class ExerciseGenerationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  /** Strips the correct answer before the exercise is sent to the client. */
  sanitize(exercise: AiSuggestedExercise): AiSuggestedExercisePublic {
    const { correctAnswer: _correctAnswer, ...publicFields } = exercise;
    return publicFields;
  }

  async answer(
    userId: string,
    input: { sessionId: string; messageId: string; answer: string },
  ): Promise<{ isCorrect: boolean }> {
    const message = await this.prisma.client.conversationMessage.findFirst({
      where: {
        id: input.messageId,
        sessionId: input.sessionId,
        session: { userId },
      },
      select: { metadata: true },
    });

    if (!message) {
      throw new NotFoundException('Message not found.');
    }

    const metadata = message.metadata as { suggestedExercise?: AiSuggestedExercise } | null;
    const exercise = metadata?.suggestedExercise;
    if (!exercise) {
      throw new NotFoundException('This message has no suggested exercise.');
    }

    const isCorrect = normalize(input.answer) === normalize(exercise.correctAnswer);

    await this.progressService.recordSkillAttempt(userId, exercise.skill, isCorrect);

    return { isCorrect };
  }
}
