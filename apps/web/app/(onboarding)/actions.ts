'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getSession } from '@/lib/auth/session';
import { liveSend, type LiveResult, type PublicExercise } from '@/lib/api/live';

async function user() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

const OnboardingInput = z.object({
  targetLanguage: z.string().regex(/^[a-z]{2}$/),
  nativeLanguage: z.string().regex(/^[a-z]{2}$/),
  level: z.enum(['A1', 'A2', 'B1', 'B2', 'unknown']),
  goals: z.array(z.string()).min(1),
  dailyMinutes: z.number().int().min(5).max(120),
  learningStyles: z.array(z.string()).min(1),
  personalGoal: z.string().max(280),
  displayName: z.string().trim().max(60).optional(),
});

export async function completeOnboardingAction(input: z.infer<typeof OnboardingInput>): Promise<LiveResult<{ needsPlacement: boolean }>> {
  const parsed = OnboardingInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: 'Please complete every step.', status: 400 };
  const { displayName, ...rest } = parsed.data;
  return liveSend(await user(), 'POST', '/onboarding', displayName ? { ...rest, displayName } : rest);
}

export type PlacementQuestion = { done: true; answered: number } | { done: false; answered: number; totalQuestions: number; question: PublicExercise };

export async function startPlacementAction(): Promise<LiveResult<{ since: string; totalQuestions: number }>> {
  return liveSend(await user(), 'POST', '/placement/start');
}

export async function nextPlacementAction(since: string): Promise<LiveResult<PlacementQuestion>> {
  const session = await user();
  const { liveGet } = await import('@/lib/api/live');
  const data = await liveGet<PlacementQuestion>(session, `/placement/next?since=${encodeURIComponent(since)}`);
  return data ? { ok: true, data } : { ok: false, message: 'Could not load the next question. Please try again.', status: 0 };
}

export async function answerPlacementAction(since: string, exerciseId: string, answer: string): Promise<LiveResult<{ correct: boolean }>> {
  return liveSend(await user(), 'POST', '/placement/answer', { since, exerciseId, answer });
}

export async function finishPlacementAction(since: string): Promise<LiveResult<{ level: string; answered: number; correct: number; xpAwarded: number }>> {
  return liveSend(await user(), 'POST', '/placement/finish', { since });
}

export async function skipPlacementAction(level: 'A1' | 'A2' | 'B1' | 'B2') {
  const result = await liveSend(await user(), 'POST', '/placement/skip', { level });
  if (result.ok) redirect('/plan');
  return result;
}
