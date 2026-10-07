import { ComingSoon } from '@/components/ComingSoon';
import { PageHeader } from '@/components/PageHeader';
import type { PageKey } from '@/lib/nav';
import { getPrefs } from '@/lib/prefs';
import { pageLabel } from '@/lib/statements';

/** Seite im App-Rahmen, deren Inhalt in einer späteren Phase folgt. */
export function Placeholder({
  page,
  legacyKey,
  phase,
  plan,
}: {
  page: PageKey;
  legacyKey?: string;
  phase: number;
  plan: string;
}) {
  const { lang } = getPrefs();
  return (
    <>
      <PageHeader page={page} lang={lang} label={pageLabel(legacyKey ?? page)} />
      <ComingSoon phase={phase} lang={lang}>
        {plan}
      </ComingSoon>
    </>
  );
}
