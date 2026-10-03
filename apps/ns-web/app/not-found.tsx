import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { pages } from '@/lib/i18n/copy/pages';

export default function NotFound() {
  const t = pick(pages, getLocale()).notFound;
  return (
    <div className="flex min-h-[90svh] flex-col items-center justify-center px-5 text-center">
      <div className="w-16">
        <Mark sizes="64px" />
      </div>
      <p className="label mt-10 text-mist">404</p>
      <h1 className="mt-4 font-display text-5xl sm:text-6xl">{t.heading}</h1>
      <p className="mt-4 text-sm text-mist">{t.text}</p>
      <Link href="/" className="btn-solid mt-10">
        {t.back}
      </Link>
    </div>
  );
}
