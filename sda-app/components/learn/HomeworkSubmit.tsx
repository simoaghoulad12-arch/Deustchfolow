'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { handInHomework, type SimpleState } from '@/app/actions/learn';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Wird abgegeben …' : 'Abgeben'}
    </button>
  );
}

export function HomeworkSubmit({ homeworkId }: { homeworkId: string }) {
  const [state, action] = useFormState<SimpleState, FormData>(handInHomework, {
    status: 'idle',
    message: '',
  });
  const id = `abgabe-${homeworkId}`;
  if (state.status === 'done')
    return (
      <p role="status" className="font-semibold text-ok">
        {state.message}
      </p>
    );
  return (
    <form action={action} className="mt-3 space-y-2">
      <input type="hidden" name="homework" value={homeworkId} />
      <label htmlFor={id} className="block font-medium">
        Meine Abgabe
      </label>
      <textarea
        id={id}
        name="text"
        required
        maxLength={5000}
        className="input min-h-28 py-2"
        lang="de"
      />
      {state.status === 'error' && (
        <p role="alert" className="text-red">
          {state.message}
        </p>
      )}
      <Submit />
    </form>
  );
}
