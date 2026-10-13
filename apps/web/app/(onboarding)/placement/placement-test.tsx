'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { PublicExercise } from '@/lib/api/live';
import { buttonClass, ProgressBar, ScoreBar } from '@/components/live/ui';
import { ExerciseInput } from '@/components/live/exercise-input';
import { answerPlacementAction, finishPlacementAction, nextPlacementAction, skipPlacementAction, startPlacementAction, type PlacementResult } from '../actions';

const SKILL_LABEL: Record<string, string> = { GRAMMAR: 'Grammar', VOCABULARY: 'Vocabulary', READING: 'Reading', LISTENING: 'Listening', WRITING: 'Writing', SPEAKING: 'Speaking' };

function canRecord(): boolean {
  if (typeof window === 'undefined') return false;
  const w = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown };
  return Boolean(w.SpeechRecognition ?? w.webkitSpeechRecognition);
}

export function PlacementTest({ languageName, languageCode }: { languageName: string; languageCode: string }) {
  const router = useRouter();
  const [since, setSince] = useState<string | null>(null);
  const [question, setQuestion] = useState<PublicExercise | null>(null);
  const [answered, setAnswered] = useState(0);
  const [total, setTotal] = useState(18);
  const [result, setResult] = useState<PlacementResult | null>(null);
  // Speaking questions only when the browser can record; the learner can also opt out.
  const speech = useRef(false);
  useEffect(() => {
    speech.current = canRecord();
  }, []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const loadNext = useCallback(async (s: string) => {
    const next = await nextPlacementAction(s, speech.current);
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
    const skills = Object.entries(result.skillScores);
    return (
      <div className="pt-10">
        <div className="text-center">
          <p className="text-5xl" aria-hidden>
            🎯
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight">Your estimated level: {result.level}</h1>
          <p className="mt-2 text-muted-foreground">
            {result.correct} of {result.answered} answers correct. Your missions, grammar and vocabulary are now tuned to {result.level}.
          </p>
          {result.xpAwarded > 0 && <p className="mt-2 font-semibold text-indigo-600">+{result.xpAwarded} XP</p>}
        </div>
        {skills.length > 0 && (
          <div className="mx-auto mt-8 max-w-md space-y-3 rounded-3xl border border-border bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Detailed results</h2>
            {skills.map(([skill, score]) => (
              <ScoreBar key={skill} label={SKILL_LABEL[skill] ?? skill} value={score} />
            ))}
            <p className="pt-2 text-sm font-medium text-indigo-700">{result.recommendation}</p>
          </div>
        )}
        <div className="mt-8 text-center">
          <button type="button" className={buttonClass('primary', 'lg')} onClick={() => router.push('/plan')}>
            See my learning plan →
          </button>
        </div>
      </div>
    );
  }

  if (!since) {
    return (
      <div className="pt-10">
        <h1 className="text-3xl font-bold tracking-tight">Let’s find your {languageName} level</h1>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Up to {total} short questions on grammar, vocabulary, reading, listening, writing and speaking. They get harder when you answer correctly and easier when you don’t, so the test stays short and accurate. No pressure — guessing is fine.
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
      {question?.type === 'SPEAKING' && (
        <p className="mt-2 text-center text-xs">
          <button
            type="button"
            className="text-indigo-600 underline"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                speech.current = false;
                await loadNext(since);
              })
            }
          >
            I can’t speak right now — skip speaking questions
          </button>
        </p>
      )}
    </div>
  );
}
