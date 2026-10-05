/**
 * Immersion platform ("Learn a language. Live it.") — shared domain types
 * used by both apps/api and apps/web. Prisma enums are mirrored here as
 * const objects (same convention as the rest of this package) so the web
 * app never imports Prisma types into client components.
 */
import type { CEFRLevel } from './cefr-level';
import type { LearningSkill } from './learning-skill';

/** CEFR levels the immersion platform currently teaches. C1/C2 extend this list without schema changes. */
export const SUPPORTED_LEVELS = ['A1', 'A2', 'B1', 'B2'] as const satisfies readonly CEFRLevel[];
export type SupportedLevel = (typeof SUPPORTED_LEVELS)[number];

export const CEFR_ORDER: Record<CEFRLevel, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5 };

export function levelFromProficiency(p: number): CEFRLevel {
  if (p >= 4.5) return 'C1';
  if (p >= 3.5) return 'B2';
  if (p >= 2.5) return 'B1';
  if (p >= 1.5) return 'A2';
  return 'A1';
}

export const DnaDimension = {
  VOCABULARY: 'VOCABULARY',
  GRAMMAR: 'GRAMMAR',
  SPEAKING: 'SPEAKING',
  LISTENING: 'LISTENING',
  READING: 'READING',
  WRITING: 'WRITING',
  PRONUNCIATION: 'PRONUNCIATION',
  FLUENCY: 'FLUENCY',
  ACCURACY: 'ACCURACY',
  RESPONSE_SPEED: 'RESPONSE_SPEED',
} as const;
export type DnaDimension = (typeof DnaDimension)[keyof typeof DnaDimension];
export const DNA_DIMENSIONS = Object.values(DnaDimension);

export const DNA_LABELS: Record<DnaDimension, string> = {
  VOCABULARY: 'Vocabulary',
  GRAMMAR: 'Grammar',
  SPEAKING: 'Speaking',
  LISTENING: 'Listening',
  READING: 'Reading',
  WRITING: 'Writing',
  PRONUNCIATION: 'Pronunciation',
  FLUENCY: 'Fluency',
  ACCURACY: 'Accuracy',
  RESPONSE_SPEED: 'Response speed',
};

export const MissionMode = {
  MISSION: 'MISSION',
  CHAOS: 'CHAOS',
  STORY: 'STORY',
  DEBATE: 'DEBATE',
  DAILY: 'DAILY',
} as const;
export type MissionMode = (typeof MissionMode)[keyof typeof MissionMode];

export const MistakeCategory = {
  GRAMMAR: 'GRAMMAR',
  VOCABULARY: 'VOCABULARY',
  PRONUNCIATION: 'PRONUNCIATION',
  SENTENCE_STRUCTURE: 'SENTENCE_STRUCTURE',
  WORD_CHOICE: 'WORD_CHOICE',
  SPELLING: 'SPELLING',
  REGISTER: 'REGISTER',
} as const;
export type MistakeCategory = (typeof MistakeCategory)[keyof typeof MistakeCategory];

export const MISTAKE_CATEGORY_LABELS: Record<MistakeCategory, string> = {
  GRAMMAR: 'Grammar',
  VOCABULARY: 'Vocabulary',
  PRONUNCIATION: 'Pronunciation',
  SENTENCE_STRUCTURE: 'Sentence structure',
  WORD_CHOICE: 'Word choice',
  SPELLING: 'Spelling',
  REGISTER: 'Tone & register',
};

export type MasteryState = 'NEW' | 'PRACTICING' | 'MASTERED';

export const PracticeExerciseType = {
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  FILL_BLANK: 'FILL_BLANK',
  SENTENCE_ORDER: 'SENTENCE_ORDER',
  TRANSLATION: 'TRANSLATION',
  ERROR_CORRECTION: 'ERROR_CORRECTION',
  MATCHING: 'MATCHING',
  READING_COMPREHENSION: 'READING_COMPREHENSION',
  LISTENING_COMPREHENSION: 'LISTENING_COMPREHENSION',
  FREE_WRITING: 'FREE_WRITING',
  SPEAKING: 'SPEAKING',
  CONVERSATION: 'CONVERSATION',
} as const;
export type PracticeExerciseType = (typeof PracticeExerciseType)[keyof typeof PracticeExerciseType];

