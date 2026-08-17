import 'server-only';
import type { AiSuggestedExercisePublic, CEFRLevel, CorrectionItem, LearningSkill } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';
import { parseAiErrorMessage, type AiActionResult } from './ai-shared';

export interface TutorTurnResult {
  sessionId: string;
  messageId: string;
  failed: boolean;
  response: string;
  corrections: CorrectionItem[];
  explanation: string | null;
  level: CEFRLevel;
  relevantSkill: LearningSkill;
  suggestedExercise: AiSuggestedExercisePublic | null;
}

export async function sendTutorMessage(
  user: SessionUser,
  input: { message: string; sessionId?: string; lessonId?: string },
): Promise<AiActionResult<TutorTurnResult>> {
  const response = await callNestApi('/ai/tutor', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) return { ok: false, message: await parseAiErrorMessage(response) };
  return { ok: true, data: await response.json() };
}

export async function answerAiExercise(
  user: SessionUser,
  input: { sessionId: string; messageId: string; answer: string },
): Promise<AiActionResult<{ isCorrect: boolean }>> {
  const response = await callNestApi('/ai/tutor/exercise/answer', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) return { ok: false, message: await parseAiErrorMessage(response) };
  return { ok: true, data: await response.json() };
}
