import { deleteExam, saveExam, saveModelTest } from '@/app/actions/school';
import { ExamNotice } from '@/components/ExamNotice';
import { ActionForm } from '@/components/forms/ActionForm';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { Field } from '@/components/forms/Field';
import { ReadinessView } from '@/components/ReadinessView';
import { LEVEL_KEYS } from '@/content/types';
import {
  EXAM_PART_KEY,
  EXAM_PARTS,
  EXAM_RESULTS,
  type ExamRegistrationRow,
  type ModelTestResultRow,
  type StudentRow,
} from '@/lib/data/types';
import { readiness } from '@/lib/examPrep';

function ExamFields({ s, reg }: { s: StudentRow; reg?: ExamRegistrationRow }) {
  return (
    <>
      {reg && <input type="hidden" name="id" value={reg.id} />}
      <input type="hidden" name="student_id" value={s.id} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Level">
          <select name="level" defaultValue={reg?.level ?? s.level} className="input">
            {LEVEL_KEYS.map((k) => (
              <option key={k}>{k}</option>
            ))}
          </select>
        </Field>
        <Field label="Anbieter">
          <input
            name="provider"
            maxLength={120}
            defaultValue={reg?.provider}
            className="input"
            autoComplete="off"
          />
        </Field>
        <Field label="Datum">
          <input
            name="exam_date"
            type="date"
            defaultValue={reg?.exam_date ?? ''}
            className="input"
          />
        </Field>
        <Field label="Ort">
          <input
            name="place"
            maxLength={120}
            defaultValue={reg?.place}
            className="input"
            autoComplete="off"
          />
        </Field>
        <Field label="Ergebnis">
          <select name="result" defaultValue={reg?.result ?? 'offen'} className="input">
            {EXAM_RESULTS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </Field>
        <Field label="Notiz">
          <input
            name="notes"
            maxLength={1000}
            defaultValue={reg?.notes}
            className="input"
            autoComplete="off"
          />
        </Field>
      </div>
    </>
  );
}

/** Prüfungen eines Schülers: Bereit für die Prüfung?, Modelltest eintragen, Anmeldungen mit Ergebnis. */
export function StudentExams({
  s,
  tests,
  regs,
  isAdmin,
  today,
}: {
  s: StudentRow;
  tests: ModelTestResultRow[];
  regs: ExamRegistrationRow[];
  isAdmin: boolean;
  today: string;
}) {
  return (
    <section id="pruefungen" className="card mb-4 scroll-mt-20">
      <h2 className="mb-2 text-xl font-bold">Prüfungen</h2>
      <ExamNotice />
      <h3 className="mb-2 mt-4 font-semibold">Bereit für die Prüfung {s.level}?</h3>
      <ReadinessView r={readiness(s.level, tests)} lessonHref={(id) => `/stunde/${id}`} />

      <h3 className="mb-2 mt-5 font-semibold">Anmeldungen</h3>
      {!regs.length && <p className="mb-2 text-sm text-muted">Noch keine Anmeldung.</p>}
      <ul className="space-y-3">
        {regs.map((r) => (
          <li
            key={r.id}
            className={`rounded-lg border p-3 ${r.result === 'bestanden' ? 'border-ok' : 'border-line'}`}
          >
            <p className="mb-2 font-semibold">
              {r.level} · {r.provider || 'Anbieter offen'} · {r.exam_date ?? 'Datum offen'} ·{' '}
              {r.result}
            </p>
            <details>
              <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-red">
                Bearbeiten
              </summary>
              <ActionForm action={saveExam} className="mt-2 space-y-3">
                <ExamFields s={s} reg={r} />
              </ActionForm>
              {isAdmin && (
                <div className="mt-2">
                  <ConfirmDelete
                    action={deleteExam}
                    id={r.id}
                    question="Diese Anmeldung löschen?"
                  />
                </div>
              )}
            </details>
          </li>
        ))}
      </ul>
      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-red">
          Prüfungsanmeldung erfassen
        </summary>
        <ActionForm action={saveExam} submitLabel="Anmeldung speichern" className="mt-2 space-y-3">
          <ExamFields s={s} />
        </ActionForm>
      </details>

      <details className="mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-medium text-red">
          Modelltest-Ergebnis eintragen
        </summary>
        <ActionForm
          action={saveModelTest}
          submitLabel="Ergebnis speichern"
          className="mt-2 space-y-3"
        >
          <input type="hidden" name="student_id" value={s.id} />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Level">
              <select name="level" defaultValue={s.level} className="input">
                {LEVEL_KEYS.map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </Field>
            <Field label="Datum">
              <input name="date" type="date" defaultValue={today} className="input" />
            </Field>
          </div>
          <p className="text-sm text-muted">
            Pro Teil Punkte und Höchstpunktzahl. Nicht geschriebene Teile leer lassen.
          </p>
          {EXAM_PARTS.map((part) => (
            <fieldset key={part} className="grid grid-cols-2 gap-3">
              <legend className="mb-1 font-medium">{part}</legend>
              <Field label={`${part}: Punkte`}>
                <input
                  name={`score-${EXAM_PART_KEY[part]}`}
                  inputMode="decimal"
                  className="input"
                  autoComplete="off"
                />
              </Field>
              <Field label={`${part}: maximal`}>
                <input
                  name={`max-${EXAM_PART_KEY[part]}`}
                  inputMode="decimal"
                  className="input"
                  autoComplete="off"
                />
              </Field>
            </fieldset>
          ))}
        </ActionForm>
      </details>
    </section>
  );
}
