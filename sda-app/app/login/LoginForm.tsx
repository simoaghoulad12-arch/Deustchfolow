'use client';

import { Field } from '@/components/forms/Field';
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
      <Field label="E-Mail">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          className="input"
        />
      </Field>
      <Submit />
      {state.message && (
        <p role="status" className={state.status === 'error' ? 'text-red' : 'text-muted'}>
          {state.message}
        </p>
      )}
    </form>
  );
}
