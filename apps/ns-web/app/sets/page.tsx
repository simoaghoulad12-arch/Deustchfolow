import type { Metadata } from 'next';
import { SETS } from '@/lib/commerce/sets';
import { SetCard } from '@/components/sets/SetCard';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { productCopy } from '@/lib/i18n/copy/product';

export function generateMetadata(): Metadata {
  const t = pick(productCopy, getLocale()).sets;
  return { title: t.title, description: t.description, alternates: { canonical: '/sets' } };
}

export default function SetsPage() {
  const t = pick(productCopy, getLocale()).sets;
  return (
    <div className="mx-auto max-w-[1600px] px-5 pb-28 pt-28 sm:px-8 sm:pt-36">
      <p className="label text-mist">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-[3.4rem] leading-[0.95] sm:text-8xl">{t.title}</h1>
      <p className="mt-6 max-w-md text-sm leading-relaxed text-mist">{t.intro}</p>
      <div className="mt-12 grid gap-x-3 gap-y-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-5">
        {SETS.map((s) => (
          <SetCard key={s.slug} set={s} />
        ))}
      </div>
    </div>
  );
}
