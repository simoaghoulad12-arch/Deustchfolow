'use server';

import { redirect } from 'next/navigation';
import type { CEFRLevel } from '@deutschflow/types';
import { getSession } from '@/lib/auth/session';
import { correctWriting, type WritingCorrectionResult } from '@/lib/api/ai-writing';
import type { AiActionResult } from '@/lib/api/ai-shared';

export async function correctWritingAction(
  text: string,
  targetLevel?: CEFRLevel,
): Promise<AiActionResult<WritingCorrectionResult>> {
  const session = await getSession();
  if (!session) redirect('/login');

  return correctWriting(session, { text, targetLevel });
}
