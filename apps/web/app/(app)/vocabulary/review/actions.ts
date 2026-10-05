'use server';

import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { reviewVocabulary, type VocabularyReviewResult } from '@/lib/api/vocabulary';

/**
 * Called directly from the trainer (not a <form action>) so the result can
 * update the card in place. Only the word id and the typed answer are
 * sent — correctness is decided by apps/api, never by the client.
 */
export async function reviewVocabularyAction(
  vocabularyId: string,
  answer: string,
): Promise<VocabularyReviewResult | { error: string }> {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  const result = await reviewVocabulary(session, vocabularyId, answer);
  if (!result) {
    return { error: 'Antwort konnte nicht gespeichert werden. Bitte versuche es erneut.' };
  }
  return result;
}
