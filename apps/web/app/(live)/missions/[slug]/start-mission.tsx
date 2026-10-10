'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { cn } from '@deutschflow/ui';
import { buttonClass } from '@/components/live/ui';
import { startRunAndGo } from '../../actions';

export function StartMission({
  slug,
  activeRunId,
  locked,
  choices,
}: {
  slug: string;
  activeRunId: string | null;
  locked: boolean;
  choices: { id: string; label: string; consequence?: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [choice, setChoice] = useState<string | undefined>(choices[0]?.id);

  if (locked) return <p className="rounded-xl bg-slate-100 p-4 text-sm text-slate-600">🔒 This mission unlocks at a higher level. Keep completing missions to level up.</p>;
  if (activeRunId) {
    return (
      <Link href={`/runs/${activeRunId}`} className={cn(buttonClass('primary', 'lg'), 'w-full sm:w-auto')}>
        Continue conversation →
      </Link>
    );
  }
  return (
    <div className="space-y-4">
      {choices.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold">How do you want to play this chapter?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {choices.map((c) => (
              <label key={c.id} className={cn('cursor-pointer rounded-xl border p-3 text-sm', choice === c.id ? 'border-indigo-400 bg-indigo-50' : 'border-border')}>
                <input type="radio" name="choice" value={c.id} checked={choice === c.id} onChange={() => setChoice(c.id)} className="sr-only" />
                <span className="font-semibold">{c.label}</span>
                {c.consequence && <span className="block text-xs text-muted-foreground">{c.consequence}</span>}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await startRunAndGo(slug, choice);
            if (result && !result.ok) setError(result.message);
          })
        }
        className={cn(buttonClass('primary', 'lg'), 'w-full sm:w-auto')}
      >
        {pending ? 'Setting the scene…' : 'Start conversation →'}
      </button>
      {error && (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
