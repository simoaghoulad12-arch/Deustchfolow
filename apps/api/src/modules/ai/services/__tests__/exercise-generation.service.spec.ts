import { NotFoundException } from '@nestjs/common';
import { ExerciseGenerationService } from '../exercise-generation.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';
import type { ProgressService } from '../../../learning/progress/progress.service';
import type { AiSuggestedExercise } from '@deutschflow/types';

const exercise: AiSuggestedExercise = {
  type: 'MULTIPLE_CHOICE',
  prompt: 'Ich gehe ___ Schule.',
  options: [
    { id: 'a', text: 'zur' },
    { id: 'b', text: 'zum' },
  ],
  correctAnswer: 'zur',
  skill: 'GRAMMAR',
};

function buildPrismaMock(message: { metadata: unknown } | null) {
  return {
    client: {
      conversationMessage: {
        findFirst: jest.fn().mockResolvedValue(message),
      },
    },
  } as unknown as PrismaService;
}

function buildProgressServiceMock() {
  return { recordSkillAttempt: jest.fn().mockResolvedValue(undefined) } as unknown as ProgressService;
}

describe('ExerciseGenerationService', () => {
  describe('sanitize', () => {
    it('strips correctAnswer but keeps every other field', () => {
      const service = new ExerciseGenerationService(buildPrismaMock(null), buildProgressServiceMock());

      const publicExercise = service.sanitize(exercise);

      expect(publicExercise).toEqual({
        type: 'MULTIPLE_CHOICE',
        prompt: 'Ich gehe ___ Schule.',
        options: [
          { id: 'a', text: 'zur' },
          { id: 'b', text: 'zum' },
        ],
        skill: 'GRAMMAR',
      });
      expect(publicExercise).not.toHaveProperty('correctAnswer');
    });
  });

  describe('answer', () => {
    it('grades case- and whitespace-insensitively and forwards the result to the Learning Engine, never touching progress directly', async () => {
      const prisma = buildPrismaMock({ metadata: { suggestedExercise: exercise } });
      const progressService = buildProgressServiceMock();
      const service = new ExerciseGenerationService(prisma, progressService);

      const result = await service.answer('user-1', {
        sessionId: 'session-1',
        messageId: 'message-1',
        answer: '  ZUR  ',
      });

      expect(result.isCorrect).toBe(true);
      expect(progressService.recordSkillAttempt).toHaveBeenCalledWith('user-1', 'GRAMMAR', true);
    });

    it('grades a wrong answer as incorrect', async () => {
      const prisma = buildPrismaMock({ metadata: { suggestedExercise: exercise } });
      const progressService = buildProgressServiceMock();
      const service = new ExerciseGenerationService(prisma, progressService);

      const result = await service.answer('user-1', {
        sessionId: 'session-1',
        messageId: 'message-1',
        answer: 'zum',
      });

      expect(result.isCorrect).toBe(false);
      expect(progressService.recordSkillAttempt).toHaveBeenCalledWith('user-1', 'GRAMMAR', false);
    });

    it('scopes the lookup to the calling user — another user\'s message id resolves to nothing', async () => {
      const prisma = buildPrismaMock(null); // findFirst's where already filters by session.userId
      const service = new ExerciseGenerationService(prisma, buildProgressServiceMock());

      await expect(
        service.answer('user-1', { sessionId: 'session-1', messageId: 'someone-elses-message', answer: 'zur' }),
      ).rejects.toBeInstanceOf(NotFoundException);

      expect(prisma.client.conversationMessage.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 'someone-elses-message',
            sessionId: 'session-1',
            session: { userId: 'user-1' },
          }),
        }),
      );
    });

    it('throws NotFoundException when the message has no suggested exercise to grade', async () => {
      const prisma = buildPrismaMock({ metadata: {} });
      const service = new ExerciseGenerationService(prisma, buildProgressServiceMock());

      await expect(
        service.answer('user-1', { sessionId: 'session-1', messageId: 'message-1', answer: 'zur' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
