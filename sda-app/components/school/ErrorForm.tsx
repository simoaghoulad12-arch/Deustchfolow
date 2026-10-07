import { saveError } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field } from '@/components/forms/Field';
import { ERROR_CATEGORIES, ERROR_STATUSES, type ErrorRow, type StudentRow } from '@/lib/data/types';

/** Fehler erfassen oder bearbeiten (legacy: formError). */
export function ErrorForm({
  entry,
  students,
  student,
  today,
}: {
  entry?: ErrorRow;
  students: StudentRow[];
  student?: string;
  today: string;
}) {
  return (
    <ActionForm action={saveError}>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Schüler">
          <select
            name="student_id"
            required
            defaultValue={entry?.student_id ?? student ?? ''}
            className="input"
          >
            <option value="">– Schüler wählen –</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.level})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Datum">
          <input name="date" type="date" defaultValue={entry?.date ?? today} className="input" />
        </Field>
      </div>
      <Field label="Fehler (so wurde es gesagt/geschrieben)">
        <input
          name="error"
          required
          maxLength={500}
          defaultValue={entry?.error}
          className="input de-content"
          autoComplete="off"
        />
      </Field>
      <Field label="Korrektur">
        <input
          name="correction"
          maxLength={500}
          defaultValue={entry?.correction}
          className="input de-content"
          autoComplete="off"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Kategorie">
          <select name="category" defaultValue={entry?.category ?? 'Grammatik'} className="input">
            {ERROR_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={entry?.status ?? 'offen'} className="input">
            {ERROR_STATUSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
    </ActionForm>
  );
}
