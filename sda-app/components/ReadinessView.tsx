import Link from 'next/link';
import type { Readiness } from '@/lib/examPrep';

/** „Bereit für die Prüfung?“ – letzte Modelltest-Ergebnisse, schwächster Teil, Empfehlung zum Wiederholen. */
export function ReadinessView({
  r,
  lessonHref,
}: {
  r: Readiness;
  lessonHref: (id: string) => string | null;
}) {
  if (!r.lastDate)
    return <p className="text-muted">Noch keine Modelltest-Ergebnisse eingetragen.</p>;
  return (
    <div>
      <p className="mb-2 text-sm text-muted">Letzter Modelltest: {r.lastDate}</p>
      <ul
        className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
        aria-label="Ergebnis pro Prüfungsteil"
      >
        {r.parts.map((p) => (
          <li
            key={p.part}
            className={`rounded-lg border p-2 ${p.part === r.weakest ? 'border-red' : 'border-line'}`}
          >
            <span className="block text-sm">{p.part}</span>
            <span className="text-xl font-bold">{p.percent === null ? '–' : `${p.percent} %`}</span>
          </li>
        ))}
      </ul>
      {r.weakest && (
        <>
          <p className="font-semibold">Schwächster Teil: {r.weakest}</p>
          {r.repeat.length ? (
            <>
              <p className="text-sm">Empfehlung: diese Stunden wiederholen</p>
              <ul className="de-content list-disc ps-5 text-sm">
                {r.repeat.slice(0, 8).map((l) => {
                  const href = lessonHref(l.id);
                  return (
                    <li key={l.id}>
                      {href ? (
                        <Link href={href} className="underline">
                          {l.title}
                        </Link>
                      ) : (
                        l.title
                      )}
                    </li>
                  );
                })}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted">
              Für diesen Teil gibt es in diesem Level keine eigene Stunde – mit der Lehrkraft
              besprechen.
            </p>
          )}
        </>
      )}
    </div>
  );
}
