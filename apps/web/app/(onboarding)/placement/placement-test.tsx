'use client';

import { useCallback, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicExercise } from '@/lib/api/live';
import { buttonClass, ProgressBar } from '@/components/live/ui';
import { ExerciseInput } from '@/components/live/exercise-input';
import { answerPlacementAction, finishPlacementAction, nextPlacementAction, skipPlacementAction, startPlacementAction } from '../actions';

export function PlacementTest({ languageName, languageCode }: { languageName: string; languageCode: string }) {
  const router = useRouter();
  const [since, setSince] = useState<string | null>(null);
  const [question, setQuestion] = useState<PublicExercise | null>(null);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(12);
  const [result, setResult] = useState<{ level: string; correct: number; answered: number; xpAwarded: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadNext = useCallback(async (s: string) => {
    const next = await nextPlacementAction(s);
    if (!next.ok) return setError(next.message);
    setAnswered(next.data.answered);
    if (next.data.done) {
      const fin = await finishPlacementAction(s);
      if (!fin.ok) return setError(fin.message);
      setQuestion(null);
      setResult(fin.data);
    } else {
      setTotal(next.data.totalQuestions);
      setQuestion(next.data.question);
    }
  }, []);

  const begin = () =>
    startTransition(async () => {
      setError(null);
      const res = await startPlacementAction();
      if (!res.ok) return setError(res.message);
      setSince(res.data.since);
      await loadNext(res.data.since);
    });

  if (result) {
    return (
      <div className="pt-10 text-center">
        <p className="text-5xl" aria-hidden>
          🎯
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Your level: {result.level}</h1>
        <p className="mt-2 text-muted-foreground">
          {result.correct} of {result.answered} answers correct. Your missions, grammar and vocabulary are now tuned to {result.level}.
        </p>
        {result.xpAwarded > 0 && <p className="mt-2 font-semibold text-indigo-600">+{result.xpAwarded} XP</p>}
        <button type="button" className={`${buttonClass('primary', 'lg')} mt-8`} onClick={() => router.push('/plan')}>
          See my learning plan →
        </button>
      </div>
    );
  }

  if (!since) {
    return (
      <div className="pt-10">
        <h1 className="text-3xl font-bold tracking-tight">Let’s find your {languageName} level</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Up to {total} short questions. They get harder when you answer correctly and easier when you don’t, so the test stays short and accurate. No pressure — guessing is fine.
        </p>
        {error && (
          <p className="mt-4 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={begin} disabled={pending} className={buttonClass('primary', 'lg')}>
            {pending ? 'Preparing…' : 'Start the test'}
          </button>
          <button type="button" onClick={() => startTransition(async () => void (await skipPlacementAction('A1')))} disabled={pending} className={buttonClass('ghost', 'lg')}>
            Skip — I’m a beginner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-6">
      <div className="mb-6">
        <div className="mb-1 flex justify-between text-xs text-muted-foreground">
          <span>Question {Math.min(answered + 1, total)} of {total}</span>
          <span>Adaptive placement</span>
        </div>
        <ProgressBar value={(answered / total) * 100} label="Placement progress" />
      </div>
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm">
        {question ? (
          <ExerciseInput
            exercise={question}
            languageCode={languageCode}
            busy={pending}
            onSubmit={(answer) =>
              startTransition(async () => {
                setError(null);
                const res = await answerPlacementAction(since, question.id, answer);
                if (!res.ok) return setError(res.message);
                await loadNext(since);
              })
            }
          />
        ) : (
          <p className="text-muted-foreground">Loading…</p>
        )}
        {error && (
          <p className="mt-4 text-sm text-rose-600" role="alert">
            {error}
          </p>
        )}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">We don’t show right or wrong during the test so it stays relaxed.</p>
    </div>
  );
}
