'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { repeatError, type CheckState } from '@/app/actions/learn';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-secondary shrink-0">
      Prüfen
    </button>
  );
}

/** Wiederholungsübung: den eigenen Fehler richtig schreiben. */
export function ErrorRepeat({ errorId }: { errorId: string }) {
  const [state, action] = useFormState<CheckState, FormData>(repeatError, {
    status: 'idle',
    correct: false,
    solution: '',
    message: '',
  });
  const id = `wdh-${errorId}`;
  return (
    <form action={action} className="mt-2">
      <input type="hidden" name="error" value={errorId} />
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        Schreibe es richtig:
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          name="answer"
          autoComplete="off"
          spellCheck={false}
          className="input"
          lang="de"
        />
        <Submit />
      </div>
      <p role="status" className="mt-1 min-h-5 text-sm">
        {state.status === 'done' &&
          (state.correct ? (
            <span className="font-semibold text-ok">Richtig!</span>
          ) : (
            <span>
              <span className="font-semibold text-red">Noch nicht richtig.</span> Richtig ist:{' '}
              <b>{state.solution}</b>
            </span>
          ))}
        {state.status === 'error' && <span className="text-red">{state.message}</span>}
      </p>
    </form>
  );
}
