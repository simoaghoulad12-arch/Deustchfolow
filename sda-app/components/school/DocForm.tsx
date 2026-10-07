import { saveDoc } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field, textareaClass } from '@/components/forms/Field';
import { findLesson } from '@/content';
import type { GroupRow, LessonDocRow, StudentRow } from '@/lib/data/types';
import type { DocPrefill } from '@/lib/school';

/**
 * Stunde dokumentieren (legacy: formDoc). Ziel: in 2 Minuten ausgefüllt –
 * Felder aus dem Skript vorausgefüllt, Anwesenheit per Häkchen (nicht angehakt = abwesend).
 */
export function DocForm({
  doc,
  group,
  lessonId,
  students,
  prefill,
  today,
}: {
  doc?: LessonDocRow;
  group: GroupRow;
  lessonId: string;
  students: StudentRow[];
  prefill: DocPrefill;
  today: string;
}) {
  const v = (field: keyof LessonDocRow, fallback: string) =>
    doc ? String(doc[field] ?? '') : fallback;
  return (
    <ActionForm action={saveDoc}>
      {doc && <input type="hidden" name="id" value={doc.id} />}
      <input type="hidden" name="group_id" value={group.id} />
      <input type="hidden" name="lesson_id" value={lessonId} />
      <p className="de-content rounded-lg bg-bg px-3 py-2">
        <b>{group.name}</b> · {lessonId} · {findLesson(lessonId)?.title}
      </p>
      <Field label="Datum">
        <input name="date" type="date" defaultValue={doc?.date ?? today} className="input" />
      </Field>
      <fieldset>
        <legend className="mb-1 font-medium">Anwesend (nicht angehakt = abwesend)</legend>
        {students.length ? (
          <div className="grid gap-1 sm:grid-cols-2">
            {students.map((s) => (
              <label key={s.id} className="flex min-h-11 items-center gap-3">
                <input
                  type="checkbox"
                  name="present"
                  value={s.id}
                  defaultChecked={doc ? doc.present.includes(s.id) : true}
                  className="h-5 w-5"
                />
                {s.name}
              </label>
            ))}
          </div>
        ) : (
          <p className="text-muted">Keine Schüler in dieser Gruppe.</p>
        )}
      </fieldset>
      <Field label="Heute behandelt">
        <textarea
          name="covered"
          defaultValue={v('covered', prefill.covered)}
          className={`${textareaClass} de-content`}
        />
      </Field>
      <Field label="Schüler kann jetzt">
        <textarea
          name="can_do"
          defaultValue={v('can_do', prefill.canDo)}
          className={`${textareaClass} de-content`}
        />
      </Field>
      <Field label="Wichtige Fehler">
        <textarea
          name="errors"
          defaultValue={doc?.errors}
          className={`${textareaClass} de-content`}
        />
      </Field>
      <Field label="Hausaufgabe">
        <input
          name="homework"
          maxLength={500}
          defaultValue={v('homework', prefill.homework)}
          className="input de-content"
        />
      </Field>
      {!doc && (
        <label className="flex min-h-11 items-center gap-3">
          <input type="checkbox" name="homework_for_present" className="h-5 w-5" />
          Hausaufgabe für alle Anwesenden im Hausaufgaben-System anlegen
        </label>
      )}
      <Field label="Nächste Stunde">
        <input
          name="next_lesson"
          maxLength={300}
          defaultValue={v('next_lesson', prefill.nextLesson)}
          className="input de-content"
        />
      </Field>
      <Field label="Material (Lehrbuch, Seite, eigene Übung)">
        <input
          name="material"
          maxLength={200}
          defaultValue={v('material', prefill.material)}
          className="input"
        />
      </Field>
      <Field label="Besondere Probleme">
        <textarea name="problems" defaultValue={doc?.problems} className={textareaClass} />
      </Field>
    </ActionForm>
  );
}
