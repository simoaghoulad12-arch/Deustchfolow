import { HomeworkForm } from '@/components/school/HomeworkForm';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

export default async function NewHomeworkPage({
  searchParams,
}: {
  searchParams: { schueler?: string };
}) {
  await requireMember();
  const repo = getRepo();
  const [students, groups] = await Promise.all([
    repo.list('students', { order: { column: 'name' } }),
    repo.list('groups', { order: { column: 'name' } }),
  ]);
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Neue Hausaufgabe</h1>
      <section className="card">
        <HomeworkForm students={students} groups={groups} student={searchParams.schueler} />
      </section>
    </>
  );
}
