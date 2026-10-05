'use client';

import { useState, useTransition } from 'react';
import { MISTAKE_CATEGORY_LABELS } from '@deutschflow/types';
import type { Mistake } from '@/lib/api/live';
import { Badge, buttonClass } from '@/components/live/ui';
import { practiceMistakeAction } from '../actions';

function MistakeItem({ mistake, languageCode }: { mistake: Mistake; languageCode: string }) {
  const [m, setM] = useState(mistake);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; expected?: string } | null>(null);
  const [pending, start] = useTransition();
  const mastered = m.masteryState === 'MASTERED';

  return (
    <li className="rounded-2xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone="amber">{MISTAKE_CATEGORY_LABELS[m.category]}</Badge>
        <Badge>{m.frequency}× seen</Badge>
        <Badge tone={mastered ? 'green' : m.masteryState === 'PRACTICING' ? 'indigo' : 'neutral'}>{mastered ? 'Mastered' : `${m.correctStreak}/3 correct`}</Badge>
      </div>
      <p className="text-slate-500 line-through decoration-rose-400" lang={languageCode}>
        {m.original}
      </p>
      <p className="text-sm text-slate-600">{m.explanation}</p>
      {!mastered && (
        <form
          className="mt-3 flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              const res = await practiceMistakeAction(m.id, answer);
              if (!res.ok) return setFeedback({ correct: false });
              setFeedback({ correct: res.data.correct, expected: res.data.expected });
              if (res.data.mistake) setM((x) => ({ ...x, masteryState: res.data.mistake!.masteryState as Mistake['masteryState'], correctStreak: res.data.mistake!.correctStreak }));
              if (res.data.correct) setAnswer('');
            });
          }}
        >
          <input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type the natural version"
            aria-label="Corrected sentence"
            lang={languageCode}
            className="h-11 flex-1 rounded-xl border border-border px-3"
          />
          <button type="submit" disabled={pending || !answer.trim()} className={buttonClass('primary')}>
            Check
          </button>
        </form>
      )}
      {feedback && (
        <p className={`mt-2 text-sm ${feedback.correct ? 'text-emerald-700' : 'text-amber-700'}`} role="status">
          {feedback.correct ? '✓ Correct!' : `Not yet. Natural version: ${feedback.expected ?? m.corrected}`}
        </p>
      )}
      {mastered && (
        <p className="mt-2 font-medium text-emerald-700" lang={languageCode}>
          ✓ {m.corrected}
        </p>
      )}
    </li>
  );
}

export function MistakeDrill({ mistakes, languageCode }: { mistakes: Mistake[]; languageCode: string }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {mistakes.map((m) => (
        <MistakeItem key={m.id} mistake={m} languageCode={languageCode} />
      ))}
    </ul>
  );
}
