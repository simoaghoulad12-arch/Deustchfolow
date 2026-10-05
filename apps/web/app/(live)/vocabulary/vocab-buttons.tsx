'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { buttonClass } from '@/components/live/ui';
import { addWordAction, introduceWordsAction } from '../actions';

export function IntroduceButton() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={buttonClass('primary')}
        onClick={() =>
          start(async () => {
            const res = await introduceWordsAction(8);
            setMsg(res.ok ? (res.data.added ? `${res.data.added} new words added` : 'You already have every word for your level') : res.message);
            router.refresh();
          })
        }
      >
        {pending ? 'Adding…' : '+ Learn 8 new words'}
      </button>
      {msg && (
        <p className="text-xs text-muted-foreground" role="status">
          {msg}
        </p>
      )}
    </div>
  );
}

export function AddWordButton({ id }: { id: string }) {
  const [state, setState] = useState<'idle' | 'added' | 'error'>('idle');
  const [pending, start] = useTransition();
  if (state === 'added') return <span className="text-xs font-semibold text-emerald-600">Added ✓</span>;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => start(async () => setState((await addWordAction(id)).ok ? 'added' : 'error'))}
      className={buttonClass('secondary', 'sm')}
      aria-label="Add to deck"
    >
      {state === 'error' ? 'Retry' : '+ Add'}
    </button>
  );
}