/** Payload shapes per exercise type. Answers are stripped before reaching the browser. */
export interface PracticeExercisePayload {
  options?: string[];
  answer?: string;
  acceptable?: string[];
  tokens?: string[];
  pairs?: { left: string; right: string }[];
  passage?: string;
  /** Text the browser reads aloud via speech synthesis for listening items. */
  audioText?: string;
  sourceText?: string;
}

/** XP table (spec section 30). Admins can override via SystemSetting "xp.rewards". */
export const XP_REWARDS = {
  lesson: 50,
  mission: 100,
  speaking: 75,
  daily_challenge: 100,
  test: 200,
  level: 500,
  review: 5,
  journal: 40,
  practice: 10,
  brain: 30,
} as const;
export type XpSource = keyof typeof XP_REWARDS | 'achievement';

export const LEARNING_GOALS = [
  { value: 'work', label: 'Work' },
  { value: 'travel', label: 'Travel' },
  { value: 'study', label: 'Study' },
  { value: 'everyday', label: 'Everyday life' },
  { value: 'exam', label: 'Exam' },
  { value: 'relocation', label: 'Relocation' },
  { value: 'personal', label: 'Personal development' },
] as const;
export type LearningGoal = (typeof LEARNING_GOALS)[number]['value'];

export const DAILY_MINUTES_OPTIONS = [5, 10, 20, 30, 60] as const;

export const LEARNING_STYLES = [
  { value: 'speaking', label: 'Speaking' },
  { value: 'listening', label: 'Listening' },
  { value: 'reading', label: 'Reading' },
  { value: 'writing', label: 'Writing' },
  { value: 'grammar', label: 'Grammar' },
  { value: 'vocabulary', label: 'Vocabulary' },
  { value: 'mixed', label: 'Mixed' },
] as const;
export type LearningStyle = (typeof LEARNING_STYLES)[number]['value'];

export const NATIVE_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'tr', name: 'Turkish' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ru', name: 'Russian' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'fa', name: 'Persian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' },
] as const;

/** A mission completion criterion. Also powers the 5-level hint ladder. */
export interface MissionCriterion {
  id: string;
  description: string;
  /** Lower-case target-language cues that indicate the learner did it. */
  keywords: string[];
  /** Sentence frame, e.g. "Ich hätte gern + Akkusativ". */
  pattern: string;
  example: string;
  /** What the character says to steer the conversation toward this goal (target language). */
  npcPrompt: string;
  /** How the character reacts once the learner achieved it (target language). */
  npcReaction: string;
}

export interface KeyPhrase {
  term: string;
  translation: string;
}

export interface Correction {
  original: string;
  better: string;
  explanation: string;
  category: MistakeCategory;
  /** A short prompt inviting the learner to reuse the structure. */
  reuseTip?: string;
}

export interface TurnScores {
  grammar: number;
  vocabulary: number;
  fluency: number;
  task: number;
}

export interface MissionSummary {
  id: string;
  slug: string;
  mode: MissionMode;
  title: string;
  description: string;
  objective: string;
  cefrLevel: CEFRLevel;
  difficulty: number;
  requiredSkills: LearningSkill[];
  estimatedMinutes: number;
  xpReward: number;
  environment: { slug: string; name: string; icon: string; accent: string } | null;
  character: { name: string; role: string; avatar: string } | null;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
  bestScore: number | null;
}

export interface ChatTurn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  correction?: Correction | null;
  hint?: { level: number; text: string } | null;
  translation?: string | null;
  createdAt: string;
}

export interface MissionCompletion {
  score: number;
  xpAwarded: number;
  totalXp: number;
  streak: number;
  newAchievements: { code: string; title: string; icon: string }[];
  dnaChanges: { dimension: DnaDimension; before: number; after: number }[];
  highlights: string[];
  practiceNext: string[];
  nextMission: Pick<MissionSummary, 'slug' | 'title' | 'cefrLevel' | 'estimatedMinutes'> | null;
}

export interface MissionTurnResult {
  runId: string;
  reply: ChatTurn;
  userTurn: ChatTurn;
  criteriaMet: string[];
  totalCriteria: number;
  completion: MissionCompletion | null;
  aiAvailable: boolean;
}

export interface CoachMessage {
  headline: string;
  insights: string[];
  recommendation: { title: string; href: string; minutes: number; reason: string };
}
