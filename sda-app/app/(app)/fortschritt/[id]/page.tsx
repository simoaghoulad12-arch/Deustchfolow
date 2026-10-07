import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteStudent } from '@/app/actions/school';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { StudentForm } from '@/components/school/StudentForm';
import { StudentSummary } from '@/components/school/StudentSummary';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';

export const dynamic = 'force-dynamic';

export default async function StudentPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const data = await loadSchool();
  const s = data.students.find((x) => x.id === params.id);
  if (!s) notFound();
  return (
    <>
      <Link
        href="/fortschritt"
        className="mb-2 inline-flex min-h-11 items-center text-sm text-muted"
      >
        ‹ Student Progress
      </Link>
      <h1 className="mb-4 flex flex-wrap items-center gap-2 text-2xl font-bold">
        {s.name} <span className="rounded bg-panel px-2 text-base">{s.level}</span>
      </h1>
      <section className="card mb-4">
        <StudentSummary s={s} data={data} />
      </section>
      <h2 className="mb-2 text-xl font-bold">Bearbeiten</h2>
      <section className="card mb-4">
        <StudentForm student={s} groups={data.groups} />
      </section>
      {member.role === 'admin' && (
        <ConfirmDelete
          action={deleteStudent}
          id={s.id}
          question={`${s.name} mit allen Fehlern und Hausaufgaben löschen?`}
          label="Schüler löschen"
        />
      )}
    </>
  );
}
