import Link from 'next/link';
import { setHomeworkStatus } from '@/app/actions/school';
import { StatusSelect } from '@/components/forms/StatusSelect';
import { PageHeader } from '@/components/PageHeader';
import { requireMember } from '@/lib/auth';
import { loadSchool, nameOf } from '@/lib/data/queries';
import { getRepo } from '@/lib/data/repo';
import { HOMEWORK_STATUSES, type HomeworkStatus } from '@/lib/data/types';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

export const dynamic = 'force-dynamic';

export default async function HomeworkPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  await requireMember();
  const { lang } = getPrefs();
  const [data, submissions] = await Promise.all([
    loadSchool(),
    getRepo().list('submissions', { order: { column: 'created_at', ascending: false } }),
  ]);
  const status = HOMEWORK_STATUSES.includes(searchParams.status as HomeworkStatus)
    ? searchParams.status
    : null;
  const list = data.homework
    .filter((h) => !status || h.status === status)
    .sort((a, b) => (a.deadline ?? '9').localeCompare(b.deadline ?? '9'));
  const chip =
    'inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm aria-[current=true]:border-red aria-[current=true]:font-semibold aria-[current=true]:text-red';
  return (
    <>
      <PageHeader page="hw" lang={lang} label={pageLabel('hw')} />
      <Link href="/hausaufgaben/neu" className="btn-primary mb-4">
        Neue Hausaufgabe
      </Link>
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Status">
        <Link href="/hausaufgaben" aria-current={!status} className={chip}>
          Alle
        </Link>
        {HOMEWORK_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/hausaufgaben?status=${s}`}
            aria-current={status === s}
            className={chip}
          >
            {s}
          </Link>
        ))}
      </div>
      {!list.length && <p className="card text-muted">Keine Hausaufgaben.</p>}
      <ul className="space-y-2">
        {list.map((h) => (
          <li key={h.id} className="card">
            <h2 className="de-content font-bold">{h.task}</h2>
            <dl className="mb-2 grid grid-cols-[6rem_1fr] gap-x-3 text-sm">
              <dt className="text-muted">Schüler</dt>
              <dd>{nameOf(data.students, h.student_id)}</dd>
              <dt className="text-muted">Ziel</dt>
              <dd className="de-content">{h.goal || '–'}</dd>
              <dt className="text-muted">Deadline</dt>
              <dd>{h.deadline ?? '–'}</dd>
              <dt className="text-muted">Feedback</dt>
              <dd>{h.feedback || '–'}</dd>
            </dl>
            {submissions
              .filter((x) => x.homework_id === h.id)
              .slice(0, 1)
              .map((x) => (
                <div key={x.id} className="mb-2">
                  <p className="text-sm font-medium">
                    Abgabe in der Lern-App ({x.created_at.slice(0, 10)})
                  </p>
                  <p className="de-content whitespace-pre-wrap rounded bg-bg p-2 text-sm">
                    {x.text}
                  </p>
                </div>
              ))}
            <div className="flex flex-wrap items-center gap-2">
              <StatusSelect
                action={setHomeworkStatus}
                id={h.id}
                value={h.status}
                options={HOMEWORK_STATUSES}
                label={`Status: ${h.task}`}
              />
              <Link href={`/hausaufgaben/${h.id}`} className="btn-secondary">
                Bearbeiten
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
