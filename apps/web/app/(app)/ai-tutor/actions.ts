'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import {
  sendTutorMessage,
  answerAiExercise,
  type TutorTurnResult,
} from '@/lib/api/ai-tutor';
import type { AiActionResult } from '@/lib/api/ai-shared';

export async function sendTutorMessageAction(
  message: string,
  sessionId?: string,
): Promise<AiActionResult<TutorTurnResult>> {
  const session = await getSession();
  if (!session) redirect('/login');

  return sendTutorMessage(session, { message, sessionId });
}

export async function answerAiExerciseAction(
  sessionId: string,
  messageId: string,
  answer: string,
): Promise<AiActionResult<{ isCorrect: boolean }>> {
  const session = await getSession();
  if (!session) redirect('/login');

  return answerAiExercise(session, { sessionId, messageId, answer });
}
