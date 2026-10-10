import Link from 'next/link';
import { Label } from '@/components/Label';
import { NotLinked } from '@/components/learn/NotLinked';
import { content } from '@/content';
import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import { loadMe } from '@/lib/data/learnerPage';
import { SKILLS } from '@/lib/data/types';
import { t } from '@/lib/i18n';
import { levelProgress, totalProgress, unlockedLevels } from '@/lib/learn';
import { getPrefs } from '@/lib/prefs';

function Bar({ value, label }: { value: number; label: string }) {
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className="h-2 overflow-hidden rounded-full bg-line"
    >
      <div
        className={`h-full rounded-full ${value === 100 ? 'bg-ok' : 'bg-red'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

/** „Mein Weg“: A1 → A2 → B1 → B2 → Prüfung bestanden, mit Prozent pro Level, Modul und gesamt. */
export default async function MyPathPage() {
  const { lang } = getPrefs();
  const { bundle, nextLevels } = await loadMe();
  if (!bundle) return <NotLinked />;
  const { student, data, formula } = bundle;
  const unlocked = new Set<string>([...unlockedLevels(student.level), ...nextLevels]);
  const total = totalProgress(data, formula);
  const current = levelProgress(student.level, data, formula);
  const level = content.curriculum.levels.find((l) => l.key === student.level)!;
  const openHw = bundle.homework.filter((h) => h.status === 'Offen').length;
  const openErr = bundle.errors.filter((e) => e.status !== 'verbessert').length;

  return (
    <>
      <h1 className="mb-1 text-2xl font-bold">{t(lang, 'myPath')}</h1>
      <p className="mb-4 flex flex-wrap items-center gap-2 text-sm text-muted">
        Fortschritt aus Anwesenheit, Übungen und Mini-Tests <Label kind="PROPOSAL" lang={lang} />
      </p>

      <section className="card mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-bold">{t(lang, 'total')}</h2>
          <span className="text-2xl font-bold">{total} %</span>
        </div>
        <Bar value={total} label={t(lang, 'total')} />
        <ol className="mt-4 grid gap-2 sm:grid-cols-5">
          {LEVEL_KEYS.map((k: LevelKey) => {
            const p = levelProgress(k, data, formula).percent;
            const open = unlocked.has(k);
            return (
              <li
                key={k}
                className={`rounded-lg border p-3 ${k === student.level ? 'border-red' : 'border-line'} ${open ? '' : 'border-dashed bg-bg'}`}
              >
                <b>{k}</b> <span className="text-sm">{p} %</span>
                <Bar value={p} label={`Fortschritt ${k}`} />
                {!open && (
                  <span className="mt-1 block text-xs text-muted">
                    <span aria-hidden="true">🔒 </span>
                    {t(lang, 'locked')}
                  </span>
                )}
              </li>
            );
          })}
          <li className="rounded-lg border border-dashed border-line p-3">
            <b>{t(lang, 'examPassed')}</b>
          </li>
        </ol>
      </section>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Link href="/lernen/hausaufgaben" className="card hover:border-red">
          <span className="block text-2xl font-bold">{openHw}</span>
          <span className="text-sm text-muted">offene Hausaufgaben</span>
        </Link>
        <Link href="/lernen/fehler" className="card hover:border-red">
          <span className="block text-2xl font-bold">{openErr}</span>
          <span className="text-sm text-muted">Fehler zum Wiederholen</span>
        </Link>
      </div>

      <section className="card mb-4">
        <h2 className="mb-1 text-lg font-bold">{level.name}</h2>
        <p className="de-content mb-3 text-sm text-muted">{level.goal}</p>
        <ul className="divide-y divide-line">
          {level.modules.map((m) => {
            const mp = current.modules.find((x) => x.moduleId === m.id)!;
            return (
              <li key={m.id}>
                <Link
                  href={`/lernen/modul/${m.id}`}
                  className="flex min-h-11 items-center gap-3 py-2 hover:text-red"
                >
                  <span className="w-16 shrink-0 text-sm text-muted">Modul {m.number}</span>
                  <span className="de-content min-w-0 flex-1">{m.title}</span>
                  <span className={`shrink-0 text-sm font-semibold ${mp.passed ? 'text-ok' : ''}`}>
                    {mp.percent} %{mp.passed ? ' ✓' : ''}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="card">
        <h2 className="mb-1 text-lg font-bold">Meine Fertigkeiten</h2>
        <p className="mb-3 text-sm text-muted">Einschätzung deiner Lehrkraft (1 bis 5)</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {SKILLS.map((k) => {
            const v = student[k.key] ?? 0;
            return (
              <li key={k.key}>
                <span className="flex justify-between text-sm">
                  <span>{k.label}</span>
                  <span className="text-muted">{v ? `${v}/5` : '–'}</span>
                </span>
                <Bar value={(v / 5) * 100} label={k.label} />
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
