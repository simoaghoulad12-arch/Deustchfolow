import Link from 'next/link';
import { CopyButton } from '@/components/CopyButton';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { content } from '@/content';
import { LEVEL_KEYS, type LevelKey } from '@/content/types';
import { getPrefs } from '@/lib/prefs';
import { pageLabel, statementsOf } from '@/lib/statements';

/** legacy: inRange – gilt eine Aktivität („A1–B2“, „A2“) für dieses Level? */
function inRange(range: string, level: LevelKey): boolean {
  const [a, b] = range.split('–');
  const i = LEVEL_KEYS.indexOf(level);
  const from = LEVEL_KEYS.indexOf(a as LevelKey);
  const to = b ? LEVEL_KEYS.indexOf(b as LevelKey) : from;
  return from >= 0 && i >= from && i <= to;
}

/** Betrieb & Plattformen (legacy: pageOps und Online-Profi-Leitfaden). */
export default function OperationsPage({ searchParams }: { searchParams: { niveau?: string } }) {
  const { lang } = getPrefs();
  const level = LEVEL_KEYS.includes(searchParams.niveau as LevelKey)
    ? (searchParams.niveau as LevelKey)
    : null;
  const activities = content.activities.filter((a) => !level || inRange(a.niveau, level));
  const flows = [
    content.checklists.einrichtung,
    content.checklists.generalprobe,
    content.checklists.probestunde,
  ];
  const sheets = statementsOf('ops').filter((s) => s.text !== s.section);
  const chip =
    'inline-flex min-h-11 items-center rounded-full border border-line bg-panel px-3 text-sm aria-[current=true]:border-red aria-[current=true]:font-semibold aria-[current=true]:text-red';
  const summary = 'flex min-h-11 cursor-pointer items-center text-lg font-bold';
  return (
    <>
      <PageHeader page="ops" lang={lang} label={pageLabel('ops')} />
      <section className="card mb-4">
        <h2 className="mb-2 text-lg font-bold">Abläufe</h2>
        <ol className="divide-y divide-line">
          {flows.map((f, i) => (
            <li key={f.id}>
              <Link
                href={`/stunde/${f.id}`}
                className="flex min-h-11 items-center gap-3 py-2 hover:text-red"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-anth text-sm text-anth-ink">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{f.title}</span>
                <span className="text-sm text-muted">{f.dauer}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <div className="space-y-4">
        <details id="leitfaden" className="card" open>
          <summary className={summary}>1. Welche Plattform wofür</summary>
          <div className="de-content mt-2 space-y-3">
            {content.platforms.map((p) => (
              <div key={p.zweck}>
                <h3 className="font-semibold">
                  {p.zweck}: <span className="text-gold">{p.empfehlung}</span>
                </h3>
                <p>{p.warum}</p>
                {lang === 'ar' && (
                  <p lang="ar" dir="rtl" className="text-muted">
                    {p.ar}
                  </p>
                )}
                <p className="text-sm text-muted">
                  <b>Alternative:</b> {p.alternative}
                </p>
                <p className="text-sm text-muted">
                  <b>Hinweis:</b> {p.hinweis}
                </p>
              </div>
            ))}
            <p className="text-sm text-muted">
              Limits und Preise ändern sich. Vor dem Kauf immer auf der Seite des Anbieters prüfen.
            </p>
          </div>
        </details>

        <details className="card">
          <summary className={summary}>2. Standards wie ein Profi</summary>
          <div className="de-content mt-2 space-y-3">
            {content.standards.map((s) => (
              <div key={s.titel}>
                <h3 className="font-semibold">{lang === 'ar' ? s.ar : s.titel}</h3>
                <ul className="list-disc ps-5">
                  {s.punkte.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details>

        <details id="aktivitaeten" className="card" open={!!level}>
          <summary className={summary}>
            3. Kreative Aktivitäten ({content.activities.length})
          </summary>
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Niveau">
            <Link href="/betrieb#aktivitaeten" aria-current={!level} className={chip}>
              Alle
            </Link>
            {LEVEL_KEYS.map((k) => (
              <Link
                key={k}
                href={`/betrieb?niveau=${k}#aktivitaeten`}
                aria-current={level === k}
                className={chip}
              >
                {k}
              </Link>
            ))}
          </div>
          <div className="de-content mt-3 space-y-4">
            {activities.map((a) => (
              <div key={a.name}>
                <h3 className="font-semibold">{a.name}</h3>
                <p className="text-sm text-muted">
                  {a.niveau} · {a.dauer} · {a.tool}
                </p>
                <ol className="list-decimal ps-5">
                  {a.ablauf.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ol>
                <p>
                  <b>Ziel:</b> {a.ziel}
                </p>
                {lang === 'ar' && (
                  <p lang="ar" dir="rtl" className="text-muted">
                    {a.ar}
                  </p>
                )}
              </div>
            ))}
          </div>
        </details>

        <details className="card">
          <summary className={summary}>4. Wochenroutine des Teams</summary>
          <dl className="de-content mt-2 grid gap-x-3 gap-y-2 sm:grid-cols-[9rem_1fr]">
            {content.weeklyRoutine.map((r) => (
              <div key={r.tag} className="contents">
                <dt className="font-semibold">{r.tag}</dt>
                <dd>{r.aufgabe}</dd>
              </div>
            ))}
          </dl>
        </details>

        <details id="vorlagen" className="card">
          <summary className={summary}>WhatsApp-Vorlagen</summary>
          <p className="mt-2 text-sm text-muted">
            Platzhalter in [eckigen Klammern] vor dem Senden ersetzen.
          </p>
          <div className="mt-2 space-y-4">
            {content.templates.map((t) => (
              <div key={t.titel}>
                <h3 className="font-semibold">{t.titel}</h3>
                <p lang="ar" dir="rtl" className="my-2 whitespace-pre-wrap rounded-lg bg-bg p-3">
                  {t.text}
                </p>
                <CopyButton text={t.text} />
              </div>
            ))}
          </div>
        </details>

        <details className="card">
          <summary className={summary}>Notfallplan</summary>
          <dl className="mt-2 grid gap-x-3 gap-y-2 sm:grid-cols-[14rem_1fr]">
            {content.emergency.map((f) => (
              <div key={f.fall} className="contents">
                <dt className="font-semibold">{f.fall}</dt>
                <dd>{f.massnahme}</dd>
              </div>
            ))}
          </dl>
        </details>

        <details className="card">
          <summary className={summary}>Zeitunterschied Marokko und Deutschland</summary>
          <p className="mt-2">
            Der Unterschied ändert sich im Jahr (Sommer-/Winterzeit in Deutschland, Ramadan in
            Marokko). Bei jeder Einladung beide Uhrzeiten schreiben.
          </p>
        </details>

        <details className="card">
          <summary className={summary}>Dokumentation in Google Sheets (bisheriger Plan)</summary>
          <ul className="mt-2 space-y-2">
            {sheets.map((s, i) => (
              <li key={i} className="flex flex-wrap items-baseline gap-2">
                <Label kind={s.label} lang={lang} />
                <span className="min-w-0 flex-1">{s.text}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </>
  );
}
