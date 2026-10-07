import { saveStudent } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field, textareaClass } from '@/components/forms/Field';
import { content } from '@/content';
import { LEVEL_KEYS } from '@/content/types';
import { SKILLS, type GroupRow, type StudentRow } from '@/lib/data/types';

/** Schüler anlegen oder bearbeiten (legacy: formStudent). */
export function StudentForm({
  student,
  groups,
  defaultGroup,
}: {
  student?: StudentRow;
  groups: GroupRow[];
  defaultGroup?: string;
}) {
  const s = student;
  const modules = content.curriculum.levels.flatMap((l) => l.modules);
  return (
    <ActionForm action={saveStudent}>
      {s && <input type="hidden" name="id" value={s.id} />}
      <Field label="Name">
        <input
          name="name"
          required
          maxLength={120}
          defaultValue={s?.name}
          className="input"
          autoComplete="off"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Level">
          <select
            name="level"
            defaultValue={s?.level ?? groups.find((g) => g.id === defaultGroup)?.level ?? 'A1'}
            className="input"
          >
            {LEVEL_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Gruppe">
          <select
            name="group_id"
            defaultValue={s?.group_id ?? defaultGroup ?? ''}
            className="input"
          >
            <option value="">– keine –</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.level})
              </option>
            ))}
          </select>
        </Field>
        <Field label="Startdatum">
          <input
            name="start_date"
            type="date"
            defaultValue={s?.start_date ?? ''}
            className="input"
          />
        </Field>
      </div>
      <Field label="Aktuelles Modul" hint="Muss zum Level passen.">
        <select name="current_module" defaultValue={s?.current_module ?? ''} className="input">
          <option value="">–</option>
          {modules.map((m) => (
            <option key={m.id} value={m.id}>
              {m.id}: {m.title}
            </option>
          ))}
        </select>
      </Field>
      <fieldset>
        <legend className="mb-1 font-medium">Einschätzung 1 (schwach) bis 5 (sehr gut)</legend>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SKILLS.map((k) => (
            <Field key={k.key} label={k.label}>
              <select
                name={k.key}
                defaultValue={s?.[k.key] ? String(s[k.key]) : ''}
                className="input"
              >
                <option value="">–</option>
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </Field>
          ))}
        </div>
      </fieldset>
      <Field label="Stärken">
        <textarea name="strengths" defaultValue={s?.strengths} className={textareaClass} />
      </Field>
      <Field label="Schwächen">
        <textarea name="weaknesses" defaultValue={s?.weaknesses} className={textareaClass} />
      </Field>
      <Field label="Nächste Lernziele">
        <textarea name="next_goals" defaultValue={s?.next_goals} className={textareaClass} />
      </Field>
    </ActionForm>
  );
}
