import { ComingSoon } from '@/components/ComingSoon';
import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { content } from '@/content';
import { getPrefs } from '@/lib/prefs';

/** Offene Entscheidungen aus legacy/index.html. Entscheiden und speichern (Tabelle decisions) folgt in Phase 6. */
export default function DecisionsPage() {
  const { lang } = getPrefs();
  return (
    <>
      <PageHeader page="dec" lang={lang} label="OFFENE ENTSCHEIDUNG" />
      <ol className="mb-6 space-y-2">
        {content.decisions.map((d) => (
          <li key={d.id} className="card">
            <p className="de-content flex flex-wrap items-baseline gap-2">
              <Label kind={d.label} lang={lang} />
              <span className="min-w-0 flex-1">{d.text.de}</span>
            </p>
            {lang === 'ar' && d.text.ar && <p className="mt-1 text-sm text-muted">{d.text.ar}</p>}
          </li>
        ))}
      </ol>
      <ComingSoon phase={6} lang={lang}>
        Die Leitung trägt Entscheidungen ein; Status und Datum werden gespeichert.
      </ComingSoon>
    </>
  );
}
