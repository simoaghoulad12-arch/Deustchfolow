import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { CEFRLevel, PracticeExercisePayload, PracticeExerciseType } from '@deutschflow/types';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { LearnerService } from '../learner/learner.service';
import { gradeExercise, publicPayload } from '../exercises/exercise-grader';
import {
  PLACEMENT_MAX_QUESTIONS,
  PLACEMENT_SKILLS,
  estimatePlacementLevel,
  nextPlacementLevel,
  nextPlacementSkill,
  placementSkillScores,
  type PlacementAnswer,
} from './placement-engine';

const MAX_SESSION_MS = 2 * 60 * 60 * 1000;

/**
 * Adaptive placement test (spec section 6). The test has no session row:
 * its state is the learner's attempts on placement items since `since`
 * (returned by start), so the server recomputes the staircase on every
 * call and the browser never holds answers or the running estimate.
 */
@Injectable()
export class PlacementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly learner: LearnerService,
  ) {}

  start() {
    return { since: new Date().toISOString(), totalQuestions: PLACEMENT_MAX_QUESTIONS };
  }

  private parseSince(since: string): Date {
    const date = new Date(since);
    if (Number.isNaN(date.getTime()) || date.getTime() > Date.now() + 60_000 || Date.now() - date.getTime() > MAX_SESSION_MS) {
      throw new BadRequestException('This placement test has expired. Please start again.');
    }
    return date;
  }

  private async answered(userId: string, lang: string, since: Date) {
    const attempts = await this.prisma.client.practiceAttempt.findMany({
      where: { userId, createdAt: { gte: since }, exercise: { isPlacement: true, languageCode: lang } },
      orderBy: { createdAt: 'asc' },
      select: { exerciseId: true, isCorrect: true, exercise: { select: { cefrLevel: true, skill: true } } },
    });
    return attempts;
  }

  async next(userId: string, since: string, options: { speech?: boolean } = {}) {
    const from = this.parseSince(since);
    const lang = await this.context.activeLanguage(userId);
    const attempts = await this.answered(userId, lang, from);
    const answers: PlacementAnswer[] = attempts.map((a) => ({ level: a.exercise.cefrLevel as CEFRLevel, correct: a.isCorrect }));
    if (answers.length >= PLACEMENT_MAX_QUESTIONS) return { done: true as const, answered: answers.length };

    const target = nextPlacementLevel(answers);
    const seen = attempts.map((a) => a.exerciseId);
    const pool = await this.prisma.client.practiceExercise.findMany({
      where: {
        languageCode: lang,
        isPlacement: true,
        id: { notIn: seen },
        ...(options.speech ? {} : { skill: { not: 'SPEAKING' as const } }),
      },
      select: { id: true, type: true, prompt: true, payload: true, cefrLevel: true, skill: true },
    });
    if (pool.length === 0) return { done: true as const, answered: answers.length };
    // Rotate through the skills so every one gets a score, then pick the item closest to the staircase level.
    const available = PLACEMENT_SKILLS.filter((skill) => pool.some((p) => p.skill === skill));
    const skill = nextPlacementSkill(
      attempts.map((a) => a.exercise.skill),
      available,
    );
    const candidates = pool.filter((p) => p.skill === skill);
    const order = ['A1', 'A2', 'B1', 'B2'];
    const item = [...(candidates.length ? candidates : pool)].sort(
      (a, b) => Math.abs(order.indexOf(a.cefrLevel) - order.indexOf(target)) - Math.abs(order.indexOf(b.cefrLevel) - order.indexOf(target)) || a.id.localeCompare(b.id),
    )[0]!;
    return {
      done: false as const,
      answered: answers.length,
      totalQuestions: PLACEMENT_MAX_QUESTIONS,
      question: {
        id: item.id,
        type: item.type,
        prompt: item.prompt,
        skill: item.skill,
        payload: publicPayload(item.type as PracticeExerciseType, item.payload as PracticeExercisePayload),
      },
    };
  }

  async answer(userId: string, input: { since: string; exerciseId: string; answer: string }) {
    const from = this.parseSince(input.since);
    const lang = await this.context.activeLanguage(userId);
    const exercise = await this.prisma.client.practiceExercise.findFirst({
      where: { id: input.exerciseId, isPlacement: true, languageCode: lang },
    });
    if (!exercise) throw new NotFoundException('Question not found.');
    const already = await this.prisma.client.practiceAttempt.findFirst({
      where: { userId, exerciseId: exercise.id, createdAt: { gte: from } },
      select: { id: true },
    });
    if (already) throw new BadRequestException('This question was already answered.');
    const grade = gradeExercise(exercise.type as PracticeExerciseType, exercise.payload as PracticeExercisePayload, input.answer);
    await this.prisma.client.practiceAttempt.create({
      data: { userId, exerciseId: exercise.id, answer: input.answer.slice(0, 500), isCorrect: grade.isCorrect, score: grade.score },
    });
    return { correct: grade.isCorrect };
  }

  async finish(userId: string, since: string) {
    const from = this.parseSince(since);
    const lang = await this.context.activeLanguage(userId);
    const attempts = await this.answered(userId, lang, from);
    const answers: PlacementAnswer[] = attempts.map((a) => ({ level: a.exercise.cefrLevel as CEFRLevel, correct: a.isCorrect }));
    const level = answers.length ? estimatePlacementLevel(answers) : 'A1';

    const skillScores = placementSkillScores(attempts.map((a) => ({ skill: a.exercise.skill, correct: a.isCorrect })));

    const result = await this.prisma.client.placementResult.create({
      data: {
        userId,
        languageCode: lang,
        estimatedLevel: level,
        skillScores: skillScores as Prisma.InputJsonValue,
        answers: answers as unknown as Prisma.InputJsonValue,
      },
    });
    await this.learner.setLevel(userId, lang, level);
    const reward = answers.length >= 5 ? await this.gamification.rewardFor('test') : 0;
    if (reward > 0) await this.gamification.awardXp(userId, lang, 'test', reward, { refId: result.id, minutes: 5 });
    const startModule = await this.prisma.client.module.findFirst({
      where: { course: { slug: `${lang}-${level.toLowerCase()}-curriculum` } },
      orderBy: { order: 'asc' },
      select: { title: true },
    });
    return {
      level,
      skillScores,
      answered: answers.length,
      correct: answers.filter((a) => a.correct).length,
      xpAwarded: reward,
      recommendation: startModule ? `Start with ${level}, module 1: ${startModule.title}.` : `Start with the ${level} missions in your language world.`,
    };
  }

  /** "Skip the test": start at A1 (or a self-selected level) right away. */
  async skip(userId: string, level: CEFRLevel) {
    const lang = await this.context.activeLanguage(userId);
    await this.learner.setLevel(userId, lang, level);
    return { level };
  }
}
