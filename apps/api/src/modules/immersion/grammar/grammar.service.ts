import { Injectable, NotFoundException } from '@nestjs/common';
import type { CEFRLevel, PracticeExercisePayload, PracticeExerciseType } from '@deutschflow/types';
import type { GrammarStage } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { DnaService } from '../dna/dna.service';
import { ErrorMemoryService } from '../errors/error-memory.service';
import { AssessmentService } from '../practice/assessment.service';
import { gradeExercise, isAutoGraded, publicPayload } from '../exercises/exercise-grader';

const STAGES: GrammarStage[] = ['EXPLANATION', 'EXAMPLES', 'GUIDED', 'AI_PRACTICE', 'FREE', 'ASSESSMENT'];

/** Mastery moves 25% of the way towards each result, so one lucky answer never masters a topic. */
export function nextMastery(current: number, score: number): number {
  return Math.round(current + (score - current) * 0.25);
}

/**
 * Grammar system (spec section 24): explanation → examples → guided
 * practice → AI practice → free use → assessment. Grammar is taught in
 * context; mistakes from exercises feed the same error memory as missions.
 */
@Injectable()
export class GrammarService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly dna: DnaService,
    private readonly errors: ErrorMemoryService,
    private readonly assessment: AssessmentService,
  ) {}

  async list(userId: string) {
    const lang = await this.context.activeLanguage(userId);
    const topics = await this.prisma.client.grammarTopic.findMany({
      where: { languageCode: lang, isActive: true },
      orderBy: [{ cefrLevel: 'asc' }, { order: 'asc' }],
      select: {
        id: true,
        slug: true,
        title: true,
        summary: true,
        cefrLevel: true,
        _count: { select: { exercises: true } },
        progress: { where: { userId }, select: { stage: true, mastery: true, attempts: true } },
      },
    });
    return topics.map(({ progress, _count, ...t }) => ({
      ...t,
      exerciseCount: _count.exercises,
      stage: progress[0]?.stage ?? null,
      mastery: progress[0]?.mastery ?? 0,
      attempts: progress[0]?.attempts ?? 0,
    }));
  }

  async topic(userId: string, slug: string) {
    const lang = await this.context.activeLanguage(userId);
    const topic = await this.prisma.client.grammarTopic.findUnique({
      where: { languageCode_slug: { languageCode: lang, slug } },
      include: {
        exercises: { orderBy: { createdAt: 'asc' } },
        progress: { where: { userId } },
      },
    });
    if (!topic || !topic.isActive) throw new NotFoundException('Grammar topic not found.');
    const { exercises, progress, ...rest } = topic;
    return {
      ...rest,
      progress: progress[0] ? { stage: progress[0].stage, mastery: progress[0].mastery, attempts: progress[0].attempts } : null,
      exercises: exercises.map((e) => ({
        id: e.id,
        type: e.type,
        prompt: e.prompt,
        skill: e.skill,
        payload: publicPayload(e.type as PracticeExerciseType, e.payload as PracticeExercisePayload),
      })),
    };
  }

  private async bumpProgress(userId: string, topicId: string, score: number, stageAtLeast: GrammarStage) {
    const existing = await this.prisma.client.grammarProgress.findUnique({ where: { userId_topicId: { userId, topicId } } });
    const current = existing?.stage ?? 'EXPLANATION';
    const stage = STAGES.indexOf(stageAtLeast) > STAGES.indexOf(current) ? stageAtLeast : current;
    const mastery = nextMastery(existing?.mastery ?? 0, score);
    return this.prisma.client.grammarProgress.upsert({
      where: { userId_topicId: { userId, topicId } },
      update: { stage, mastery, attempts: { increment: 1 } },
      create: { userId, topicId, stage, mastery, attempts: 1 },
    });
  }

  /** Marks the explanation/examples stage as seen. */
  async markStage(userId: string, slug: string, stage: GrammarStage) {
    const lang = await this.context.activeLanguage(userId);
    const topic = await this.prisma.client.grammarTopic.findUnique({ where: { languageCode_slug: { languageCode: lang, slug } }, select: { id: true } });
    if (!topic) throw new NotFoundException('Grammar topic not found.');
    const existing = await this.prisma.client.grammarProgress.findUnique({ where: { userId_topicId: { userId, topicId: topic.id } } });
    const current = existing?.stage ?? 'EXPLANATION';
    const next = STAGES.indexOf(stage) > STAGES.indexOf(current) ? stage : current;
    return this.prisma.client.grammarProgress.upsert({
      where: { userId_topicId: { userId, topicId: topic.id } },
      update: { stage: next },
      create: { userId, topicId: topic.id, stage: next },
    });
  }

  /** Exercise engine entry point (also used by lessons): grades, records and feeds DNA + error memory. */
  async answer(userId: string, exerciseId: string, answer: string) {
    const exercise = await this.prisma.client.practiceExercise.findUnique({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Exercise not found.');
    const type = exercise.type as PracticeExerciseType;
    const lang = exercise.languageCode;

    if (!isAutoGraded(type)) {
      const evaluation = await this.assessment.assess(userId, lang, { kind: 'free_writing', prompt: exercise.prompt, response: answer });
      await this.prisma.client.practiceAttempt.create({
        data: { userId, exerciseId, answer: answer.slice(0, 2000), isCorrect: evaluation.overall >= 60, score: evaluation.overall, feedback: evaluation.feedback },
      });
      if (exercise.grammarTopicId) await this.bumpProgress(userId, exercise.grammarTopicId, evaluation.overall, 'FREE');
      const reward = await this.gamification.rewardFor('practice');
      const xp = await this.gamification.awardXp(userId, lang, 'practice', reward, { refId: exerciseId, minutes: 2 });
      return { correct: evaluation.overall >= 60, score: evaluation.overall, expected: evaluation.improvedVersion, explanation: evaluation.feedback, evaluation, xpAwarded: reward, totalXp: xp.totalXp };
    }

    const grade = gradeExercise(type, exercise.payload as PracticeExercisePayload, answer);
    await this.prisma.client.practiceAttempt.create({
      data: { userId, exerciseId, answer: answer.slice(0, 500), isCorrect: grade.isCorrect, score: grade.score },
    });
    if (exercise.grammarTopicId) await this.bumpProgress(userId, exercise.grammarTopicId, grade.score, 'GUIDED');
    if (!grade.isCorrect && type !== 'MATCHING' && answer.trim() && grade.expected) {
      await this.errors.record(
        userId,
        lang,
        { original: answer.trim().slice(0, 300), better: grade.expected, explanation: exercise.explanation ?? `The correct answer is “${grade.expected}”.`, category: 'GRAMMAR' },
        'grammar',
      );
    }
    await this.dna.observe(userId, lang, { GRAMMAR: grade.score, ACCURACY: grade.score });
    const reward = grade.isCorrect ? await this.gamification.rewardFor('practice') : 0;
    const xp = await this.gamification.awardXp(userId, lang, 'practice', reward, { refId: exerciseId, minutes: 1, checkAchievements: false });
    return { correct: grade.isCorrect, score: grade.score, expected: grade.expected, explanation: exercise.explanation, xpAwarded: reward, totalXp: xp.totalXp };
  }

  /** AI practice stage: the learner writes freely using the structure; the AI assesses it in context. */
  async aiPractice(userId: string, slug: string, text: string) {
    const lang = await this.context.activeLanguage(userId);
    const topic = await this.prisma.client.grammarTopic.findUnique({ where: { languageCode_slug: { languageCode: lang, slug } } });
    if (!topic) throw new NotFoundException('Grammar topic not found.');
    const evaluation = await this.assessment.assess(userId, lang, {
      kind: 'free_writing',
      prompt: `${topic.practicePrompt} (Grammar focus: ${topic.title}, level ${topic.cefrLevel as CEFRLevel})`,
      response: text,
    });
    const progress = await this.bumpProgress(userId, topic.id, evaluation.overall, evaluation.overall >= 75 ? 'ASSESSMENT' : 'AI_PRACTICE');
    const reward = await this.gamification.rewardFor('lesson');
    const xp = await this.gamification.awardXp(userId, lang, 'lesson', reward, { refId: topic.id, minutes: 4 });
    return { evaluation, progress: { stage: progress.stage, mastery: progress.mastery }, xpAwarded: reward, totalXp: xp.totalXp };
  }
}
