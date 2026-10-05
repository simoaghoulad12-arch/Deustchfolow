import 'server-only';
import type {
  CEFRLevel,
  ChatTurn,
  CoachMessage,
  Correction,
  DnaDimension,
  KeyPhrase,
  MissionCompletion,
  MissionMode,
  MissionSummary,
  MissionTurnResult,
  MistakeCategory,
  PracticeExerciseType,
} from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

/**
 * Typed client for the immersion API (/live/*). Reads return `null` on any
 * failure so pages can render a friendly error state; writes return a
 * result object whose `message` is safe to show (never a raw error).
 */

export type LiveResult<T> = { ok: true; data: T } | { ok: false; message: string; status: number };

const GENERIC_ERROR = 'Something went wrong. Please try again.';

async function friendlyMessage(response: Response): Promise<string> {
  if (response.status === 429) return 'You are going a little fast. Take a breath and try again in a moment.';
  if (response.status >= 500) return GENERIC_ERROR;
  try {
    const body = (await response.json()) as { message?: string | string[] };
    const message = Array.isArray(body.message) ? body.message[0] : body.message;
    if (typeof message === 'string' && message.length < 200 && !/prisma|exception|error:/i.test(message)) return message;
  } catch {
    // fall through
  }
  return GENERIC_ERROR;
}

