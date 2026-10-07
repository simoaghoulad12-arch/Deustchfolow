'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { submitMiniTest, type TestState } from '@/app/actions/learn';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Wird ausgewertet …' : 'Test abgeben'}
    </button>
  );
}

/** Wochen-Mini-Test: alle Fragen beantworten, dann Punktzahl und Lösungen sehen. */
export function MiniTestForm({
  moduleId,
  questions,
}: {
  moduleId: string;
  questions: { id: string; frage: string }[];
}) {
  const [state, action] = useFormState<TestState, FormData>(submitMiniTest, {
    status: 'idle',
    score: 0,
    max: 0,
    results: [],
    message: '',
  });
  const result = (id: string) => state.results.find((r) => r.id === id);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="module" value={moduleId} />
      <ol className="space-y-3">
        {questions.map((q, i) => {
          const r = result(q.id);
          const inputId = `test-${i}`;
          return (
            <li key={q.id} className={`card ${r ? (r.correct ? 'border-ok' : 'border-red') : ''}`}>
              <label htmlFor={inputId} className="mb-2 block">
                {i + 1}. {q.frage}
              </label>
              <input
                id={inputId}
                name={`q-${q.id}`}
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                className="input"
                disabled={!!r}
                defaultValue={r?.answer}
              />
              {r && (
                <p className="mt-2 text-sm">
                  {r.correct ? (
                    <span className="font-semibold text-ok">Richtig</span>
                  ) : (
                    <span>
                      Lösung: <b>{r.solution}</b>
                    </span>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ol>
      {state.status === 'done' ? (
        <p role="status" className="card text-lg font-bold">
          Ergebnis: {state.score} von {state.max} Punkten (
          {Math.round((100 * state.score) / state.max)} %)
        </p>
      ) : (
        <>
          {state.status === 'error' && (
            <p role="alert" className="text-red">
              {state.message}
            </p>
          )}
          <Submit />
        </>
      )}
    </form>
  );
}
