import { Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@deutschflow/database';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ImmersionContextService } from '../context/immersion-context.service';
import { GamificationService } from '../gamification/gamification.service';
import { AssessmentService } from '../practice/assessment.service';
import { dayKey } from '../common/dates';
import { average } from '../common/math';

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/**
 * AI Journal (spec section 21): the learner writes daily; the AI corrects
 * it, explains mistakes, suggests a natural version and the service
 * tracks growth by comparing early and recent entries.
 */
@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly context: ImmersionContextService,
    private readonly gamification: GamificationService,
    private readonly assessment: AssessmentService,
  ) {}

  async create(userId: string, text: string) {
    const lang = await this.context.activeLanguage(userId);
    const evaluation = await this.assessment.assess(userId, lang, {
      kind: 'journal',
      prompt: 'Free journal entry about the learner\'s day, thoughts or plans.',
      response: text,
    });
    const today = new Date(`${dayKey()}T00:00:00.000Z`);
    const writtenToday = await this.prisma.client.journalEntry.count({ where: { userId, languageCode: lang, createdAt: { gte: today } } });
    const entry = await this.prisma.client.journalEntry.create({
      data: {
        userId,
        languageCode: lang,
        text,
        correctedText: evaluation.improvedVersion || null,
        score: evaluation.overall,
        wordCount: countWords(text),
        analysis: {
          feedback: evaluation.feedback,
          corrections: evaluation.corrections,
          scores: evaluation.scores,
        } as unknown as Prisma.InputJsonValue,
      },
    });
    // Journal XP once per day; further entries still get full feedback.
    const reward = writtenToday === 0 ? await this.gamification.rewardFor('journal') : 0;
    const xp = await this.gamification.awardXp(userId, lang, 'journal', reward, { refId: entry.id, minutes: 5 });
    return { entry, evaluation, xpAwarded: reward, totalXp: xp.totalXp, newAchievements: xp.newAchievements };
  }

  async list(userId: string) {
    const lang = await this.context.activeLanguage(userId);
    const entries = await this.prisma.client.journalEntry.findMany({
      where: { userId, languageCode: lang },
      orderBy: { createdAt: 'desc' },
      take: 60,
    });
    return { entries, growth: this.growth([...entries].reverse()) };
  }

  async get(userId: string, id: string) {
    const entry = await this.prisma.client.journalEntry.findFirst({ where: { id, userId } });
    if (!entry) throw new NotFoundException('Journal entry not found.');
    return entry;
  }

  /** Compares the first and the most recent third of entries. */
  growth(entries: { score: number | null; wordCount: number; analysis: Prisma.JsonValue }[]) {
    if (entries.length < 2) return null;
    const third = Math.max(1, Math.floor(entries.length / 3));
    const early = entries.slice(0, third);
    const recent = entries.slice(-third);
    const mistakes = (e: (typeof entries)[number]) => {
      const a = (e.analysis ?? {}) as { corrections?: unknown[] };
      return Array.isArray(a.corrections) ? a.corrections.length : 0;
    };
    const per100 = (list: typeof entries) => average(list.map((e) => (e.wordCount ? (mistakes(e) / e.wordCount) * 100 : 0)));
    return {
      entries: entries.length,
      scoreBefore: Math.round(average(early.map((e) => e.score ?? 0))),
      scoreNow: Math.round(average(recent.map((e) => e.score ?? 0))),
      wordsBefore: Math.round(average(early.map((e) => e.wordCount))),
      wordsNow: Math.round(average(recent.map((e) => e.wordCount))),
      mistakesPer100Before: Math.round(per100(early) * 10) / 10,
      mistakesPer100Now: Math.round(per100(recent) * 10) / 10,
    };
  }
}
