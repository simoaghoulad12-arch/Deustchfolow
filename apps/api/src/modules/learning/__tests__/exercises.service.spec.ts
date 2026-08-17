import { NotFoundException } from '@nestjs/common';
import { ExercisesService } from '../exercises/exercises.service';
import type { PrismaService } from '../../../common/prisma/prisma.service';
import type { ProgressService } from '../progress/progress.service';

const mcExercise = {
  id: 'exercise-1',
  type: 'MULTIPLE_CHOICE',
  prompt: 'Wie heißt du?',
  difficulty: 1,
  order: 1,
  questions: [
    {
      id: 'question-1',
      text: 'Wie heißt du?',
      order: 0,
      options: [
        { id: 'option-correct', text: 'Wie heißt du?' },
        { id: 'option-wrong', text: 'Wie alt bist du?' },
      ],
    },
  ],
};

function buildPrismaMock() {
  return {
    client: {
      lesson: { findUnique: jest.fn().mockResolvedValue({ id: 'lesson-1' }) },
      exercise: {
        findMany: jest.fn().mockResolvedValue([mcExercise]),
        findUnique: jest.fn().mockResolvedValue({
          id: 'exercise-1',
          type: 'MULTIPLE_CHOICE',
          explanation: 'Das ist die richtige Antwort.',
          lessonId: 'lesson-1',
          lesson: { skill: 'SPEAKING' },
          questions: [
            {
              correctAnswer: null,
              options: [
                { id: 'option-correct', text: 'Wie heißt du?', isCorrect: true, order: 0 },
                { id: 'option-wrong', text: 'Wie alt bist du?', isCorrect: false, order: 1 },
              ],
            },
          ],
        }),
      },
      exerciseAttempt: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn().mockResolvedValue({ attemptNumber: 1 }),
      },
    },
  } as unknown as PrismaService;
}

function buildProgressServiceMock() {
  return {
    recalculateLessonProgress: jest.fn().mockResolvedValue(undefined),
    recordSkillAttempt: jest.fn().mockResolvedValue(undefined),
  } as unknown as ProgressService;
}

describe('ExercisesService', () => {
  describe('findByLessonSlug', () => {
    it('loads exercises for a lesson', async () => {
      const prisma = buildPrismaMock();
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      const exercises = await service.findByLessonSlug('sich-vorstellen');

      expect(exercises).toHaveLength(1);
    });

    it('never leaks isCorrect, correctAnswer, explanation, or option order to the client', async () => {
      const prisma = buildPrismaMock();
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      const exercises = await service.findByLessonSlug('sich-vorstellen');
      const serialized = JSON.stringify(exercises);

      expect(serialized).not.toContain('isCorrect');
      expect(serialized).not.toContain('correctAnswer');
      expect(serialized).not.toContain('explanation');
      expect(exercises[0]!.questions[0]!.options[0]).not.toHaveProperty('order');
    });

    it('throws NotFoundException for an unknown lesson', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.lesson.findUnique as jest.Mock).mockResolvedValue(null);
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      await expect(service.findByLessonSlug('unknown')).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('submitAttempt', () => {
    it('grades a correct answer and stores the attempt for the calling user', async () => {
      const prisma = buildPrismaMock();
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      const result = await service.submitAttempt('user-1', 'exercise-1', { answer: 'option-correct' });

      expect(result.isCorrect).toBe(true);
      expect(result.explanation).toBe('Das ist die richtige Antwort.');
      expect(prisma.client.exerciseAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-1',
            exerciseId: 'exercise-1',
            answer: 'option-correct',
            isCorrect: true,
            attemptNumber: 1,
          }),
        }),
      );
    });

    it('grades a wrong answer as incorrect', async () => {
      const prisma = buildPrismaMock();
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      const result = await service.submitAttempt('user-1', 'exercise-1', { answer: 'option-wrong' });

      expect(result.isCorrect).toBe(false);
    });

    it('increments attemptNumber based on the user\'s previous attempts at this exercise', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.exerciseAttempt.count as jest.Mock).mockResolvedValue(2);
      (prisma.client.exerciseAttempt.create as jest.Mock).mockResolvedValue({ attemptNumber: 3 });
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      const result = await service.submitAttempt('user-1', 'exercise-1', { answer: 'option-correct' });

      expect(result.attemptNumber).toBe(3);
      expect(prisma.client.exerciseAttempt.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', exerciseId: 'exercise-1' },
      });
    });

    it('recalculates lesson progress and skill score after an attempt', async () => {
      const prisma = buildPrismaMock();
      const progressService = buildProgressServiceMock();
      const service = new ExercisesService(prisma, progressService);

      await service.submitAttempt('user-1', 'exercise-1', { answer: 'option-correct' });

      expect(progressService.recalculateLessonProgress).toHaveBeenCalledWith('user-1', 'lesson-1');
      expect(progressService.recordSkillAttempt).toHaveBeenCalledWith('user-1', 'SPEAKING', true);
    });

    it('throws NotFoundException for an unknown exercise', async () => {
      const prisma = buildPrismaMock();
      (prisma.client.exercise.findUnique as jest.Mock).mockResolvedValue(null);
      const service = new ExercisesService(prisma, buildProgressServiceMock());

      await expect(
        service.submitAttempt('user-1', 'unknown', { answer: 'x' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
