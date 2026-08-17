import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';
import { gradeAttempt } from './grading';
import type { SubmitAttemptDto } from '../dto/submit-attempt.dto';

/** Fisher-Yates — used to randomize option display order so neither storage order nor array position leaks the answer. */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
}

@Injectable()
export class ExercisesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  /**
   * Sanitized on purpose: never returns `Option.isCorrect`,
   * `Question.correctAnswer`, `Exercise.explanation`, or `Option.order` —
   * those would let a student read the answer straight out of the network
   * response (for ORDER_WORDS, `order` literally *is* the answer). Options
   * are also shuffled server-side before returning, so neither their
   * storage order nor position reveals which one is correct. One query
   * (nested `include`), not N+1.
   */
  async findByLessonSlug(lessonSlug: string) {
    const lesson = await this.prisma.client.lesson.findUnique({
      where: { slug: lessonSlug },
      select: { id: true },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found.');
    }

    const exercises = await this.prisma.client.exercise.findMany({
      where: { lessonId: lesson.id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        type: true,
        prompt: true,
        difficulty: true,
        order: true,
        questions: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            text: true,
            order: true,
            options: {
              select: { id: true, text: true },
            },
          },
        },
      },
    });

    return exercises.map((exercise) => ({
      ...exercise,
      questions: exercise.questions.map((question) => ({
        ...question,
        options: shuffle(question.options),
      })),
    }));
  }

  async submitAttempt(userId: string, exerciseId: string, dto: SubmitAttemptDto) {
    const exercise = await this.prisma.client.exercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        type: true,
        explanation: true,
        lessonId: true,
        lesson: { select: { skill: true } },
        questions: {
          select: {
            correctAnswer: true,
            options: { select: { id: true, text: true, isCorrect: true, order: true } },
          },
        },
      },
    });

    if (!exercise) {
      throw new NotFoundException('Exercise not found.');
    }

    const isCorrect = gradeAttempt(exercise, dto.answer);

    const previousAttemptCount = await this.prisma.client.exerciseAttempt.count({
      where: { userId, exerciseId },
    });

    const attempt = await this.prisma.client.exerciseAttempt.create({
      data: {
        userId,
        exerciseId,
        answer: dto.answer,
        isCorrect,
        attemptNumber: previousAttemptCount + 1,
        timeSpentMs: dto.timeSpentMs,
      },
    });

    await Promise.all([
      this.progressService.recalculateLessonProgress(userId, exercise.lessonId),
      this.progressService.recordSkillAttempt(userId, exercise.lesson.skill, isCorrect),
    ]);

    return {
      isCorrect,
      explanation: exercise.explanation,
      attemptNumber: attempt.attemptNumber,
    };
  }
}
