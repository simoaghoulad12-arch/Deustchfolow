'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { importLegacy, type ImportState } from '@/app/actions/import';
import { Field, textareaClass } from './forms/Field';

function Buttons({ canImport }: { canImport: boolean }) {
  const { pending } = useFormStatus();
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="submit"
        name="mode"
        value="preview"
        disabled={pending}
        className="btn-secondary"
      >
        Prüfen
      </button>
      <button
        type="submit"
        name="mode"
        value="import"
        disabled={pending || !canImport}
        className="btn-primary"
        onClick={(e) => {
          if (
            !window.confirm(
              'Jetzt importieren? Bitte nur einmal ausführen, sonst entstehen doppelte Einträge.',
            )
          )
            e.preventDefault();
        }}
      >
        {pending ? 'Bitte warten …' : 'Importieren'}
      </button>
    </div>
  );
}

/** Daten aus der alten Version übernehmen (nur Leitung). */
export function ImportForm() {
  const [state, action] = useFormState<ImportState, FormData>(importLegacy, {
    status: 'idle',
    message: '',
    warnings: [],
  });
  return (
    <form action={action} className="space-y-3">
      <Field
        label="Export aus der alten Version"
        hint="Alte Version → Einstellungen & Daten → Export anzeigen → Text kopieren und hier einfügen."
      >
        <textarea
          name="export"
          required
          className={`${textareaClass} font-mono text-sm`}
          spellCheck={false}
        />
      </Field>
      {state?.message && (
        <p
          role={state.status === 'error' ? 'alert' : 'status'}
          className={
            state.status === 'error'
              ? 'text-red'
              : state.status === 'done'
                ? 'font-semibold text-ok'
                : ''
          }
        >
          {state.message}
        </p>
      )}
      {state?.warnings.length > 0 && (
        <details>
          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm">
            Hinweise ({state.warnings.length})
          </summary>
          <ul className="list-disc ps-5 text-sm text-muted">
            {state.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </details>
      )}
      <Buttons canImport={state?.status === 'preview'} />
    </form>
  );
}
