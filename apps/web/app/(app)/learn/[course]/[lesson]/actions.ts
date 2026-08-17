'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { submitAttempt, type AttemptResult } from '@/lib/api/learning';

/**
 * Called directly from the client exercise widget (not a <form action>),
 * so it can return the grading result to update the UI in place instead
 * of redirecting. Always grades as the caller's own session — the
 * exerciseId is the only input, never a userId.
 */
export async function submitExerciseAttemptAction(
  exerciseId: string,
  answer: string,
  timeSpentMs?: number,
): Promise<AttemptResult | { error: string }> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const result = await submitAttempt(session, exerciseId, { answer, timeSpentMs });
  if (!result) {
    return { error: 'Antwort konnte nicht gespeichert werden. Bitte versuche es erneut.' };
  }
  return result;
}
