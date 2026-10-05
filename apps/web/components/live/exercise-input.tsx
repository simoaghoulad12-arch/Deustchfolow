'use client';

import { useEffect, useState } from 'react';
import { cn } from '@deutschflow/ui';
import type { PublicExercise } from '@/lib/api/live';
import { buttonClass } from './ui';
import { speak } from './use-speech';

const TYPE_LABEL: Record<string, string> = {
  MULTIPLE_CHOICE: 'Choose the right answer',
  FILL_BLANK: 'Fill in the blank',
  SENTENCE_ORDER: 'Put the words in order',
  TRANSLATION: 'Translate',
  ERROR_CORRECTION: 'Correct the sentence',
  MATCHING: 'Match the pairs',
  READING_COMPREHENSION: 'Read and answer',
  LISTENING_COMPREHENSION: 'Listen and answer',
  FREE_WRITING: 'Write freely',
  SPEAKING: 'Say it',
  CONVERSATION: 'Reply',
};

/**
 * Renders any of the 11 exercise types and returns the learner's answer as
 * a string (matching answers as JSON). Grading always happens server-side.
 */
export function ExerciseInput({
  exercise,
  languageCode,
  onSubmit,
  busy,
  disabled,
}: {
  exercise: PublicExercise;
  languageCode: string;
  onSubmit: (answer: string) => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const p = exercise.payload;
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [matches, setMatches] = useState<Record<string, string>>({});

  useEffect(() => {
    setText(exercise.type === 'ERROR_CORRECTION' ? exercise.prompt : '');
    setPicked(null);
    setOrder([]);
    setMatches({});
  }, [exercise.id, exercise.type, exercise.prompt]);

  const inputClass = 'h-12 w-full rounded-xl border border-border bg-white px-4 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100';
  let answer = '';
  let body: React.ReactNode = null;

  switch (exercise.type) {
    case 'MULTIPLE_CHOICE':
    case 'READING_COMPREHENSION':
    case 'LISTENING_COMPREHENSION': {
      answer = picked ?? '';
      body = (
        <>
          {p.passage && <p className="mb-4 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed" lang={languageCode}>{p.passage}</p>}
          {p.audioText && (
            <button type="button" onClick={() => speak(p.audioText!, languageCode, 0.9)} className={cn(buttonClass('secondary', 'sm'), 'mb-4')}>
              🔊 Play audio
            </button>
          )}
          <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Answer options">
            {(p.options ?? []).map((o) => (
              <button
                key={o}
                type="button"
                role="radio"
                aria-checked={picked === o}
                disabled={disabled}
                onClick={() => setPicked(o)}
                className={cn('rounded-xl border bg-white px-4 py-3 text-left text-base transition', picked === o ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-border hover:border-indigo-300')}
                lang={languageCode}
              >
                {o}
              </button>
            ))}
          </div>
        </>
      );
      break;
    }
    case 'SENTENCE_ORDER': {
      const tokens = p.tokens ?? [];
      answer = order.map((i) => tokens[i]).join(' ');
      body = (
        <div className="space-y-3">
          <div className="flex min-h-[52px] flex-wrap gap-2 rounded-xl border-2 border-dashed border-slate-200 p-2" aria-label="Your sentence">
            {order.map((i, pos) => (
              <button key={`${i}-${pos}`} type="button" disabled={disabled} onClick={() => setOrder((o) => o.filter((_, k) => k !== pos))} className="rounded-lg bg-indigo-600 px-3 py-1.5 text-white" lang={languageCode}>
                {tokens[i]}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {tokens.map((t, i) =>
              order.includes(i) ? null : (
                <button key={`${t}-${i}`} type="button" disabled={disabled} onClick={() => setOrder((o) => [...o, i])} className="rounded-lg border border-border bg-white px-3 py-1.5 hover:border-indigo-300" lang={languageCode}>
                  {t}
                </button>
              ),
            )}
          </div>
        </div>
      );
      break;
    }
    case 'MATCHING': {
      const lefts = p.lefts ?? [];
      const rights = p.rights ?? [];
      answer = Object.keys(matches).length === lefts.length ? JSON.stringify(matches) : '';
      body = (
        <ul className="space-y-2">
          {lefts.map((l) => (
            <li key={l} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
              <span className="font-medium sm:w-1/2" lang={languageCode}>{l}</span>
              <select
                aria-label={`Match for ${l}`}
                disabled={disabled}
                value={matches[l] ?? ''}
                onChange={(e) => setMatches((m) => ({ ...m, [l]: e.target.value }))}
                className="h-11 rounded-xl border border-border bg-white px-3 sm:w-1/2"
              >
                <option value="">Choose…</option>
                {rights.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </li>
          ))}
        </ul>
      );
      break;
    }
    case 'FREE_WRITING':
    case 'SPEAKING':
    case 'CONVERSATION': {
      answer = text;
      body = (
        <textarea value={text} disabled={disabled} onChange={(e) => setText(e.target.value)} rows={4} className="w-full rounded-xl border border-border bg-white p-3 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100" lang={languageCode} aria-label="Your answer" />
      );
      break;
    }
    default: {
      answer = text;
      body = (
        <>
          {p.sourceText && <p className="mb-3 rounded-xl bg-slate-50 p-3 text-sm">{p.sourceText}</p>}
          <input value={text} disabled={disabled} onChange={(e) => setText(e.target.value)} className={inputClass} lang={languageCode} aria-label="Your answer" autoComplete="off" autoCapitalize="off" spellCheck={false} />
        </>
      );
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (answer.trim() && !busy && !disabled) onSubmit(answer.trim());
      }}
      className="space-y-4"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">{TYPE_LABEL[exercise.type] ?? 'Exercise'}</p>
        <p className="mt-1 text-lg font-medium" lang={languageCode}>
          {exercise.prompt}
        </p>
      </div>
      {body}
      <button type="submit" disabled={!answer.trim() || busy || disabled} className={buttonClass('primary')}>
        {busy ? 'Checking…' : 'Check'}
      </button>
    </form>
  );
}
