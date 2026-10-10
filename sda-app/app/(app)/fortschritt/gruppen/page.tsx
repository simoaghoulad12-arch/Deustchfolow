import Link from 'next/link';
import { saveGroup } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { GroupFields } from '@/components/school/GroupFields';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';

export const dynamic = 'force-dynamic';

export default async function GroupsPage() {
  const member = await requireMember();
  const data = await loadSchool();
  return (
    <>
      <Link
        href="/fortschritt"
        className="mb-2 inline-flex min-h-11 items-center text-sm text-muted"
      >
        ‹ Student Progress
      </Link>
      <h1 className="mb-4 text-2xl font-bold">Gruppen</h1>
      {!data.groups.length && <p className="card mb-4 text-muted">Noch keine Gruppen.</p>}
      <ul className="mb-6 space-y-2">
        {data.groups.map((g) => (
          <li key={g.id}>
            <Link
              href={`/fortschritt/gruppen/${g.id}`}
              className="card flex min-h-11 items-center justify-between gap-2 hover:border-red"
            >
              <span>
                <b>{g.name}</b> <span className="text-sm text-muted">{g.level}</span>
              </span>
              <span className="text-sm text-muted">
                {data.students.filter((s) => s.group_id === g.id).length} Schüler · Start{' '}
                {g.start_date ?? '–'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {member.role === 'admin' && (
        <>
          <h2 className="mb-2 text-xl font-bold">Neue Gruppe</h2>
          <section className="card">
            <ActionForm action={saveGroup} submitLabel="Gruppe anlegen">
              <GroupFields />
            </ActionForm>
          </section>
        </>
      )}
    </>
  );
}
