import { StudentForm } from '@/components/school/StudentForm';
import { requireAdmin } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';

export const dynamic = 'force-dynamic';

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: { gruppe?: string };
}) {
  await requireAdmin();
  const groups = await getRepo().list('groups', { order: { column: 'name' } });
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Neuer Schüler</h1>
      <section className="card">
        <StudentForm groups={groups} defaultGroup={searchParams.gruppe} />
      </section>
    </>
  );
}
