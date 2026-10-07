import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { StatementSections } from '@/components/StatementSections';
import { content } from '@/content';
import { pick } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';

/** 10 Onboarding (legacy: pageOnb) – von der Anfrage bis zum ersten Unterricht. */
export default function OnboardingPage() {
  const { lang } = getPrefs();
  const groups = content.checklists.onboarding.groups;
  const list = (idx: number[]) => (
    <div className="de-content mt-1 space-y-3">
      {idx.map((i) => {
        const g = groups[i];
        if (!g) return null;
        return (
          <div key={i}>
            <h3 className="font-semibold">{g.name ? pick(lang, g.name) : ''}</h3>
            <ul className="list-disc ps-5">
              {g.items.map((x) => (
                <li key={x.id}>{x.text.de}</li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
  return (
    <>
      <PageHeader page="onb" lang={lang} />
      <StatementSections page="onb" lang={lang} sections={['Vor Start', 'Erste Woche', 'Laufend']}>
        {{ 'Vor Start': list([0, 1, 2]), 'Erste Woche': list([3, 4]) }}
      </StatementSections>
      <section className="card mt-4">
        <h2 className="mb-1 text-lg font-bold">Checkliste zum Abhaken</h2>
        <p className="mb-3 text-sm text-muted">
          Pro Teilnehmer dieselbe Liste, danach in der Checkliste zurücksetzen.
        </p>
        <Link href="/stunde/onb?modus=liste" className="btn-primary">
          {content.checklists.onboarding.title}
        </Link>
      </section>
    </>
  );
}
