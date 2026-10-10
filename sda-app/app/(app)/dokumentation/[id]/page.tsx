import { notFound } from 'next/navigation';
import { deleteDoc } from '@/app/actions/school';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { DocForm } from '@/components/school/DocForm';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { docPrefill, todayISO } from '@/lib/school';

export const dynamic = 'force-dynamic';

export default async function EditDocPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const repo = getRepo();
  const doc = await repo.get('lesson_docs', params.id);
  if (!doc) notFound();
  const [group, students] = await Promise.all([
    repo.get('groups', doc.group_id),
    repo.list('students', { eq: { group_id: doc.group_id }, order: { column: 'name' } }),
  ]);
  if (!group) notFound();
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Dokumentation bearbeiten</h1>
      <section className="card mb-4">
        <DocForm
          doc={doc}
          group={group}
          lessonId={doc.lesson_id}
          students={students}
          prefill={docPrefill(doc.lesson_id)}
          today={todayISO()}
        />
      </section>
      {member.role === 'admin' && (
        <ConfirmDelete action={deleteDoc} id={doc.id} question="Diese Dokumentation löschen?" />
      )}
    </>
  );
}
