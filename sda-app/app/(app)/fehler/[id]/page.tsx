import { notFound } from 'next/navigation';
import { deleteError } from '@/app/actions/school';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { ErrorForm } from '@/components/school/ErrorForm';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { todayISO } from '@/lib/school';

export const dynamic = 'force-dynamic';

export default async function EditErrorPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const repo = getRepo();
  const [entry, students] = await Promise.all([
    repo.get('errors', params.id),
    repo.list('students', { order: { column: 'name' } }),
  ]);
  if (!entry) notFound();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Fehler bearbeiten</h1>
      <section className="card mb-4">
        <ErrorForm entry={entry} students={students} today={todayISO()} />
      </section>
      {member.role === 'admin' && (
        <ConfirmDelete action={deleteError} id={entry.id} question="Diesen Fehler löschen?" />
      )}
    </>
  );
}
