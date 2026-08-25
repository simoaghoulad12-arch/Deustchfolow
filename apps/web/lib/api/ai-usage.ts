import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface AiUsageSummary {
  limits: { tutorMessagesPerDay: number; writingCorrectionsPerDay: number };
  usedToday: { tutor: number; writing_correction: number };
}

export async function getMyAiUsage(user: SessionUser): Promise<AiUsageSummary | null> {
  const response = await callNestApi('/ai/usage/me', user);
  if (!response.ok) return null;
  return response.json();
}
