import type { Metadata } from 'next';
import { Worlds } from '@/components/home/Worlds';

export const metadata: Metadata = {
  title: 'Worlds — Sports, Clothing, Hybrid',
  description:
    'Three worlds inside NATYSIMO: Sports (performance, training), Clothing (streetwear, lifestyle) and Hybrid (gym to street).',
  alternates: { canonical: '/worlds' },
};

export default function WorldsPage() {
  return (
    <div className="pt-16 sm:pt-[72px]">
      <Worlds headingLevel="h1" />
    </div>
  );
}
