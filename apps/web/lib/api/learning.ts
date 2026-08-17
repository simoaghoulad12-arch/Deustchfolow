import 'server-only';
import type { CEFRLevel, ExerciseType, LearningSkill, ProgressStatus } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface LevelSummary {
  id: string;
  code: CEFRLevel;
  name: string;
  description: string | null;
  order: number;
}

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  order: number;
  level: { code: CEFRLevel; name: string };
}

interface LessonProgressRef {
  status: ProgressStatus;
  progress: number;
}

export interface CourseDetail extends CourseSummary {
  modules: Array<{
    id: string;
    title: string;
    slug: string;
    description: string | null;
    order: number;
    lessons: Array<{
      id: string;
      title: string;
      slug: string;
      skill: LearningSkill;
      difficulty: number;
      estimatedMinutes: number;
      order: number;
      progress: LessonProgressRef | null;
    }>;
  }>;
}

export interface LessonDetail {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  skill: LearningSkill;
  difficulty: number;
  estimatedMinutes: number;
  order: number;
  objectives: string[];
  module: {
    title: string;
    slug: string;
    course: { title: string; slug: string; level: { code: CEFRLevel; name: string } };
  };
  prerequisites: Array<{ id: string; title: string; slug: string }>;
  progress: (LessonProgressRef & { completedAt: string | null }) | null;
}

export interface ExerciseOption {
  id: string;
  text: string;
}

export interface ExerciseQuestion {
  id: string;
  text: string;
  order: number;
  options: ExerciseOption[];
}

export interface ExerciseListItem {
  id: string;
  type: ExerciseType;
  prompt: string;
  difficulty: number;
  order: number;
  questions: ExerciseQuestion[];
}

export interface AttemptResult {
  isCorrect: boolean;
  explanation: string | null;
  attemptNumber: number;
}

export async function getLevels(user: SessionUser): Promise<LevelSummary[]> {
  const response = await callNestApi('/levels', user);
  if (!response.ok) return [];
  return response.json();
}

export async function getCourses(user: SessionUser): Promise<CourseSummary[]> {
  const response = await callNestApi('/courses', user);
  if (!response.ok) return [];
  return response.json();
}

export async function getCourse(user: SessionUser, slug: string): Promise<CourseDetail | null> {
  const response = await callNestApi(`/courses/${encodeURIComponent(slug)}`, user);
  if (!response.ok) return null;
  return response.json();
}

export async function getLesson(user: SessionUser, slug: string): Promise<LessonDetail | null> {
  const response = await callNestApi(`/lessons/${encodeURIComponent(slug)}`, user);
  if (!response.ok) return null;
  return response.json();
}

export async function getLessonExercises(
  user: SessionUser,
  slug: string,
): Promise<ExerciseListItem[]> {
  const response = await callNestApi(`/lessons/${encodeURIComponent(slug)}/exercises`, user);
  if (!response.ok) return [];
  return response.json();
}

export async function submitAttempt(
  user: SessionUser,
  exerciseId: string,
  input: { answer: string; timeSpentMs?: number },
): Promise<AttemptResult | null> {
  const response = await callNestApi(`/exercises/${encodeURIComponent(exerciseId)}/attempts`, user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) return null;
  return response.json();
}

export interface ProgressSummary {
  lessons: Array<{
    status: ProgressStatus;
    progress: number;
    completedAt: string | null;
    lastAccessedAt: string | null;
    lesson: {
      id: string;
      title: string;
      slug: string;
      module: { title: string; course: { title: string; slug: string } };
    };
  }>;
  skills: Array<{ skill: LearningSkill; level: CEFRLevel | null; score: number }>;
  totalTimeSpentMs: number;
  lastLesson: ProgressSummary['lessons'][number] | null;
  currentLevel: CEFRLevel | null;
  targetLevel: CEFRLevel | null;
  recommendedNextLesson: {
    id: string;
    title: string;
    slug: string;
    estimatedMinutes: number;
    module: { course: { slug: string } };
  } | null;
}

export async function getMyProgress(user: SessionUser): Promise<ProgressSummary | null> {
  const response = await callNestApi('/me/progress', user);
  if (!response.ok) return null;
  return response.json();
}
