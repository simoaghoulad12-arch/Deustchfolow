import Link from 'next/link';
import { setErrorStatus } from '@/app/actions/school';
import { Field } from '@/components/forms/Field';
import { StatusSelect } from '@/components/forms/StatusSelect';
import { PageHeader } from '@/components/PageHeader';
import { requireMember } from '@/lib/auth';
import { loadSchool, nameOf } from '@/lib/data/queries';
import { ERROR_CATEGORIES, ERROR_STATUSES } from '@/lib/data/types';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

export const dynamic = 'force-dynamic';

export default async function ErrorsPage({
  searchParams,
}: {
  searchParams: { schueler?: string; kategorie?: string; status?: string };
}) {
  await requireMember();
  const { lang } = getPrefs();
  const data = await loadSchool();
  const f = searchParams;
  const list = data.errors.filter(
    (e) =>
      (!f.schueler || e.student_id === f.schueler) &&
      (!f.kategorie || e.category === f.kategorie) &&
      (!f.status || e.status === f.status),
  );
  return (
    <>
      <PageHeader page="err" lang={lang} label={pageLabel('err')} />
      <Link
        href={`/fehler/neu${f.schueler ? `?schueler=${f.schueler}` : ''}`}
        className="btn-primary mb-4"
      >
        Fehler erfassen
      </Link>
      <form action="/fehler" className="card mb-4 grid gap-3 sm:grid-cols-4">
        <Field label="Schüler">
          <select name="schueler" defaultValue={f.schueler ?? ''} className="input">
            <option value="">Alle</option>
            {data.students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Kategorie">
          <select name="kategorie" defaultValue={f.kategorie ?? ''} className="input">
            <option value="">Alle</option>
            {ERROR_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Status">
          <select name="status" defaultValue={f.status ?? ''} className="input">
            <option value="">Alle</option>
            {ERROR_STATUSES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button type="submit" className="btn-secondary w-full">
            Filtern
          </button>
        </div>
      </form>
      {!list.length && <p className="card text-muted">Keine Einträge.</p>}
      <ul className="space-y-2">
        {list.map((e) => (
          <li key={e.id} className="card">
            <p className="text-sm text-muted">
              {e.date} · {nameOf(data.students, e.student_id)} · {e.category}
            </p>
            <p className="de-content my-1">
              <span className="line-through decoration-red">{e.error}</span> →{' '}
              <b>{e.correction || '–'}</b>
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <StatusSelect
                action={setErrorStatus}
                id={e.id}
                value={e.status}
                options={ERROR_STATUSES}
                label={`Status: ${e.error}`}
              />
              <Link href={`/fehler/${e.id}`} className="btn-secondary">
                Bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
