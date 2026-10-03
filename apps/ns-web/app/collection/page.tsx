import type { Metadata } from 'next';
import Link from 'next/link';
import { Collection } from '@/components/home/Collection';
import { Anatomy } from '@/components/home/Anatomy';
import { Sets } from '@/components/home/Sets';
import { Details } from '@/components/home/Details';
import { TextReveal } from '@/components/motion/Reveal';
import { products } from '@/lib/commerce/catalog';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

export function generateMetadata(): Metadata {
  const t = pick(home, getLocale()).collectionPage;
  const title = pick(home, getLocale()).shop.title;
  return {
    title,
    description: t.description(products.length),
    alternates: { canonical: '/collection' },
  };
}

export default function CollectionPage() {
  const t = pick(home, getLocale()).collectionPage;
  return (
    <>
      <section className="relative flex min-h-[70svh] items-end px-5 pb-16 pt-32 sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_40%,rgba(207,211,216,0.08),transparent_70%)]" />
        <div className="relative mx-auto w-full max-w-[1600px]">
          <p className="label text-mist">{t.eyebrow}</p>
          <h1 className="mt-5 font-display text-[3.6rem] leading-[0.92] sm:text-9xl">
            <TextReveal
              lines={[
                t.lines[0],
                <span key="b" className="italic text-ivory/60">
                  {t.lines[1]}
                </span>,
              ]}
            />
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-mist">
            {t.text(products.length)}
          </p>
          <Link href="/shop" className="btn-solid mt-10">
            {t.cta}
          </Link>
        </div>
      </section>
      <Collection />
      <Anatomy />
      <Sets />
      <Details />
    </>
  );
}
