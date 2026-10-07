import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { findLesson } from '@/content';
import { requireMember } from '@/lib/auth';
import { loadSchool, nameOf, profileName } from '@/lib/data/queries';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

export const dynamic = 'force-dynamic';

export default async function DocsPage({ searchParams }: { searchParams: { gruppe?: string } }) {
  await requireMember();
  const { lang } = getPrefs();
  const data = await loadSchool();
  const group = data.groups.find((g) => g.id === searchParams.gruppe);
  const list = data.docs.filter((d) => !group || d.group_id === group.id);
  const chip =
    'inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm aria-[current=true]:border-red aria-[current=true]:font-semibold aria-[current=true]:text-red';
  const names = (ids: string[]) => ids.map((id) => nameOf(data.students, id)).join(', ') || '–';
  return (
    <>
      <PageHeader
        page="doc"
        lang={lang}
        label={pageLabel('doc')}
        intro="Kurz nach jeder Stunde ausfüllen. Felder sind aus dem Skript vorausgefüllt."
      />
      <Link href="/dokumentation/neu" className="btn-primary mb-4">
        Neue Dokumentation
      </Link>
      {data.groups.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Gruppe">
          <Link href="/dokumentation" aria-current={!group} className={chip}>
            Alle
          </Link>
          {data.groups.map((g) => (
            <Link
              key={g.id}
              href={`/dokumentation?gruppe=${g.id}`}
              aria-current={group?.id === g.id}
              className={chip}
            >
              {g.name}
            </Link>
          ))}
        </div>
      )}
      {!list.length && <p className="card text-muted">Noch keine Dokumentation.</p>}
      <ul className="space-y-3">
        {list.map((d) => (
          <li key={d.id} className="card">
            <h2 className="de-content mb-2 font-bold">
              {d.date} · {findLesson(d.lesson_id)?.title ?? d.lesson_id}{' '}
              <span className="text-sm font-normal text-muted">
                {nameOf(data.groups, d.group_id)}
              </span>
            </h2>
            <dl className="grid grid-cols-[9rem_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted">Lehrkraft</dt>
              <dd>{profileName(data.profiles, d.teacher_id)}</dd>
              <dt className="text-muted">Anwesend</dt>
              <dd>{names(d.present)}</dd>
              <dt className="text-muted">Abwesend</dt>
              <dd>{names(d.absent)}</dd>
              <dt className="text-muted">Heute behandelt</dt>
              <dd className="de-content">{d.covered || '–'}</dd>
              <dt className="text-muted">Schüler kann jetzt</dt>
              <dd className="de-content">{d.can_do || '–'}</dd>
              <dt className="text-muted">Fehler</dt>
              <dd className="de-content">{d.errors || '–'}</dd>
              <dt className="text-muted">Hausaufgabe</dt>
              <dd className="de-content">{d.homework || '–'}</dd>
              <dt className="text-muted">Nächste Stunde</dt>
              <dd className="de-content">{d.next_lesson || '–'}</dd>
              <dt className="text-muted">Material</dt>
              <dd>{d.material || '–'}</dd>
              <dt className="text-muted">Probleme</dt>
              <dd>{d.problems || '–'}</dd>
            </dl>
            <Link href={`/dokumentation/${d.id}`} className="btn-secondary mt-3">
              Bearbeiten
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
