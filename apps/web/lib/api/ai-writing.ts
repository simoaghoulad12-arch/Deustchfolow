import 'server-only';
import type { CEFRLevel, CorrectionItem } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';
import { parseAiErrorMessage, type AiActionResult } from './ai-shared';

export interface WritingCorrectionResult {
  id: string;
  failed: boolean;
  correctedText: string;
  errors: CorrectionItem[];
  explanation: string;
  improvedVersion: string | null;
  detectedLevel: CEFRLevel;
  score: number;
}

export async function correctWriting(
  user: SessionUser,
  input: { text: string; lessonId?: string; targetLevel?: CEFRLevel },
): Promise<AiActionResult<WritingCorrectionResult>> {
  const response = await callNestApi('/ai/writing/correct', user, {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (!response.ok) return { ok: false, message: await parseAiErrorMessage(response) };
  return { ok: true, data: await response.json() };
}