export async function liveGet<T>(user: SessionUser, path: string): Promise<T | null> {
  try {
    const response = await callNestApi(`/live${path}`, user);
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export async function liveSend<T>(user: SessionUser, method: 'POST' | 'PATCH' | 'DELETE', path: string, body?: unknown): Promise<LiveResult<T>> {
  try {
    const response = await callNestApi(`/live${path}`, user, {
      method,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!response.ok) return { ok: false, message: await friendlyMessage(response), status: response.status };
    return { ok: true, data: (await response.json()) as T };
  } catch {
    return { ok: false, message: 'We could not reach the learning service. Please try again.', status: 0 };
  }
}

// ───────────────────────────── Types ─────────────────────────────

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export interface PlanActivity {
  kind: string;
  title: string;
  minutes: number;
  href: string;
}

export interface LearningPlan {
  id: string;
  headline: string;
  targetLevel: CEFRLevel;
  estimatedWeeks: number;
  focusSkills: string[];
  dailyRoutine: PlanActivity[];
  weeks: { week: number; theme: string; activities: string[] }[];
}

export interface Me {
  email: string | null;
  role: string;
  memberSince: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  onboardingCompleted: boolean;
  needsPlacement: boolean;
  targetLanguage: { code: string; name: string; flag: string } | null;
  nativeLanguage: string | null;
  level: CEFRLevel | null;
  goals: string[];
  dailyMinutes: number | null;
  learningStyles: string[];
  personalGoal: string | null;
  stats: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    learningMinutes: number;
    speakingMinutes: number;
    difficulty: number;
    proficiency: number;
    estimatedLevel: CEFRLevel;
  } | null;
  plan: LearningPlan | null;
  placement: { estimatedLevel: CEFRLevel; skillScores: Record<string, number>; createdAt: string } | null;
}

export interface DailyChallenge {
  id: string;
  prompt: string;
  focus: string;
  reason: string;
  completed: boolean;
  xpAwarded: number;
  feedback: Evaluation | null;
}

export interface Home {
  ready: boolean;
  me: Me;
  coach: (CoachMessage & { aiAvailable: boolean }) | null;
  challenge: DailyChallenge;
  nextMission: MissionSummary | null;
  activeRun: { id: string; title: string; slug: string } | null;
  dna: Record<DnaDimension, number>;
  reviewDue: number;
  mistakes: { category: MistakeCategory; distinct: number; occurrences: number }[];
  xpToday: number;
  recentAchievements: { code: string; title: string; icon: string; unlockedAt: string }[];
}

export interface WorldEnvironment {
  slug: string;
  name: string;
  description: string;
  icon: string;
  accent: string;
  minLevel: CEFRLevel;
  unlocked: boolean;
  missionCount: number;
  completedCount: number;
  missions: MissionSummary[];
}

export interface World {
  languageCode: string;
  level: CEFRLevel;
  environments: WorldEnvironment[];
}

export interface MissionDetail extends MissionSummary {
  scenario: string;
  grammarFocus: string | null;
  keyPhrases: KeyPhrase[];
  goals: { id: string; description: string }[];
  characterDetail: { name: string; role: string; avatar: string; personality: string; speakingStyle: string } | null;
  extra: Record<string, unknown> | null;
  activeRunId: string | null;
}

export interface ModeMission extends MissionSummary {
  chapter: number | null;
  story: { slug: string; title: string; description: string } | null;
  extra: Record<string, unknown> | null;
}

export interface MissionRun {
  id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  score: number | null;
  xpAwarded: number;
  hintsUsed: number;
  maxHintLevel: number;
  difficulty: number;
  mission: {
    slug: string;
    title: string;
    mode: MissionMode;
    objective: string;
    scenario: string;
    cefrLevel: CEFRLevel;
    xpReward: number;
    keyPhrases: KeyPhrase[];
    environment: { slug: string; name: string; icon: string; accent: string } | null;
    character: { name: string; role: string; avatar: string } | null;
  };
  goals: { id: string; description: string; met: boolean }[];
  state: {
    twist: { title: string; situation: string } | null;
    choice: { id: string; label: string; consequence?: string } | null;
    stance: string | null;
  };
  turns: ChatTurn[];
}

export interface Evaluation {
  scores: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    naturalness: number;
    pronunciation: number | null;
    coherence: number | null;
  };
  feedback: string;
  corrections: Correction[];
  improvedVersion: string;
  tone: { detected: string; matchesTarget: boolean; explanation: string } | null;
  overall: number;
  aiAvailable: boolean;
}

export interface Mistake {
  id: string;
  category: MistakeCategory;
  original: string;
  corrected: string;
  explanation: string;
  frequency: number;
  correctStreak: number;
  masteryState: 'NEW' | 'PRACTICING' | 'MASTERED';
  source: string;
  lastSeenAt: string;
}

export interface VocabularyOverview {
  languageCode: string;
  total: number;
  mastered: number;
  learning: number;
  due: number;
  reviewedToday: number;
  categories: { name: string; count: number }[];
}

export interface VocabularyCard {
  id: string;
  word: string;
  translation: string;
  article: string | null;
  plural: string | null;
  pronunciation: string | null;
  category: string | null;
  level: CEFRLevel;
  exampleSentence: string | null;
  partOfSpeech: string | null;
  status?: string | null;
  inDeck?: boolean;
}

export interface GrammarTopicSummary {
  id: string;
  slug: string;
  title: string;
  summary: string;
  cefrLevel: CEFRLevel;
  exerciseCount: number;
  stage: string | null;
  mastery: number;
  attempts: number;
}

export interface PublicExercise {
  id: string;
  type: PracticeExerciseType;
  prompt: string;
  skill: string;
  payload: { options?: string[]; tokens?: string[]; lefts?: string[]; rights?: string[]; passage?: string; audioText?: string; sourceText?: string };
}

export interface GrammarTopicDetail {
  id: string;
  slug: string;
  title: string;
  summary: string;
  explanation: string;
  cefrLevel: CEFRLevel;
  examples: { target: string; translation: string; note?: string }[];
  practicePrompt: string;
  progress: { stage: string; mastery: number; attempts: number } | null;
  exercises: PublicExercise[];
}

export interface ProgressOverview {
  languageCode: string;
  level: CEFRLevel;
  estimatedLevel: CEFRLevel;
  levelProgress: number;
  stats: {
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    learningMinutes: number;
    speakingMinutes: number;
    missionsCompleted: number;
    averageMissionScore: number | null;
    words: number;
    wordsMastered: number;
    mistakesMastered: number;
    mistakesOpen: number;
    journalEntries: number;
    grammarMastery: number;
    practiceSessions: Record<string, number>;
  };
  xpByDay: { day: string; xp: number }[];
  xpBySource: Record<string, number>;
  dna: Record<DnaDimension, number>;
  dnaTrend: { day: string; scores: Record<string, number> }[];
  recentMissions: { title: string; slug: string; mode: string; score: number | null; xpAwarded: number; completedAt: string }[];
  achievements: { code: string; title: string; description: string; icon: string; xpReward: number; unlockedAt: string | null }[];
}

export interface JournalEntry {
  id: string;
  text: string;
  correctedText: string | null;
  score: number | null;
  wordCount: number;
  analysis: { feedback?: string; corrections?: Correction[]; scores?: Evaluation['scores'] } | null;
  createdAt: string;
}

export interface JournalGrowth {
  entries: number;
  scoreBefore: number;
  scoreNow: number;
  wordsBefore: number;
  wordsNow: number;
  mistakesPer100Before: number;
  mistakesPer100Now: number;
}

export type { MissionSummary, MissionTurnResult, MissionCompletion, ChatTurn, Correction, KeyPhrase };
