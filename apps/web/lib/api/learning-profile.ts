import 'server-only';
import type { CEFRLevel } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface LearningProfileData {
  nativeLanguage: string | null;
  explanationLanguage: string | null;
  timezone: string | null;
  learningGoal: string | null;
  currentLevel: CEFRLevel | null;
  targetLevel: CEFRLevel | null;
}

export async function getMyLearningProfile(user: SessionUser): Promise<LearningProfileData | null> {
  const response = await callNestApi('/users/me/learning-profile', user);
  if (!response.ok) return null;
  return response.json();
}

export async function updateMyLearningProfile(
  user: SessionUser,
  data: Partial<LearningProfileData>,
): Promise<{ success: boolean }> {
  const response = await callNestApi('/users/me/learning-profile', user, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return { success: response.ok };
}
