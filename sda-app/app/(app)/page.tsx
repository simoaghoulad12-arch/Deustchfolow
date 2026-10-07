import Link from 'next/link';
import { ComingSoon } from '@/components/ComingSoon';
import { PageHeader } from '@/components/PageHeader';
import { content } from '@/content';
import { getPrefs } from '@/lib/prefs';

/** Dashboard: Lernweg und Umfang der übernommenen Inhalte. Kennzahlen aus den Daten folgen in Phase 5. */
export default function DashboardPage() {
  const { lang } = getPrefs();
  const levels = content.curriculum.levels;
  const stats: [string, number][] = [
    ['Module', levels.reduce((n, l) => n + l.modules.length, 0)],
    [
      'Grammatikstunden',
      levels.reduce((n, l) => n + l.modules.reduce((m, x) => m + x.grammar.length, 0), 0),
    ],
    ['Vorlese-Skripte', content.scripts.length],
    ['Sprechdialoge', content.speaking.length],
    ['Aktivitäten', content.activities.length],
    ['WhatsApp-Vorlagen', content.templates.length],
    ['Offene Entscheidungen', content.decisions.length],
  ];
  return (
    <>
      <PageHeader page="dash" lang={lang} />
      <h2 className="mb-3 text-xl font-bold">Lernweg</h2>
      <ol className="de-content mb-6 grid gap-3 sm:grid-cols-2">
        {levels.map((l) => (
          <li key={l.key} className="card">
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-muted">{l.goal}</p>
            <p className="mt-1 text-sm">{l.modules.length} Module</p>
          </li>
        ))}
        <li className="card border-dashed">
          <p className="font-semibold">Deutschland</p>
          <p className="text-sm text-muted">
            <Link href="/deutschland" className="underline">
              Germany Preparation
            </Link>
          </p>
        </li>
      </ol>
      <h2 className="mb-3 text-xl font-bold">Inhalte aus der bestehenden Version</h2>
      <ul className="de-content mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, n]) => (
          <li key={label} className="card">
            <span className="block text-2xl font-bold">{n}</span>
            <span className="text-sm text-muted">{label}</span>
          </li>
        ))}
      </ul>
      <ComingSoon phase={5} lang={lang}>
        Kennzahlen aus Anwesenheit, Hausaufgaben und Fehlern.
      </ComingSoon>
    </>
  );
}
