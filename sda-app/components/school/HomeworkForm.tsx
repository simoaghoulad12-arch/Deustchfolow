import { saveHomework } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field, textareaClass } from '@/components/forms/Field';
import {
  HOMEWORK_STATUSES,
  type GroupRow,
  type HomeworkRow,
  type StudentRow,
} from '@/lib/data/types';

/** Hausaufgabe anlegen (auch für eine ganze Gruppe) oder bearbeiten (legacy: formHw). */
export function HomeworkForm({
  entry,
  students,
  groups,
  student,
}: {
  entry?: HomeworkRow;
  students: StudentRow[];
  groups: GroupRow[];
  student?: string;
}) {
  return (
    <ActionForm action={saveHomework}>
      {entry && <input type="hidden" name="id" value={entry.id} />}
      <Field label="Schüler">
        <select
          name="student_id"
          required
          defaultValue={entry?.student_id ?? student ?? ''}
          className="input"
        >
          <option value="">– Schüler wählen –</option>
          {!entry &&
            groups.map((g) => (
              <option key={g.id} value={`group:${g.id}`}>
                Alle Schüler der Gruppe {g.name}
              </option>
            ))}
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.level})
            </option>
          ))}
        </select>
      </Field>
      <Field label="Aufgabe">
        <input
          name="task"
          required
          maxLength={500}
          defaultValue={entry?.task}
          className="input de-content"
          autoComplete="off"
        />
      </Field>
      <Field label="Ziel">
        <input
          name="goal"
          maxLength={500}
          defaultValue={entry?.goal}
          className="input de-content"
          autoComplete="off"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Deadline">
          <input
            name="deadline"
            type="date"
            defaultValue={entry?.deadline ?? ''}
            className="input"
          />
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={entry?.status ?? 'Offen'} className="input">
            {HOMEWORK_STATUSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Feedback">
        <textarea name="feedback" defaultValue={entry?.feedback} className={textareaClass} />
      </Field>
    </ActionForm>
  );
}
