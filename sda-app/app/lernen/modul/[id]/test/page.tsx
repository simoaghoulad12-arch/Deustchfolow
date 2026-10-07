import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MiniTestForm } from '@/components/learn/MiniTestForm';
import { NotLinked } from '@/components/learn/NotLinked';
import { loadMe } from '@/lib/data/learnerPage';
import { miniTest, moduleById, unlockedLevels } from '@/lib/learn';

export default async function MiniTestPage({ params }: { params: { id: string } }) {
  const m = moduleById(decodeURIComponent(params.id));
  const questions = m ? miniTest(m.id) : [];
  if (!m || !questions.length) notFound();
  const { bundle, nextLevels } = await loadMe();
  if (!bundle) return <NotLinked />;
  if (![...unlockedLevels(bundle.student.level), ...nextLevels].includes(m.level)) {
    return <p className="card">Dieser Test ist noch nicht freigeschaltet.</p>;
  }
  const earlier = bundle.tests.filter((t) => t.module_id === m.id);
  return (
    <>
      <Link
        href={`/lernen/modul/${m.id}`}
        className="mb-2 inline-flex min-h-11 items-center text-sm text-muted"
      >
        ‹ Modul {m.number}
      </Link>
      <h1 className="de-content mb-1 text-2xl font-bold">Mini-Test: {m.title}</h1>
      <p className="mb-4 text-sm text-muted">
        Bitte allein arbeiten. Nach dem Abgeben siehst du dein Ergebnis und die Lösungen.
      </p>
      <div className="de-content">
        <MiniTestForm
          moduleId={m.id}
          questions={questions.map((q) => ({ id: q.id, frage: q.frage }))}
        />
      </div>
      {earlier.length > 0 && (
        <section className="card mt-6">
          <h2 className="mb-2 font-bold">Frühere Ergebnisse</h2>
          <ul className="text-sm">
            {earlier.map((t) => (
              <li key={t.id}>
                {t.created_at.slice(0, 10)}: {t.score} von {t.max_score}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
