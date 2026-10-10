'use client';

import { useState, useTransition } from 'react';
import type { VocabularyCard } from '@/lib/api/live';
import { Card, EmptyState, ProgressBar, buttonClass } from '@/components/live/ui';
import { speak } from '@/components/live/use-speech';
import { reviewWordAction } from '../actions';

const GRADES = [
  { grade: 1, label: 'Forgot', className: 'bg-rose-50 text-rose-700 hover:bg-rose-100' },
  { grade: 3, label: 'Hard', className: 'bg-amber-50 text-amber-800 hover:bg-amber-100' },
  { grade: 4, label: 'Good', className: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
  { grade: 5, label: 'Easy', className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' },
];

export function ReviewSession({ cards, languageCode }: { cards: VocabularyCard[]; languageCode: string }) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [xp, setXp] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (cards.length === 0) {
    return <EmptyState icon="🎉" title="No reviews due" description="You're all caught up. Learn new words or play a mission to grow your deck." />;
  }
  if (index >= cards.length) {
    return <EmptyState icon="🏁" title="Review complete!" description={`You reviewed ${cards.length} words and earned ${xp} XP. They'll come back right before you'd forget them.`} />;
  }
  const card = cards[index]!;

  return (
    <Card className="mx-auto max-w-xl text-center">
      <div className="mb-4 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="shrink-0 tabular-nums">
          {index + 1} / {cards.length}
        </span>
        <ProgressBar value={(index / cards.length) * 100} label="Review progress" />
      </div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">What does this mean?</p>
      <p className="mt-2 text-3xl font-bold" lang={languageCode}>
        {card.word}
      </p>
      <button type="button" onClick={() => speak(card.word, languageCode)} className="mt-1 text-sm text-indigo-600">
        🔊 Listen
      </button>
      {revealed ? (
        <div className="mt-5 space-y-2">
          <p className="text-xl font-semibold">{card.translation}</p>
          {card.plural && <p className="text-sm text-muted-foreground">Plural: {card.plural}</p>}
          {card.exampleSentence && (
            <p className="text-sm italic text-slate-600" lang={languageCode}>
              “{card.exampleSentence}”
            </p>
          )}
          <p className="pt-3 text-sm font-medium">How well did you know it?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {GRADES.map((g) => (
              <button
                key={g.grade}
                type="button"
                disabled={pending}
                className={`h-11 rounded-xl text-sm font-semibold ${g.className}`}
                onClick={() =>
                  start(async () => {
                    setError(null);
                    const res = await reviewWordAction(card.id, g.grade);
                    if (!res.ok) return setError(res.message);
                    setXp((x) => x + res.data.xpAwarded);
                    setRevealed(false);
                    setIndex((i) => i + 1);
                  })
                }
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setRevealed(true)} className={`${buttonClass('primary', 'lg')} mt-6 w-full`}>
          Show answer
        </button>
      )}
      {error && (
        <p className="mt-3 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
