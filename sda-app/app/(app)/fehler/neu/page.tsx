import { ErrorForm } from '@/components/school/ErrorForm';
import { requireMember } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { todayISO } from '@/lib/school';

export const dynamic = 'force-dynamic';

export default async function NewErrorPage({
  searchParams,
}: {
  searchParams: { schueler?: string };
}) {
  await requireMember();
  const students = await getRepo().list('students', { order: { column: 'name' } });
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Fehler erfassen</h1>
      <section className="card">
        <ErrorForm students={students} student={searchParams.schueler} today={todayISO()} />
      </section>
    </>
  );
}
