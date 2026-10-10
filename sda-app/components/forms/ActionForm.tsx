'use client';

import { useFormState, useFormStatus } from 'react-dom';
import type { FormState } from '@/app/actions/school';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary">
      {pending ? 'Wird gespeichert …' : label}
    </button>
  );
}

/** Formular mit Server-Aktion: zeigt Fehlermeldungen; bei Erfolg leitet die Aktion weiter. */
export function ActionForm({
  action,
  submitLabel = 'Speichern',
  children,
  className = 'space-y-4',
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  submitLabel?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction] = useFormState(action, { error: '' });
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red bg-red-soft px-3 py-2 text-red">
          {state.error}
        </p>
      )}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
