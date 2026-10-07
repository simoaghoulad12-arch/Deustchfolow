'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { checkExercise, type CheckState } from '@/app/actions/learn';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-secondary shrink-0">
      Prüfen
    </button>
  );
}

/** Eine Übung mit automatischer Prüfung; nach dem Prüfen wird die Lösung gezeigt. */
export function ExerciseItem({
  id,
  question,
  solved,
}: {
  id: string;
  question: string;
  solved: boolean;
}) {
  const [state, action] = useFormState<CheckState, FormData>(checkExercise, {
    status: 'idle',
    correct: false,
    solution: '',
    message: '',
  });
  const inputId = `antwort-${id.replace(/[^\w-]/g, '-')}`;
  return (
    <li className="card">
      <form action={action}>
        <input type="hidden" name="exercise" value={id} />
        <label htmlFor={inputId} className="mb-2 block">
          {question}
          {solved && state.status === 'idle' && (
            <span className="ms-2 text-sm font-semibold text-ok">✓ bereits gelöst</span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            id={inputId}
            name="answer"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="input"
          />
          <Submit />
        </div>
        <p role="status" className="mt-2 min-h-5 text-sm">
          {state.status === 'done' &&
            (state.correct ? (
              <span className="font-semibold text-ok">Richtig!</span>
            ) : (
              <span>
                <span className="font-semibold text-red">Noch nicht richtig.</span> Lösung:{' '}
                <b>{state.solution}</b>
              </span>
            ))}
          {state.status === 'error' && <span className="text-red">{state.message}</span>}
        </p>
      </form>
    </li>
  );
}
