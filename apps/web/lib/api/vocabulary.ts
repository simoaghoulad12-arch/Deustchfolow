import 'server-only';
import type { CEFRLevel, VocabularyStatus } from '@deutschflow/types';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

/** A training card — deliberately without the translation. */
export interface VocabularyCard {
  id: string;
  word: string;
  level: CEFRLevel;
  partOfSpeech: string | null;
  exampleSentence: string | null;
  status: VocabularyStatus;
}

export interface VocabularyReviewResult {
  isCorrect: boolean;
  correctTranslation: string;
  status: VocabularyStatus;
  intervalDays: number;
  nextReviewAt: string;
}

export interface VocabularySummary {
  dueCount: number;
  newAvailable: number;
  sessionSize: number;
  learningCount: number;
  masteredCount: number;
}

export interface VocabularyListItem extends Omit<VocabularyCard, 'status'> {
  translation: string;
}

export async function getDueVocabulary(user: SessionUser): Promise<VocabularyCard[]> {
  const response = await callNestApi('/vocabulary/due', user);
  if (!response.ok) return [];
  return response.json();
}

export async function getMyVocabularySummary(user: SessionUser): Promise<VocabularySummary | null> {
  const response = await callNestApi('/me/vocabulary/summary', user);
  if (!response.ok) return null;
  return response.json();
}

export async function getVocabularyList(
  user: SessionUser,
  query: { level?: CEFRLevel; search?: string; skip?: number; take?: number } = {},
): Promise<{ items: VocabularyListItem[]; total: number }> {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const qs = params.toString();
  const response = await callNestApi(`/vocabulary${qs ? `?${qs}` : ''}`, user);
  if (!response.ok) return { items: [], total: 0 };
  return response.json();
}

export async function reviewVocabulary(
  user: SessionUser,
  vocabularyId: string,
  answer: string,
): Promise<VocabularyReviewResult | null> {
  const response = await callNestApi(`/vocabulary/${encodeURIComponent(vocabularyId)}/review`, user, {
    method: 'POST',
    body: JSON.stringify({ answer }),
  });
  if (!response.ok) return null;
  return response.json();
}
