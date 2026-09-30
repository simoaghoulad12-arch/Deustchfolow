import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

/**
 * Legal & service pages. The copy here is a structural placeholder: the
 * operator's legal details (Impressum per § 5 DDG, privacy policy, terms,
 * returns policy) must be supplied and reviewed before the store takes orders.
 */
const PAGES = {
  shipping: {
    title: 'Shipping & Returns',
    body: [
      'NATYSIMO ships from Germany to Germany and the EU.',
      'Final shipping rates, delivery times and the returns window are confirmed here and at checkout when the store opens. Customers in the EU keep their statutory right of withdrawal.',
    ],
  },
  imprint: {
    title: 'Imprint',
    body: ['Legal notice (Impressum) — the operator’s company details, address and contact information are published here before the store opens.'],
  },
  privacy: {
    title: 'Privacy',
    body: [
      'This site currently stores your bag and wishlist only in your own browser (local storage). No account, payment or tracking data is collected.',
      'The full privacy policy is published here before the store opens.',
    ],
  },
  terms: {
    title: 'Terms',
    body: ['General terms and conditions (AGB) are published here before the store opens.'],
  },
} as const;

type Slug = keyof typeof PAGES;
const isSlug = (s: string): s is Slug => s in PAGES;

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  return isSlug(params.page) ? { title: PAGES[params.page].title } : {};
}

export default function LegalPage({ params }: { params: { page: string } }) {
  if (!isSlug(params.page)) notFound();
  const page = PAGES[params.page];
  return (
    <div className="mx-auto min-h-[70svh] max-w-2xl px-5 pb-28 pt-32 sm:pt-40">
      <p className="label text-gold">Service</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">{page.title}</h1>
      <div className="mt-10 space-y-5 text-[15px] leading-relaxed text-ivory/80">
        {page.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
