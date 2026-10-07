import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteStudent } from '@/app/actions/school';
import { ConfirmDelete } from '@/components/forms/ConfirmDelete';
import { StudentForm } from '@/components/school/StudentForm';
import { StudentExams } from '@/components/school/StudentExams';
import { StudentLearning } from '@/components/school/StudentLearning';
import { todayISO } from '@/lib/school';
import { StudentSummary } from '@/components/school/StudentSummary';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';
import { getRepo } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

export default async function StudentPage({ params }: { params: { id: string } }) {
  const member = await requireMember();
  const data = await loadSchool();
  const s = data.students.find((x) => x.id === params.id);
  if (!s) notFound();
  const repo = getRepo();
  const eq = { eq: { student_id: s.id } };
  const [tests, attempts, submissions, modelTests, regs] = await Promise.all([
    repo.list('test_results', { ...eq, order: { column: 'created_at', ascending: false } }),
    repo.list('exercise_attempts', eq),
    repo.list('submissions', eq),
    repo.list('model_test_results', eq),
    repo.list('exam_registrations', { ...eq, order: { column: 'created_at', ascending: false } }),
  ]);
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
      <StudentLearning student={s} tests={tests} attempts={attempts} submissions={submissions} />
      <StudentExams
        s={s}
        tests={modelTests}
        regs={regs}
        isAdmin={member.role === 'admin'}
        today={todayISO()}
      />
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
