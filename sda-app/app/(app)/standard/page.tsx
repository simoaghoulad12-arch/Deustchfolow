import { PageHeader } from '@/components/PageHeader';
import { StatementSections } from '@/components/StatementSections';
import { getPrefs } from '@/lib/prefs';

/** 01 Academy Standard (legacy: pageStd) – alle Regeln mit Kennzeichnung. */
export default function StandardPage() {
  const { lang } = getPrefs();
  return (
    <>
      <PageHeader page="std" lang={lang} />
      <StatementSections page="std" lang={lang} />
    </>
  );
}
