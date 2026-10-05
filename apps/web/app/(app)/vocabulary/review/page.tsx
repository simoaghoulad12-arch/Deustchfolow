import type { Metadata } from 'next';
import { getSession } from '@/lib/auth/session';
import { getDueVocabulary } from '@/lib/api/vocabulary';
import { VocabularyTrainer } from './vocabulary-trainer';

export const metadata: Metadata = { title: 'Vokabeltraining – DeutschFlow' };

export default async function VocabularyReviewPage() {
  const session = await getSession();
  if (!session) return null;

  const cards = await getDueVocabulary(session);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Vokabeltraining</h1>
        <p className="text-sm text-muted-foreground">Tippe die englische Übersetzung des deutschen Wortes.</p>
      </div>
      <VocabularyTrainer cards={cards} />
    </div>
  );
}
