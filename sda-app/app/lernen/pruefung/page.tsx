import Link from 'next/link';
import { ExamNotice } from '@/components/ExamNotice';
import { NotLinked } from '@/components/learn/NotLinked';
import { ReadinessView } from '@/components/ReadinessView';
import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import { loadMe } from '@/lib/data/learnerPage';
import { getRepo } from '@/lib/data/repo';
import { EXAM_PARTS } from '@/lib/data/types';
import { examLessons, readiness } from '@/lib/examPrep';
import { unlockedLevels } from '@/lib/learn';

/** Prüfungsbereich der Lern-App: Aufbau, Prüfungsstunden, „Bereit für die Prüfung?“, eigene Anmeldungen. */
export default async function LearnExamPage({
  searchParams,
}: {
  searchParams: { level?: string };
}) {
  const { bundle, nextLevels } = await loadMe();
  if (!bundle) return <NotLinked />;
  const { student } = bundle;
  const open = [...new Set([...unlockedLevels(student.level), ...nextLevels])];
  const level: LevelKey = open.includes(searchParams.level as LevelKey)
    ? (searchParams.level as LevelKey)
    : student.level;
  const repo = getRepo();
  const [tests, regs] = await Promise.all([
    repo.list('model_test_results', { eq: { student_id: student.id } }),
    repo.list('exam_registrations', {
      eq: { student_id: student.id },
      order: { column: 'created_at', ascending: false },
    }),
  ]);
  const unitOf = (lessonId: string) => {
    const [lv, wi] = lessonId.split('.');
    return open.includes(lv as LevelKey) ? `/lernen/modul/${lv}.${wi}` : null;
  };
  return (
    <>
      <h1 className="mb-3 text-2xl font-bold">Prüfung</h1>
      <nav
        aria-label="Level"
        className="mb-4 grid grid-cols-4 gap-1 rounded-xl border border-line bg-panel p-1"
      >
        {LEVEL_KEYS.map((k) =>
          open.includes(k) ? (
            <Link
              key={k}
              href={`/lernen/pruefung?level=${k}`}
              aria-current={k === level ? 'page' : undefined}
              className="flex min-h-11 items-center justify-center rounded-lg font-semibold aria-[current=page]:bg-anth aria-[current=page]:text-anth-ink"
            >
              {k}
            </Link>
          ) : (
            <span
              key={k}
              className="flex min-h-11 items-center justify-center rounded-lg text-muted"
              aria-disabled="true"
            >
              {k} 🔒
            </span>
          ),
        )}
      </nav>
      <ExamNotice />

      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-bold">Aufbau der Prüfung {level}</h2>
        <p className="mb-2">Die Prüfung prüft vier Teile:</p>
        <ul className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EXAM_PARTS.map((p) => (
            <li key={p} className="rounded-lg border border-line p-2 text-center font-semibold">
              {p}
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">
          Aufgaben, Zeiten und Punkte unterscheiden sich je nach Anbieter.
        </p>
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-bold">Modelltests und Vorbereitung im Kurs</h2>
        {examLessons(level).length ? (
          <ul className="de-content list-disc ps-5">
            {examLessons(level).map((l) => (
              <li key={l.id}>{l.title}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted">In diesem Level gibt es noch keine eigenen Prüfungsstunden.</p>
        )}
        <p className="mt-2 text-sm text-muted">
          Eigene Modelltests zum Selbstlernen sind noch in Arbeit (Inhalts-Stand).
        </p>
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-bold">Bereit für die Prüfung?</h2>
        <ReadinessView r={readiness(level, tests)} lessonHref={unitOf} />
      </section>

      <section className="card mt-4">
        <h2 className="mb-2 text-lg font-bold">Meine Anmeldungen</h2>
        {!regs.length && (
          <p className="text-muted">Noch keine Anmeldung. Deine Lehrkraft trägt sie ein.</p>
        )}
        <ul className="space-y-2">
          {regs.map((r) => (
            <li
              key={r.id}
              className={`rounded-lg border p-3 ${r.result === 'bestanden' ? 'border-ok' : 'border-line'}`}
            >
              <b>{r.level}</b> · {r.provider || 'Anbieter offen'} · {r.exam_date ?? 'Datum offen'} ·{' '}
              {r.place || 'Ort offen'} ·{' '}
              <span className={r.result === 'bestanden' ? 'font-semibold text-ok' : ''}>
                {r.result}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
