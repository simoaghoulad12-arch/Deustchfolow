import { notFound } from 'next/navigation';
import { deleteHomework } from '@/app/actions/school';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { HomeworkForm } from '@/components/school/HomeworkForm';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

export default async function EditHomeworkPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const repo = getRepo();
  const [entry, students] = await Promise.all([
    repo.get('homework', params.id),
    repo.list('students', { order: { column: 'name' } }),
  ]);
  if (!entry) notFound();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Hausaufgabe bearbeiten</h1>
      <section className="card mb-4">
        <HomeworkForm entry={entry} students={students} groups={[]} />
      </section>
      {member.role === 'admin' && (
        <ConfirmDelete
          action={deleteHomework}
          id={entry.id}
          question="Diese Hausaufgabe löschen?"
        />
      )}
    </>
  );
}
