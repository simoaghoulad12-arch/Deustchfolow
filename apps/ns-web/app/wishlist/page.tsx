import type { Metadata } from 'next';
import { WishlistView } from '@/components/commerce/WishlistView';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { pages } from '@/lib/i18n/copy/pages';

export function generateMetadata(): Metadata {
  return { title: pick(pages, getLocale()).wishlist.title, robots: { index: false } };
}

export default function WishlistPage() {
  const t = pick(pages, getLocale()).wishlist;
  return (
    <div className="mx-auto min-h-[80svh] max-w-[1600px] px-5 pb-28 pt-28 sm:px-8 sm:pt-36">
      <p className="label text-mist">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-6xl leading-none sm:text-8xl">{t.title}</h1>
      <WishlistView />
    </div>
  );
}
