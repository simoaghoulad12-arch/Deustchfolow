import type { ReadoutSection } from '@/content/types';
import { pick, t, type Lang } from '@/lib/i18n';

/** Vorlese-Skript einer Stunde: Abschnitte mit Minuten, Text zum Vorlesen, Darija-Hinweis, Übungen mit Lösung. */
export function Readout({ sections, lang }: { sections: ReadoutSection[]; lang: Lang }) {
  return (
    <div className="space-y-5">
      {sections.map((s, i) => (
        <section key={i} aria-labelledby={`abschnitt-${i}`}>
          <h2
            id={`abschnitt-${i}`}
            className="mb-2 flex flex-wrap items-baseline gap-2 text-lg font-bold"
          >
            <span
              dir="ltr"
              className="rounded bg-anth px-2 py-0.5 text-sm font-semibold text-anth-ink"
            >
              {s.zeit}
            </span>
            {pick(lang, s.titel)}
          </h2>
          <div className="space-y-2">
            {s.blocks.map((b, j) => {
              if (b.type === 'say')
                return (
                  <p
                    key={j}
                    className="de-content rounded-lg border-s-4 border-red bg-panel px-3 py-2 text-[17px] leading-relaxed"
                  >
                    {b.text}
                  </p>
                );
              if (b.type === 'darija')
                return (
                  <p
                    key={j}
                    lang="ar"
                    dir="rtl"
                    className="rounded-lg bg-gold-soft px-3 py-2 text-[16px]"
                  >
                    <b>بالدارجة:</b> {b.text}
                  </p>
                );
              if (b.type === 'exercises')
                return (
                  <ol key={j} className="de-content list-decimal space-y-2 ps-6">
                    {b.items.map((e, k) => (
                      <li key={k}>
                        {e.frage}
                        <details className="mt-1">
                          <summary className="inline-flex min-h-11 cursor-pointer items-center text-sm font-medium text-red">
                            {t(lang, 'solution')}
                          </summary>
                          <p className="rounded bg-ok-soft px-2 py-1">{e.loesung}</p>
                        </details>
                      </li>
                    ))}
                  </ol>
                );
              return (
                <div key={j} className="de-content card">
                  {b.groups.map((g, k) => (
                    <div key={k} className={k ? 'mt-2' : ''}>
                      <p className="font-semibold">{g.title}</p>
                      <ul className="list-disc ps-5">
                        {g.items.map((x, n) => (
                          <li key={n}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
