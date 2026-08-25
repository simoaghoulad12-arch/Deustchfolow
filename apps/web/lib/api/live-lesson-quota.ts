import 'server-only';
import type { SubscriptionPlan } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface LiveLessonQuotaSummary {
  plan: SubscriptionPlan;
  weekStart: string;
  totalMinutes: number;
  usedMinutes: number;
  remainingMinutes: number;
}

export async function getMyLiveLessonQuota(user: SessionUser): Promise<LiveLessonQuotaSummary | null> {
  const response = await callNestApi('/payments/live-lessons/quota/me', user);
  if (!response.ok) return null;
  return response.json();
}
