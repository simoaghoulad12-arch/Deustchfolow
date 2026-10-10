import Link from 'next/link';
import { ExamNotice } from '@/components/ExamNotice';
import { PageHeader } from '@/components/PageHeader';
import { LEVEL_KEYS } from '@/content/types';
import { requireMember } from '@/lib/auth';
import { nameOf } from '@/lib/data/queries';
import { getRepo } from '@/lib/data/repo';
import { examLessons } from '@/lib/examPrep';
import { getPrefs } from '@/lib/prefs';

export const dynamic = 'force-dynamic';

/** Prüfungen: Übersicht (Schüler pro Level, bestandene Prüfungen) und alle Anmeldungen. */
export default async function ExamsPage() {
  await requireMember();
  const { lang } = getPrefs();
  const repo = getRepo();
  const [students, regs] = await Promise.all([
    repo.list('students', { order: { column: 'name' } }),
    repo.list('exam_registrations', { order: { column: 'created_at', ascending: false } }),
  ]);
  return (
    <>
      <PageHeader page="exam" lang={lang} label="IMPROVEMENT" />
      <ExamNotice />
      <div className="mt-4 overflow-x-auto">
        <table className="card w-full text-sm">
          <caption className="sr-only">Schüler pro Level und Prüfungen</caption>
          <thead>
            <tr>
              <th className="py-2 text-start">Level</th>
              <th className="py-2 text-end">Schüler</th>
              <th className="py-2 text-end">Anmeldungen</th>
              <th className="py-2 text-end">bestanden</th>
              <th className="py-2 text-end">nicht bestanden</th>
            </tr>
          </thead>
          <tbody>
            {LEVEL_KEYS.map((k) => {
              const r = regs.filter((x) => x.level === k);
              return (
                <tr key={k} className="border-t border-line">
                  <th scope="row" className="py-2 text-start">
                    {k}
                  </th>
                  <td className="py-2 text-end">{students.filter((s) => s.level === k).length}</td>
                  <td className="py-2 text-end">{r.length}</td>
                  <td className="py-2 text-end font-semibold text-ok">
                    {r.filter((x) => x.result === 'bestanden').length}
                  </td>
                  <td className="py-2 text-end">
                    {r.filter((x) => x.result === 'nicht bestanden').length}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 mt-6 text-xl font-bold">Anmeldungen</h2>
      {!regs.length && (
        <p className="card text-muted">
          Noch keine Anmeldungen. Erfassen auf der Seite des Schülers (Student Progress).
        </p>
      )}
      <ul className="space-y-2">
        {regs.map((r) => (
          <li key={r.id}>
            <Link
              href={`/fortschritt/${r.student_id}#pruefungen`}
              className="card flex flex-wrap items-center justify-between gap-2 hover:border-red"
            >
              <span>
                <b>{nameOf(students, r.student_id)}</b> · {r.level} ·{' '}
                {r.provider || 'Anbieter offen'}
              </span>
              <span
                className={`text-sm ${r.result === 'bestanden' ? 'font-semibold text-ok' : 'text-muted'}`}
              >
                {r.exam_date ?? 'Datum offen'} · {r.result}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 mt-6 text-xl font-bold">Stunden zur Prüfungsvorbereitung im Kurs</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {LEVEL_KEYS.map((k) => (
          <section key={k} className="card">
            <h3 className="font-bold">{k}</h3>
            <ul className="de-content list-disc ps-5 text-sm">
              {examLessons(k).map((l) => (
                <li key={l.id}>
                  <Link href={`/stunde/${l.id}`} className="underline-offset-2 hover:underline">
                    {l.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
