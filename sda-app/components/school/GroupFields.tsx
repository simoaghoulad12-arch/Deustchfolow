import { Field } from '@/components/forms/Field';
import { LEVEL_KEYS } from '@/content/types';
import type { GroupRow } from '@/lib/data/types';

export function GroupFields({ group }: { group?: GroupRow }) {
  return (
    <>
      {group && <input type="hidden" name="id" value={group.id} />}
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name der Gruppe">
          <input
            name="name"
            required
            maxLength={80}
            defaultValue={group?.name}
            className="input"
            autoComplete="off"
          />
        </Field>
        <Field label="Level">
          <select name="level" defaultValue={group?.level ?? 'A1'} className="input">
            {LEVEL_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Startdatum" hint="Bestimmt die Stunde von heute im Playbook.">
          <input
            name="start_date"
            type="date"
            defaultValue={group?.start_date ?? ''}
            className="input"
          />
        </Field>
      </div>
    </>
  );
}
