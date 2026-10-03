import type { Metadata } from 'next';
import { ShopView } from '@/components/shop/ShopView';
import { TextReveal } from '@/components/motion/Reveal';
import { Sets } from '@/components/home/Sets';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

export function generateMetadata(): Metadata {
  const t = pick(home, getLocale()).shop;
  return { title: t.title, description: t.description, alternates: { canonical: '/shop' } };
}

export default function ShopPage() {
  const t = pick(home, getLocale()).shop;
  return (
    <>
      <div className="mx-auto max-w-[1600px] px-5 pb-10 pt-28 sm:px-8 sm:pt-36">
        <p className="label text-mist">{t.eyebrow}</p>
        <h1 className="mt-4 font-display text-[3.4rem] leading-[0.95] sm:text-8xl">
          <TextReveal lines={[t.title]} />
        </h1>
        <div className="mt-10">
          <ShopView />
        </div>
      </div>
      <Sets />
    </>
  );
}
