'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Evaluation } from '@/lib/api/live';
import { Card, buttonClass } from '@/components/live/ui';
import { EvaluationView } from '@/components/live/evaluation-view';
import { journalAction } from '../actions';

export function JournalComposer({ languageCode }: { languageCode: string }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [result, setResult] = useState<{ evaluation: Evaluation; xp: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Today’s entry</h2>
      {result ? (
        <>
          <EvaluationView evaluation={result.evaluation} xpAwarded={result.xp} />
          <button
            type="button"
            className={`${buttonClass('secondary')} mt-4`}
            onClick={() => {
              setResult(null);
              setText('');
              router.refresh();
            }}
          >
            Write another entry
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            start(async () => {
              setError(null);
              const res = await journalAction(text.trim());
              if (!res.ok) return setError(res.message);
              setResult({ evaluation: res.data.evaluation, xp: res.data.xpAwarded });
            });
          }}
        >
          <label htmlFor="journal" className="sr-only">
            Journal entry
          </label>
          <textarea
            id="journal"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            maxLength={4000}
            lang={languageCode}
            placeholder="What did you do today? How do you feel? What are you planning?"
            className="w-full rounded-xl border border-border bg-white p-3 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{words} words</span>
            <button type="submit" disabled={pending || text.trim().length < 10} className={buttonClass('primary')}>
              {pending ? 'Reading your entry…' : 'Get feedback'}
            </button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-rose-600" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </Card>
  );
}
