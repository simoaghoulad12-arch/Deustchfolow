'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { APP_ROLES, ROLE_LABELS } from '@/lib/roles';
import { inviteMember, type ActionState } from './actions';

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full sm:w-auto">
      {pending ? 'Wird eingeladen …' : 'Einladen'}
    </button>
  );
}

export function InviteForm() {
  const [state, action] = useFormState<ActionState, FormData>(inviteMember, {
    status: 'idle',
    message: '',
  });
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <label className="block">
        <span className="mb-1 block font-medium">Name</span>
        <input name="fullName" required maxLength={120} autoComplete="off" className="input" />
      </label>
      <label className="block">
        <span className="mb-1 block font-medium">E-Mail</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="off"
          inputMode="email"
          className="input"
        />
      </label>
      <label className="block">
        <span className="mb-1 block font-medium">Rolle</span>
        <select name="role" required defaultValue="" className="input">
          <option value="" disabled>
            – Rolle wählen –
          </option>
          {APP_ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <Submit />
      </div>
      {state.message && (
        <p
          role="status"
          className={`sm:col-span-2 ${state.status === 'error' ? 'text-red' : 'text-muted'}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
