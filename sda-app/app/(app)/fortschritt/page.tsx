import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { StudentSummary } from '@/components/school/StudentSummary';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

export const dynamic = 'force-dynamic';

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: { gruppe?: string };
}) {
  const member = await requireMember();
  const { lang } = getPrefs();
  const data = await loadSchool();
  const group = data.groups.find((g) => g.id === searchParams.gruppe);
  const list = data.students.filter((s) => !group || s.group_id === group.id);
  const chip =
    'inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm aria-[current=true]:border-red aria-[current=true]:font-semibold aria-[current=true]:text-red';
  return (
    <>
      <PageHeader page="prog" lang={lang} label={pageLabel('prog')} />
      <div className="mb-4 flex flex-wrap gap-2">
        {member.role === 'admin' && (
          <Link
            href={`/fortschritt/neu${group ? `?gruppe=${group.id}` : ''}`}
            className="btn-primary"
          >
            Neuer Schüler
          </Link>
        )}
        <Link href="/fortschritt/gruppen" className="btn-secondary">
          Gruppen
        </Link>
      </div>
      {data.groups.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Gruppe">
          <Link href="/fortschritt" aria-current={!group} className={chip}>
            Alle
          </Link>
          {data.groups.map((g) => (
            <Link
              key={g.id}
              href={`/fortschritt?gruppe=${g.id}`}
              aria-current={group?.id === g.id}
              className={chip}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
      {!list.length && <p className="card text-muted">Noch keine Schüler erfasst.</p>}
      <ul className="space-y-3">
        {list.map((s) => (
          <li key={s.id} className="card">
            <h2 className="mb-2 flex flex-wrap items-center gap-2 text-lg font-bold">
              <Link href={`/fortschritt/${s.id}`} className="hover:underline">
                {s.name}
              </Link>
              <span className="rounded bg-bg px-2 text-sm font-semibold">{s.level}</span>
            </h2>
            <StudentSummary s={s} data={data} compact />
            <div className="mt-3 flex flex-wrap gap-2">
              <Link href={`/fortschritt/${s.id}`} className="btn-secondary">
                Bearbeiten
              </Link>
              <Link href={`/fehler/neu?schueler=${s.id}`} className="btn-secondary">
                Fehler erfassen
              </Link>
              <Link href={`/hausaufgaben/neu?schueler=${s.id}`} className="btn-secondary">
                Hausaufgabe
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
