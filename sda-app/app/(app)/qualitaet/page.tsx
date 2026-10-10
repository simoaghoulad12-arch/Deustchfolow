import Link from 'next/link';
import { saveThresholds } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { Field } from '@/components/forms/Field';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { StatementSections } from '@/components/StatementSections';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';
import { getStore } from '@/lib/data/store';
import { getPrefs } from '@/lib/prefs';
import { qualitySummary, studentQuality, type StudentQuality } from '@/lib/quality';
import { todayISO } from '@/lib/school';
import { normalizeThresholds } from '@/lib/validation';

export const dynamic = 'force-dynamic';

/** 12 Quality Control (legacy: pageQC). Kennzahlen aus den Daten; Warnschwellen nur, wenn die Leitung sie festlegt. */
export default async function QualityPage() {
  const member = await requireMember();
  const { lang } = getPrefs();
  const today = todayISO();
  const [data, raw] = await Promise.all([loadSchool(), getStore().setting('qc_thresholds')]);
  const t = normalizeThresholds(raw);
  const sum = qualitySummary(data, today);
  const per = studentQuality(data, today, t);
  const anyThreshold =
    t.attendanceMin !== null || t.homeworkDoneMin !== null || t.daysWithoutDocMax !== null;

  const tiles: [string, string, string][] = [
    ['Schüler', String(sum.students), ''],
    [
      'Ø Anwesenheit',
      sum.avgAttendance === null ? '–' : `${sum.avgAttendance} %`,
      'aus der Dokumentation',
    ],
    [
      'Hausaufgaben erledigt',
      sum.homeworkDone === null ? '–' : `${sum.homeworkDone} %`,
      `${sum.homeworkDoneCount} von ${sum.homeworkTotal}`,
    ],
    ['Fehler offen / verbessert', `${sum.errorsOpen} / ${sum.errorsImproved}`, ''],
    ['Dokumentationen', String(sum.docs), `${sum.docsLast7} in den letzten 7 Tagen`],
  ];
  const top = (title: string, list: StudentQuality[], fmt: (q: StudentQuality) => string) => (
    <section className="card">
      <h2 className="mb-2 font-bold">{title}</h2>
      {list.length ? (
        <ol className="space-y-1">
          {list.slice(0, 5).map((q) => (
            <li key={q.student.id}>
              <Link
                href={`/fortschritt/${q.student.id}`}
                className="underline-offset-2 hover:underline"
              >
                {q.student.name}
              </Link>{' '}
              · {fmt(q)}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted">Keine Daten.</p>
      )}
    </section>
  );
  const warned = per.filter((q) => q.warnings.length);

  return (
    <>
      <PageHeader
        page="qc"
        lang={lang}
        intro="Kennzahlen werden aus Dokumentation, Hausaufgaben und Fehlern berechnet. Es gibt bewusst keine Warnschwellen, solange das Team keine festgelegt hat."
      />
      <ul className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {tiles.map(([title, value, hint]) => (
          <li key={title} className="card">
            <b className="block text-sm">{title}</b>
            <span className="block text-2xl font-bold">{value}</span>
            <span className="text-xs text-muted">{hint}</span>
          </li>
        ))}
      </ul>
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {top(
          'Niedrigste Anwesenheit',
          per.filter((q) => q.attendance !== null).sort((a, b) => a.attendance! - b.attendance!),
          (q) => `${q.attendance} %`,
        )}
        {top(
          'Meiste offene Fehler',
          per.filter((q) => q.openErrors > 0).sort((a, b) => b.openErrors - a.openErrors),
          (q) => String(q.openErrors),
        )}
        {top(
          'Am längsten ohne Dokumentation',
          [...per].sort((a, b) => (b.daysWithoutDoc ?? 1e9) - (a.daysWithoutDoc ?? 1e9)),
          (q) => (q.daysWithoutDoc === null ? 'noch nie' : `vor ${q.daysWithoutDoc} Tagen`),
        )}
      </div>

      <section className="card mb-4">
        <h2 className="mb-1 flex flex-wrap items-center gap-2 font-bold">
          Warnschwellen <Label kind="OFFENE ENTSCHEIDUNG" lang={lang} />
        </h2>
        {anyThreshold ? (
          warned.length ? (
            <ul className="mb-3 space-y-1" aria-label="Warnungen">
              {warned.map((q) => (
                <li key={q.student.id} className="text-red">
                  <Link href={`/fortschritt/${q.student.id}`} className="font-semibold underline">
                    {q.student.name}
                  </Link>
                  : {q.warnings.join(', ')}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-muted">Niemand liegt unter den festgelegten Schwellen.</p>
          )
        ) : (
          <p className="mb-3 text-muted">
            Noch keine Schwellen festgelegt – darum keine Warnungen.
          </p>
        )}
        {member.role === 'admin' ? (
          <ActionForm
            action={saveThresholds}
            submitLabel="Schwellen speichern"
            className="grid gap-3 sm:grid-cols-3"
          >
            <Field label="Anwesenheit mindestens (%)" hint="leer = keine Schwelle">
              <input
                name="attendanceMin"
                type="number"
                min={0}
                max={100}
                defaultValue={t.attendanceMin ?? ''}
                className="input"
              />
            </Field>
            <Field label="Hausaufgaben erledigt mindestens (%)" hint="leer = keine Schwelle">
              <input
                name="homeworkDoneMin"
                type="number"
                min={0}
                max={100}
                defaultValue={t.homeworkDoneMin ?? ''}
                className="input"
              />
            </Field>
            <Field label="Höchstens Tage ohne Dokumentation" hint="leer = keine Schwelle">
              <input
                name="daysWithoutDocMax"
                type="number"
                min={0}
                max={365}
                defaultValue={t.daysWithoutDocMax ?? ''}
                className="input"
              />
            </Field>
          </ActionForm>
        ) : (
          <p className="text-sm text-muted">Schwellen legt nur die Leitung fest.</p>
        )}
      </section>

      <StatementSections page="qc" lang={lang} />
    </>
  );
}
