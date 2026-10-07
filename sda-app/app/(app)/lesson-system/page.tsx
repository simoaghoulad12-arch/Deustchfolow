import { Label } from '@/components/Label';
import { PageHeader } from '@/components/PageHeader';
import { content } from '@/content';
import { getPrefs } from '@/lib/prefs';

/** Die 9 Schritte jeder Stunde mit Minuten (aus legacy/index.html, pageLsys). */
export default function LessonSystemPage() {
  const { lang } = getPrefs();
  return (
    <>
      <PageHeader
        page="lsys"
        lang={lang}
        intro={
          <span className="de-content block">
            Ein wiedererkennbarer Ablauf für jede Stunde. Die Minuten stammen aus dem bestehenden
            Stundenplan (Grammatik 120 Min., Sprechen 60 Min.). Pause in der Grammatikstunde: 55–65.
          </span>
        }
      />
      <ol className="de-content space-y-3">
        {content.lessonSystem.map((s) => (
          <li key={s.nr} className="card flex gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-anth font-bold text-anth-ink">
              {s.nr}
            </span>
            <div className="min-w-0">
              <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
                {s.schritt}
                {s.labels.map((l) => (
                  <Label key={l} kind={l} lang={lang} />
                ))}
              </h2>
              <p>{s.beschreibung}</p>
              <p className="text-sm text-muted">
                Grammatik: {s.minutenGrammatik} · Sprechen: {s.minutenSprechen}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </>
  );
}
