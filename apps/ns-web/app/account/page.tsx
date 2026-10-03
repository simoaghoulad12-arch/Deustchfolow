import type { Metadata } from 'next';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { COMMERCE } from '@/lib/commerce/provider';
import { SOCIAL } from '@/lib/brand';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { pages } from '@/lib/i18n/copy/pages';

export function generateMetadata(): Metadata {
  return { title: pick(pages, getLocale()).account.title, robots: { index: false } };
}

export default function AccountPage() {
  const t = pick(pages, getLocale()).account;
  return (
    <div className="mx-auto flex min-h-[85svh] max-w-xl flex-col items-center justify-center px-5 pb-28 pt-28 text-center">
      <div className="w-16">
        <Mark sizes="64px" />
      </div>
      <p className="label mt-10 text-mist">{t.eyebrow}</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">{t.heading}</h1>
      {COMMERCE.accountsEnabled ? null : (
        <p className="mt-6 text-sm leading-relaxed text-mist">{t.text}</p>
      )}
      <div className="mt-10 flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
        <Link href="/wishlist" className="btn-line">
          {t.wishlist}
        </Link>
        <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="btn-solid">
          {t.instagram}
        </a>
      </div>
    </div>
  );
}
