import type { Metadata } from 'next';
import { Worlds } from '@/components/home/Worlds';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { worldPage } from '@/lib/i18n/copy/worldpage';

export function generateMetadata(): Metadata {
  const t = pick(worldPage, getLocale());
  return {
    title: t.indexTitle,
    description: t.indexDescription,
    alternates: { canonical: '/worlds' },
  };
}

export default function WorldsPage() {
  return (
    <div className="pt-16 sm:pt-[72px]">
      <Worlds headingLevel="h1" />
    </div>
  );
}
