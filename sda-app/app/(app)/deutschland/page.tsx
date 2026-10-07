import { Label } from '@/components/Label';
import { LessonLinkList } from '@/components/LessonLinkList';
import { PageHeader } from '@/components/PageHeader';
import { StatementSections } from '@/components/StatementSections';
import { content } from '@/content';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

/** 09 Germany Preparation (legacy: pageDE) – bestehende Stunden nach Themen. */
export default function GermanyPage() {
  const { lang } = getPrefs();
  return (
    <>
      <PageHeader
        page="de"
        lang={lang}
        label={pageLabel('de')}
        intro="Bestehende Stunden mit direktem Bezug zum Leben in Deutschland, neu nach Themen gruppiert. Ein Tipp öffnet die Stunde mit Skript."
      />
      <div className="mb-4 space-y-4">
        {content.germany.map((g) => (
          <section key={g.thema} className="card">
            <h2 className="flex flex-wrap items-center gap-2 text-lg font-bold">
              {g.thema} <Label kind="EXISTING" lang={lang} />
            </h2>
            <LessonLinkList ids={g.lessonIds} />
          </section>
        ))}
      </div>
      <StatementSections
        page="de"
        lang={lang}
        sections={['Ausbildung und Studium', 'Bewerbungsbegleitung']}
      />
    </>
  );
}
