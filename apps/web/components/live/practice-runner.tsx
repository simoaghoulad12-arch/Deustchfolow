'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@deutschflow/ui';
import type { Evaluation } from '@/lib/api/live';
import { Badge, Card, EmptyState, ProgressBar, buttonClass } from './ui';
import { AnswerBox, type AnswerMeta } from './answer-box';
import { EvaluationView } from './evaluation-view';
import { speak } from './use-speech';
import { submitPracticeAction } from '@/app/(live)/actions';

export interface PracticeItem {
  prompt: string;
  targetTone?: string;
}

type Mode = 'speaking' | 'brain' | 'emotion';

/** Shared runner for Speaking, Brain and Emotion modes. */
export function PracticeRunner({ mode, items, languageCode, timeLimitMs }: { mode: Mode; items: PracticeItem[]; languageCode: string; timeLimitMs?: number }) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<{ evaluation: Evaluation; xp: number; inTime: boolean } | null>(null);
  const [totals, setTotals] = useState({ xp: 0, score: 0, answered: 0 });
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [remaining, setRemaining] = useState(timeLimitMs ?? 0);
  const startedAt = useRef(Date.now());
  const item = items[index];

  useEffect(() => {
    startedAt.current = Date.now();
    setRemaining(timeLimitMs ?? 0);
    if (mode === 'brain' && item) speak(item.prompt, languageCode);
  }, [index, timeLimitMs, mode, item, languageCode]);

  useEffect(() => {
    if (mode !== 'brain' || result || !timeLimitMs || !item) return;
    const t = setInterval(() => setRemaining(Math.max(0, timeLimitMs - (Date.now() - startedAt.current))), 100);
    return () => clearInterval(t);
  }, [mode, result, timeLimitMs, item, index]);

  if (items.length === 0) return <EmptyState icon="🧭" title="No prompts available" description="Prompts for this mode are not available for your language yet." />;

  if (!item) {
    const avg = totals.answered ? Math.round(totals.score / totals.answered) : 0;
    return (
      <EmptyState
        icon="🏁"
        title="Session complete!"
        description={`${totals.answered} answers · average score ${avg} · +${totals.xp} XP`}
        action={
          <button type="button" className={buttonClass('primary')} onClick={() => router.refresh()}>
            New round
          </button>
        }
      />
    );
  }

  const submit = (text: string, meta: AnswerMeta) =>
    start(async () => {
      setError(null);
      const res = await submitPracticeAction({
        mode,
        prompt: item.prompt,
        response: text,
        responseMs: meta.responseMs,
        timeLimitMs,
        targetTone: item.targetTone,
        spoken: meta.spoken,
        speechConfidence: meta.speechConfidence,
      });
      if (!res.ok) return setError(res.message);
      setResult({ evaluation: res.data.evaluation, xp: res.data.xpAwarded, inTime: res.data.inTime });
      setTotals((t) => ({ xp: t.xp + res.data.xpAwarded, score: t.score + res.data.evaluation.overall, answered: t.answered + 1 }));
    });

  const pct = timeLimitMs ? (remaining / timeLimitMs) * 100 : 0;

  return (
    <Card className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="shrink-0 tabular-nums">
          {index + 1} / {items.length}
        </span>
        <ProgressBar value={(index / items.length) * 100} label="Session progress" />
        <span className="whitespace-nowrap font-semibold text-indigo-600">+{totals.xp} XP</span>
      </div>

      {mode === 'emotion' && item.targetTone && (
        <Badge tone="violet" className="mb-2 text-sm">
          Tone: {item.targetTone}
        </Badge>
      )}
      <p className={cn('font-semibold', mode === 'brain' ? 'text-2xl sm:text-3xl' : 'text-lg')} lang={mode === 'brain' ? languageCode : undefined}>
        {item.prompt}
      </p>
      {mode === 'brain' && (
        <button type="button" onClick={() => speak(item.prompt, languageCode)} className="mt-1 text-sm text-indigo-600">
          🔊 Listen again
        </button>
      )}

      {mode === 'brain' && !result && timeLimitMs && (
        <div className="mt-4">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="timer" aria-label={`${Math.ceil(remaining / 1000)} seconds left`}>
            <div className={cn('h-full rounded-full transition-[width] duration-100', pct > 40 ? 'bg-emerald-500' : pct > 15 ? 'bg-amber-500' : 'bg-rose-500')} style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-right text-xs text-muted-foreground">{remaining > 0 ? `${Math.ceil(remaining / 1000)}s` : 'Time is up — answer anyway for half XP'}</p>
        </div>
      )}

      <div className="mt-5">
        {result ? (
          <>
            {mode === 'brain' && <p className={cn('mb-3 text-sm font-semibold', result.inTime ? 'text-emerald-600' : 'text-amber-600')}>{result.inTime ? '⚡ In time!' : '⏱️ A bit too slow this time'}</p>}
            <EvaluationView evaluation={result.evaluation} xpAwarded={result.xp} />
            <button
              type="button"
              className={`${buttonClass('primary')} mt-5`}
              onClick={() => {
                setResult(null);
                setIndex((i) => i + 1);
              }}
            >
              {index + 1 < items.length ? 'Next →' : 'Finish'}
            </button>
          </>
        ) : (
          <AnswerBox
            languageCode={languageCode}
            busy={pending}
            rows={mode === 'brain' ? 2 : 4}
            onSubmit={submit}
            resetKey={index}
            autoFocus
            submitLabel={mode === 'brain' ? 'Go' : 'Submit'}
            placeholder={mode === 'speaking' ? 'Tap the mic and speak — or type' : 'Your answer…'}
          />
        )}
        {error && (
          <p className="mt-3 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </Card>
  );
}
