import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExerciseItem } from '@/components/learn/ExerciseItem';
import { NotLinked } from '@/components/learn/NotLinked';
import { content } from '@/content';
import { loadMe } from '@/lib/data/learnerPage';
import { miniTest, moduleById, moduleExercises, moduleProgress, unlockedLevels } from '@/lib/learn';

/** Modul in der Lern-App: Lernziele, Regeln, Wortschatz, Beispielsätze, Übungen mit Prüfung, Mini-Test. */
export default async function LearnModulePage({ params }: { params: { id: string } }) {
  const m = moduleById(decodeURIComponent(params.id));
  if (!m) notFound();
  const { bundle, nextLevels } = await loadMe();
  if (!bundle) return <NotLinked />;
  const { student, data, formula } = bundle;
  if (![...unlockedLevels(student.level), ...nextLevels].includes(m.level)) {
    return <p className="card">Dieses Modul ist noch nicht freigeschaltet.</p>;
  }
  const exercises = moduleExercises(m.id);
  const test = miniTest(m.id);
  const p = moduleProgress(m.id, data, formula);
  const lessons = [...new Set(exercises.map((e) => e.lessonId))];
  const pct = (v: number | null) => (v === null ? '–' : `${v} %`);

  return (
    <>
      <Link href="/lernen" className="mb-2 inline-flex min-h-11 items-center text-sm text-muted">
        ‹ Mein Weg
      </Link>
      <h1 className="de-content mb-1 text-2xl font-bold">
        {m.level} · Modul {m.number}: {m.title}
      </h1>
      <p className="mb-4 text-sm text-muted">
        Fortschritt {p.percent} % · Anwesenheit {pct(p.attendance)} · Übungen {pct(p.exercises)} ·
        Mini-Test {pct(p.test)}
      </p>

      <section className="card mb-4">
        <h2 className="mb-1 text-lg font-bold">Lernziele</h2>
        <p className="text-sm text-muted">Am Ende dieser Einheit kannst du:</p>
        <ul className="de-content list-disc ps-5">
          {(content.objectives[m.id] ?? []).map((o) => (
            <li key={o}>{o}</li>
          ))}
        </ul>
      </section>

      <section className="card mb-4">
        <h2 className="mb-2 text-lg font-bold">Regeln und Beispielsätze</h2>
        <div className="de-content space-y-4">
          {m.grammar.map((g) => (
            <div key={g.lessonId}>
              <h3 className="font-semibold">{g.title}</h3>
              <ul className="list-disc ps-5">
                {g.kern.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
              {g.beispiele.length > 0 && (
                <ul className="mt-1 space-y-1">
                  {g.beispiele.map((b) => (
                    <li key={b} className="rounded bg-bg px-2 py-1 italic">
                      {b}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card mb-4">
        <h2 className="mb-1 text-lg font-bold">Wortschatz</h2>
        <p className="de-content">
          {[...new Set(m.grammar.map((g) => g.wortschatz).filter(Boolean))].join(', ') || '–'}
        </p>
        <p className="mt-1 text-sm text-muted">
          Wortlisten mit Artikel, Plural und Beispielsatz folgen (Inhalts-Stand: noch in Arbeit).
        </p>
      </section>

      <section className="card mb-4">
        <h2 className="mb-1 text-lg font-bold">Sprechen: {m.speaking.thema}</h2>
        <p className="de-content mb-2">{m.speaking.situation}</p>
        <ul className="de-content list-disc ps-5">
          {m.speaking.redemittel.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>

      <h2 className="mb-2 text-xl font-bold">Übungen</h2>
      {exercises.length ? (
        lessons.map((lessonId) => (
          <section key={lessonId} className="mb-4">
            <h3 className="de-content mb-2 font-semibold">
              {exercises.find((e) => e.lessonId === lessonId)?.lessonTitle}
            </h3>
            <ol className="de-content space-y-2">
              {exercises
                .filter((e) => e.lessonId === lessonId)
                .map((e) => (
                  <ExerciseItem
                    key={e.id}
                    id={e.id}
                    question={e.frage}
                    solved={data.solved.has(e.id)}
                  />
                ))}
            </ol>
          </section>
        ))
      ) : (
        <p className="card mb-4 text-muted">
          Für dieses Modul gibt es noch keine Übungen (Inhalts-Stand: B1 und B2 in Arbeit).
        </p>
      )}

      {test.length > 0 && (
        <section className="card">
          <h2 className="mb-1 text-lg font-bold">Wochen-Mini-Test</h2>
          <p className="mb-3 text-sm text-muted">
            {test.length} Fragen aus den Übungen der Woche.
            {bundle.tests.filter((x) => x.module_id === m.id).length > 0 &&
              ` Bestes Ergebnis: ${pct(p.test)}.`}
          </p>
          <Link href={`/lernen/modul/${m.id}/test`} className="btn-primary">
            Mini-Test starten
          </Link>
        </section>
      )}
    </>
  );
}
