import type { CEFRLevel, ErrorCategory, LearningSkill } from '@deutschflow/types';

/**
 * The minimal, task-scoped slice of a learner's data sent to the AI —
 * never the full User row (spec section 4). Every field here is either
 * always cheap to include (level/goal) or only populated when actually
 * relevant to the current request (e.g. `currentSkill` only when a
 * lessonId was given).
 *
 * Deliberately narrower than the full field list sketched in the spec:
 * no raw `relevantVocabulary`/`recentLessons` history is sent — only the
 * derived signals a prompt can actually act on (error categories, weak
 * skills). Sending raw historical rows to the model would cost tokens
 * without giving it anything more actionable.
 */
export interface AiLearnerContext {
  userId: string;
  currentLevel: CEFRLevel;
  targetLevel: CEFRLevel | null;
  learningGoal: string | null;
  currentSkill: LearningSkill | null;
  currentLessonTitle: string | null;
  /** Deduplicated, most recent first, capped — see AIContextBuilder. */
  recentErrorCategories: ErrorCategory[];
  /** Skills with the lowest UserSkillProgress.score, capped. */
  weakSkills: LearningSkill[];
}
