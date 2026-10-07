import type { Label as LabelKind } from '@/content/types';
import { pick, type Lang } from '@/lib/i18n';
import { navItem, type PageKey } from '@/lib/nav';
import { Label } from './Label';

export function PageHeader({
  page,
  lang,
  label,
  intro,
}: {
  page: PageKey;
  lang: Lang;
  label?: LabelKind;
  intro?: React.ReactNode;
}) {
  return (
    <div className="mb-5">
      <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold sm:text-3xl">
        {pick(lang, navItem(page).label)}
        {label && <Label kind={label} lang={lang} />}
      </h1>
      {intro && <div className="mt-1 text-muted">{intro}</div>}
    </div>
  );
}
