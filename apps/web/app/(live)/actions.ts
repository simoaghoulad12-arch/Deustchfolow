'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import type { MissionCompletion, MissionTurnResult } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { liveSend, type ChatTurn, type Evaluation, type LiveResult } from '@/lib/api/live';

/**
 * Server actions for the immersion app. The browser never talks to NestJS
 * directly: every call goes through here with the session-bound service
 * token, and the API validates every payload again with Zod.
 */

async function user() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export type XpReward = { xpAwarded: number; totalXp: number; newAchievements?: { code: string; title: string; icon: string }[] };

// ── Missions ──────────────────────────────────────────────────────────
export async function startRunAction(slug: string, choiceId?: string): Promise<LiveResult<{ runId: string }>> {
  return liveSend<{ runId: string }>(await user(), 'POST', `/missions/${encodeURIComponent(slug)}/runs`, choiceId ? { choiceId } : {});
}

export async function startRunAndGo(slug: string, choiceId?: string) {
  const result = await startRunAction(slug, choiceId);
  if (result.ok) redirect(`/runs/${result.data.runId}`);
  return result;
}

export async function sendTurnAction(
  runId: string,
  input: { text: string; responseMs?: number; spoken?: boolean; speechConfidence?: number },
): Promise<LiveResult<MissionTurnResult>> {
  return liveSend<MissionTurnResult>(await user(), 'POST', `/runs/${runId}/turns`, input);
}

export async function hintAction(runId: string): Promise<LiveResult<{ level: number; maxLevel: number; turn: ChatTurn }>> {
  return liveSend(await user(), 'POST', `/runs/${runId}/hint`);
}

export async function finishRunAction(runId: string): Promise<LiveResult<{ status: 'COMPLETED' | 'ABANDONED'; completion: MissionCompletion | null }>> {
  const result = await liveSend<{ status: 'COMPLETED' | 'ABANDONED'; completion: MissionCompletion | null }>(await user(), 'POST', `/runs/${runId}/finish`);
  revalidatePath('/home');
  return result;
}

// ── Daily challenge & mistakes ───────────────────────────────────────
export async function submitChallengeAction(input: { response: string; spoken?: boolean; speechConfidence?: number }): Promise<LiveResult<{ evaluation: Evaluation } & XpReward>> {
  const result = await liveSend<{ evaluation: Evaluation } & XpReward>(await user(), 'POST', '/challenge', input);
  if (result.ok) revalidatePath('/home');
  return result;
}

export async function practiceMistakeAction(id: string, answer: string): Promise<LiveResult<{ correct: boolean; expected?: string; mistake: { masteryState: string; correctStreak: number } | null }>> {
  return liveSend(await user(), 'POST', `/mistakes/${id}/practice`, { answer });
}

// ── Practice modes ────────────────────────────────────────────────────
export async function submitPracticeAction(input: {
  mode: 'speaking' | 'brain' | 'emotion';
  prompt: string;
  response: string;
  responseMs?: number;
  timeLimitMs?: number;
  targetTone?: string;
  spoken?: boolean;
  speechConfidence?: number;
}): Promise<LiveResult<{ evaluation: Evaluation; inTime: boolean } & XpReward>> {
  return liveSend(await user(), 'POST', '/practice', input);
}

export async function journalAction(text: string): Promise<LiveResult<{ evaluation: Evaluation; entry: { id: string } } & XpReward>> {
  const result = await liveSend<{ evaluation: Evaluation; entry: { id: string } } & XpReward>(await user(), 'POST', '/journal', { text });
  if (result.ok) revalidatePath('/journal');
  return result;
}

// ── Vocabulary ────────────────────────────────────────────────────────
export async function reviewWordAction(id: string, grade: number): Promise<LiveResult<{ status: string; intervalDays: number } & XpReward>> {
  return liveSend(await user(), 'POST', `/vocabulary/${id}/review`, { grade });
}

export async function introduceWordsAction(count = 8, category?: string): Promise<LiveResult<{ added: number }>> {
  const result = await liveSend<{ added: number }>(await user(), 'POST', '/vocabulary/introduce', { count, ...(category ? { category } : {}) });
  revalidatePath('/vocabulary');
  return result;
}

export async function addWordAction(id: string): Promise<LiveResult<{ added: boolean }>> {
  return liveSend(await user(), 'POST', `/vocabulary/${id}/add`);
}

// ── Grammar & exercises ──────────────────────────────────────────────
export async function answerExerciseAction(id: string, answer: string): Promise<LiveResult<{ correct: boolean; score: number; expected: string; explanation: string | null } & XpReward>> {
  return liveSend(await user(), 'POST', `/exercises/${id}/answer`, { answer });
}

export async function grammarPracticeAction(slug: string, text: string): Promise<LiveResult<{ evaluation: Evaluation; progress: { stage: string; mastery: number } } & XpReward>> {
  return liveSend(await user(), 'POST', `/grammar/${encodeURIComponent(slug)}/practice`, { text });
}

export async function grammarStageAction(slug: string, stage: 'EXPLANATION' | 'EXAMPLES' | 'GUIDED'): Promise<LiveResult<unknown>> {
  return liveSend(await user(), 'POST', `/grammar/${encodeURIComponent(slug)}/stage`, { stage });
}

// ── Profile ───────────────────────────────────────────────────────────
export async function updateProfileAction(input: Record<string, unknown>): Promise<LiveResult<unknown>> {
  const result = await liveSend(await user(), 'PATCH', '/me', input);
  if (result.ok) revalidatePath('/', 'layout');
  return result;
}
