import curriculum from '@/content/curriculum.json';
import decisions from '@/content/decisions.json';
import scripts from '@/content/scripts.json';
import speaking from '@/content/speaking.json';
import activities from '@/content/activities.json';
import templates from '@/content/templates.json';
import type { Curriculum } from '@/content/types';

// Startseite für Phase 1: zeigt, dass alle Inhalte aus legacy/index.html übernommen sind.
// Navigation, Login und die eigentlichen Seiten folgen ab Phase 2/3 (docs/PROMPTS.md).
export default function Home() {
  const levels = (curriculum as Curriculum).levels;
  const stats: [string, number][] = [
    ['Module', levels.reduce((n, l) => n + l.modules.length, 0)],
    [
      'Grammatikstunden',
      levels.reduce((n, l) => n + l.modules.reduce((m, x) => m + x.grammar.length, 0), 0),
    ],
    ['Vorlese-Skripte', scripts.length],
    ['Sprechdialoge', speaking.length],
    ['Aktivitäten', activities.length],
    ['WhatsApp-Vorlagen', templates.length],
    ['Offene Entscheidungen', decisions.length],
  ];
  return (
    <main className="mx-auto max-w-3xl px-4 pb-12">
      <header className="-mx-4 mb-6 border-b-[3px] border-red bg-anth px-4 py-4 text-white">
        <p className="text-lg font-bold tracking-wide">SMART DEUTSCH AKADEMIE</p>
        <p className="text-sm opacity-70">Academy App · im Aufbau</p>
      </header>
      <h1 className="mb-2 text-2xl font-bold">Inhalte übernommen</h1>
      <p className="mb-4 text-muted">
        Alle Inhalte aus der bestehenden Version (V2) sind als Daten in content/ verfügbar.
      </p>
      <ul className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {stats.map(([label, n]) => (
          <li key={label} className="rounded-xl border border-line bg-panel p-3">
            <span className="block text-2xl font-bold">{n}</span>
            <span className="text-sm text-muted">{label}</span>
          </li>
        ))}
      </ul>
      <h2 className="mb-3 text-xl font-bold">Lernweg</h2>
      <ol className="space-y-3">
        {levels.map((l) => (
          <li key={l.key} className="rounded-xl border border-line bg-panel p-4">
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-muted">{l.goal}</p>
            <p className="mt-1 text-sm">{l.modules.length} Module</p>
          </li>
        ))}
      </ol>
    </main>
  );
}
