import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { ProgressBar } from '@/components/ProgressBar';
import { content } from '@/content';
import { requireMember } from '@/lib/auth';
import { loadSchool } from '@/lib/data/queries';
import { getStore } from '@/lib/data/store';
import { getPrefs } from '@/lib/prefs';
import { lessonProgress, sumProgress } from '@/lib/progress';
import { daysBetween, homeworkStats, openErrors, todayISO } from '@/lib/school';
import { getDayRoles, getPerson } from '@/lib/team';

export const dynamic = 'force-dynamic';

/** Dashboard (legacy: pageDash): Lernweg A1 → B2 → Deutschland und Kennzahlen aus den Daten. */
export default async function DashboardPage() {
  const member = await requireMember();
  const { lang } = getPrefs();
  const person = getPerson();
  const [data, roles, done] = await Promise.all([
    loadSchool(),
    getDayRoles(),
    getStore().doneItems(member.id),
  ]);
  const hw = homeworkStats(data.homework);
  const today = todayISO();
  const last7 = data.docs.filter((d) => {
    const n = daysBetween(d.date, today);
    return n >= 0 && n <= 7;
  }).length;

  const tiles: { href: string; title: string; value?: number; hint: string }[] = [
    {
      href: '/playbook',
      title: 'Teacher Playbook',
      hint: 'Vorbereiten, unterrichten, nachbereiten',
    },
    { href: '/curriculum', title: 'Curriculum', hint: 'A1 bis B2 mit Lernzielen' },
    {
      href: '/fortschritt',
      title: 'Student Progress',
      value: data.students.length,
      hint: 'Schüler im System',
    },
    {
      href: '/dokumentation',
      title: 'Dokumentation',
      value: data.docs.length,
      hint: `Einträge, ${last7} in den letzten 7 Tagen`,
    },
    {
      href: '/hausaufgaben',
      title: 'Hausaufgaben',
      value: hw.Offen + hw.Abgegeben,
      hint: 'nicht korrigiert',
    },
    {
      href: '/fehler',
      title: 'Error Tracking',
      value: openErrors(data.errors).length,
      hint: 'offene Fehler',
    },
    { href: '/deutschland', title: 'Germany Preparation', hint: 'Alltag, Behörden, Bewerbung' },
    {
      href: '/entscheidungen',
      title: 'Offene Entscheidungen',
      value: content.decisions.length,
      hint: 'aus der bestehenden Version',
    },
  ];

  return (
    <>
      <PageHeader page="dash" lang={lang} intro="Lehren → Dokumentieren → Messen → Verbessern" />
      <section className="card mb-4">
        <h2 className="mb-3 text-xl font-bold">Lernweg</h2>
        <ol className="grid gap-3 sm:grid-cols-5">
          {content.curriculum.levels.map((l) => (
            <li key={l.key}>
              <Link
                href={`/curriculum?level=${l.key}`}
                className="block rounded-lg border border-line p-3 hover:border-red"
              >
                <b className="text-lg">{l.key}</b>{' '}
                <span className="text-sm text-muted">{l.modules.length} Module</span>
                <ProgressBar
                  progress={sumProgress(
                    content.lessonsByLevel[l.key].map((x) =>
                      lessonProgress(x, person, roles, done),
                    ),
                  )}
                  label={`Fortschritt ${l.key}`}
                />
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/deutschland"
              className="block h-full rounded-lg border border-red bg-red-soft p-3"
            >
              <b className="text-lg">Deutschland</b>
              <span className="block text-sm text-muted">Alltag, Beruf, Bewerbung</span>
            </Link>
          </li>
        </ol>
        <p className="mt-2 text-sm text-muted">Balken = abgehakte Aufgaben deiner Rolle.</p>
      </section>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <li key={t.href}>
            <Link href={t.href} className="card block h-full hover:border-red">
              <b className="block">{t.title}</b>
              {t.value !== undefined && <span className="block text-2xl font-bold">{t.value}</span>}
              <span className="text-sm text-muted">{t.hint}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
