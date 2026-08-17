import { Injectable } from '@nestjs/common';
import { ErrorCategory, LearningSkill, type CorrectionItem } from '@deutschflow/types';
import { PrismaService } from '../../../common/prisma/prisma.service';

const WEAK_SKILL_THRESHOLD = 50;
const RECENT_SUBMISSIONS_LIMIT = 5;

const SKILL_LABELS: Record<LearningSkill, string> = {
  GRAMMAR: 'Grammatik',
  VOCABULARY: 'Wortschatz',
  READING: 'Lesen',
  LISTENING: 'Hören',
  WRITING: 'Schreiben',
  SPEAKING: 'Sprechen',
};

const CATEGORY_LABELS: Record<ErrorCategory, string> = {
  GRAMMAR: 'Grammatik',
  VOCABULARY: 'Wortschatz',
  WORD_ORDER: 'Wortstellung',
  SPELLING: 'Rechtschreibung',
  ARTICLE: 'Artikel',
  PREPOSITION: 'Präpositionen',
  TENSE: 'Zeitformen',
  REGISTER: 'Sprachregister',
  STYLE: 'Stil',
};

export interface RuleBasedRecommendation {
  message: string;
  skill: LearningSkill | null;
  category: ErrorCategory | null;
}

/**
 * First recommendation layer — entirely rule-based, no AI dependency
 * (spec section 12/29: the Learning Engine, including this, must work
 * without AI; AI can add its own suggestions on top later). Combines the
 * weakest tracked skill with the most frequent recent error category,
 * e.g. "Grammar schwach + letzte Fehler = TENSE" -> "Grammatik
 * wiederholen, insbesondere Zeitformen."
 */
@Injectable()
export class RecommendationService {
  constructor(private readonly prisma: PrismaService) {}

  async getRecommendation(userId: string): Promise<RuleBasedRecommendation | null> {
    const [weakestSkill, topCategory] = await Promise.all([
      this.getWeakestSkill(userId),
      this.getMostFrequentRecentErrorCategory(userId),
    ]);

    if (!weakestSkill && !topCategory) {
      return null;
    }

    if (weakestSkill && topCategory) {
      return {
        skill: weakestSkill,
        category: topCategory,
        message: `Empfohlen: ${SKILL_LABELS[weakestSkill]} wiederholen — insbesondere ${CATEGORY_LABELS[topCategory]}.`,
      };
    }

    if (weakestSkill) {
      return {
        skill: weakestSkill,
        category: null,
        message: `Empfohlen: ${SKILL_LABELS[weakestSkill]} wiederholen.`,
      };
    }

    return {
      skill: null,
      category: topCategory,
      message: `Empfohlen: Übungen zu ${CATEGORY_LABELS[topCategory!]} wiederholen.`,
    };
  }

  private async getWeakestSkill(userId: string): Promise<LearningSkill | null> {
    const row = await this.prisma.client.userSkillProgress.findFirst({
      where: { userId, score: { lt: WEAK_SKILL_THRESHOLD } },
      orderBy: { score: 'asc' },
      select: { skill: true },
    });
    return row?.skill ?? null;
  }

  private async getMostFrequentRecentErrorCategory(userId: string): Promise<ErrorCategory | null> {
    const submissions = await this.prisma.client.writingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: RECENT_SUBMISSIONS_LIMIT,
      select: { errors: true },
    });

    const counts = new Map<ErrorCategory, number>();
    for (const submission of submissions) {
      if (!Array.isArray(submission.errors)) continue;
      for (const error of submission.errors as CorrectionItem[]) {
        if (!error || typeof error.category !== 'string') continue;
        counts.set(error.category, (counts.get(error.category) ?? 0) + 1);
      }
    }

    let topCategory: ErrorCategory | null = null;
    let topCount = 0;
    for (const [category, count] of counts) {
      if (count > topCount) {
        topCategory = category;
        topCount = count;
      }
    }
    return topCategory;
  }
}
