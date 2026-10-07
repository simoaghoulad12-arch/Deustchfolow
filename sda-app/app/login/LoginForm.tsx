'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { sendMagicLink, type LoginState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? 'Wird gesendet …' : 'Anmeldelink senden'}
    </button>
  );
}

export function LoginForm() {
  const [state, action] = useFormState<LoginState, FormData>(sendMagicLink, {
    status: 'idle',
    message: '',
  });
  return (
    <form action={action} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-medium">E-Mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input"
        />
      </label>
      <Submit />
      {state.message && (
        <p role="status" className={state.status === 'error' ? 'text-red' : 'text-muted'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
