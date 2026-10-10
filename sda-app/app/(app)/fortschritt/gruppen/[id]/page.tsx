import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteGroup, saveGroup, saveGroupStaff } from '@/app/actions/school';
import { ActionForm } from '@/components/forms/ActionForm';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { GroupFields } from '@/components/school/GroupFields';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { loadSchool } from '@/lib/data/queries';
import { ROLE_LABELS } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export default async function GroupPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const data = await loadSchool();
  const g = data.groups.find((x) => x.id === params.id);
  if (!g) notFound();
  const staff = new Set(
    (await getRepo().list('group_staff', { eq: { group_id: g.id } })).map((r) => r.profile_id),
  );
  const isAdmin = member.role === 'admin';
  const students = data.students.filter((s) => s.group_id === g.id);
  return (
    <>
      <Link
        href="/fortschritt/gruppen"
        className="mb-2 inline-flex min-h-11 items-center text-sm text-muted"
      >
        ‹ Gruppen
      </Link>
      <h1 className="mb-4 text-2xl font-bold">
        {g.name} <span className="text-base text-muted">{g.level}</span>
      </h1>
      <section className="card mb-4">
        <h2 className="mb-2 font-bold">Schüler ({students.length})</h2>
        <p>{students.map((s) => s.name).join(', ') || '–'}</p>
        {isAdmin && (
          <Link href={`/fortschritt/neu?gruppe=${g.id}`} className="btn-secondary mt-3">
            Schüler hinzufügen
          </Link>
        )}
      </section>
      {isAdmin ? (
        <>
          <section className="card mb-4">
            <h2 className="mb-3 font-bold">Gruppe bearbeiten</h2>
            <ActionForm action={saveGroup}>
              <GroupFields group={g} />
            </ActionForm>
          </section>
          <section className="card mb-4">
            <h2 className="mb-1 font-bold">Team der Gruppe</h2>
            <p className="mb-3 text-sm text-muted">
              Bei der Einstellung „nur eigene Gruppen“ sehen nur diese Personen die Schüler der
              Gruppe.
            </p>
            <form action={saveGroupStaff} className="space-y-2">
              <input type="hidden" name="id" value={g.id} />
              {data.profiles
                .filter((p) => p.role !== 'admin')
                .map((p) => (
                  <label key={p.id} className="flex min-h-11 items-center gap-3">
                    <input
                      type="checkbox"
                      name="staff"
                      value={p.id}
                      defaultChecked={staff.has(p.id)}
                      className="h-5 w-5"
                    />
                    {p.full_name || p.email}{' '}
                    <span className="text-sm text-muted">{ROLE_LABELS[p.role]}</span>
                  </label>
                ))}
              {!data.profiles.some((p) => p.role !== 'admin') && (
                <p className="text-muted">Noch keine Lehrkräfte eingeladen.</p>
              )}
              <button type="submit" className="btn-secondary">
                Team speichern
              </button>
            </form>
          </section>
          <ConfirmDelete
            action={deleteGroup}
            id={g.id}
            question={`Gruppe ${g.name} löschen? Die Schüler bleiben ohne Gruppe erhalten, Dokumentationen der Gruppe werden gelöscht.`}
            label="Gruppe löschen"
          />
        </>
      ) : (
        <p className="card text-sm text-muted">
          Start {g.start_date ?? '–'}. Gruppen verwaltet die Leitung.
        </p>
      )}
    </>
  );
}
