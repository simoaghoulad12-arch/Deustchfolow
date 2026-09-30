import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SOCIAL } from '@/lib/brand';

/**
 * Service & legal pages.
 *
 * Imprint (Impressum, § 5 DDG), privacy (Datenschutz), terms (AGB) and the
 * withdrawal policy (Widerruf) need the operator's real legal details. None
 * exist in the project, so those pages say so plainly instead of inventing a
 * company, address or registration number. Fill them before taking orders.
 */
type Page = {
  title: string;
  local?: string;
  intro?: string;
  sections: { h?: string; p: string[] }[];
  placeholder?: boolean;
};

const PAGES: Record<string, Page> = {
  shipping: {
    title: 'Delivery',
    intro: 'Where NATYSIMO ships, and what is still being confirmed.',
    sections: [
      {
        h: 'Morocco',
        p: [
          'Delivery to all cities in Morocco is planned for launch, including cash on delivery.',
          'Rates and delivery times are confirmed here and at checkout before the first order.',
        ],
      },
      {
        h: 'Germany & EU',
        p: [
          'Delivery to Germany and the EU is planned. Rates, delivery times and any customs details are confirmed before launch.',
        ],
      },
    ],
  },
  returns: {
    title: 'Returns & Exchanges',
    local: 'Widerruf',
    placeholder: true,
    sections: [
      {
        p: [
          'The returns and exchange policy — including the return window, condition requirements and how to start a return — is published here before the store takes orders.',
          'Customers in the EU keep their statutory 14-day right of withdrawal.',
        ],
      },
    ],
  },
  imprint: {
    title: 'Imprint',
    local: 'Impressum',
    placeholder: true,
    sections: [
      {
        p: [
          'The operator’s legal name, address, contact details and registration information are published here before the store opens.',
        ],
      },
    ],
  },
  privacy: {
    title: 'Privacy',
    local: 'Datenschutz',
    placeholder: true,
    sections: [
      {
        h: 'Today',
        p: [
          'This site stores your bag and wishlist only in your own browser (local storage). It sets no tracking or advertising cookies and collects no account, payment or analytics data.',
        ],
      },
      {
        h: 'At launch',
        p: [
          'The full privacy policy — covering orders, payments, delivery partners and your rights under GDPR and Moroccan law 09-08 — is published here before the store opens.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms',
    local: 'AGB',
    placeholder: true,
    sections: [
      {
        p: [
          'The general terms and conditions of sale are published here before the store takes orders.',
        ],
      },
    ],
  },
  faq: {
    title: 'FAQ',
    sections: [
      {
        h: 'Can I order now?',
        p: [
          'Not yet. The store is in preview: you can browse Collection 01, save pieces and build your bag. Checkout opens at launch — follow on Instagram for the date.',
        ],
      },
      {
        h: 'Where do you deliver?',
        p: ['Morocco first, plus Germany and the EU. Rates and times are confirmed before launch.'],
      },
      {
        h: 'Will cash on delivery be available?',
        p: ['Cash on delivery for Morocco is planned for launch.'],
      },
      {
        h: 'How do NATYSIMO pieces fit?',
        p: [
          'Every product page has a size guide with body measurements. Fit notes per piece are published with the launch photography. Between sizes? Size up for a relaxed fit, down for a closer one.',
        ],
      },
      {
        h: 'What are the pieces made of?',
        p: [
          'Material composition is confirmed with suppliers and published on each product page at launch. We don’t publish specs we haven’t verified.',
        ],
      },
      {
        h: 'What are the sets?',
        p: [
          'Curated looks sold together at a permanent set price. They are how the looks are sold — not a sale, and they don’t expire.',
        ],
      },
      {
        h: 'Why are some images marked “Product render” or “Concept visual”?',
        p: [
          'Some pieces are shown with product renders or campaign concept visuals until final product photography is shot. They are always labelled, so you know when an image is not a photograph of the finished piece.',
        ],
      },
    ],
  },
  contact: {
    title: 'Contact',
    sections: [],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((page) => ({ page }));
}

export function generateMetadata({ params }: { params: { page: string } }): Metadata {
  const page = PAGES[params.page];
  return page ? { title: page.title, alternates: { canonical: `/legal/${params.page}` } } : {};
}

export default function LegalPage({ params }: { params: { page: string } }) {
  const page = PAGES[params.page];
  if (!page) notFound();

  return (
    <div className="mx-auto min-h-[70svh] max-w-2xl px-5 pb-28 pt-32 sm:pt-40">
      <p className="label text-mist">{page.local ? `Service · ${page.local}` : 'Service'}</p>
      <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">{page.title}</h1>
      {page.intro && <p className="mt-6 text-sm text-mist">{page.intro}</p>}
      {page.placeholder && (
        <p
          role="note"
          className="mt-8 border border-white/15 px-4 py-3 text-xs leading-relaxed text-mist"
        >
          Pre-launch page. The legally binding version is published before the store accepts orders.
        </p>
      )}

      {params.page === 'contact' ? (
        <div className="mt-10 space-y-3">
          <a
            href={SOCIAL.instagram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
          >
            <span>
              <span className="label block text-mist">Instagram DM</span>
              <span className="mt-1 block">{SOCIAL.instagramHandle}</span>
            </span>
            <span aria-hidden>→</span>
          </a>
          {SOCIAL.whatsapp && (
            <a
              href={`https://wa.me/${SOCIAL.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
            >
              <span>
                <span className="label block text-mist">WhatsApp</span>
                <span className="mt-1 block">+{SOCIAL.whatsapp}</span>
              </span>
              <span aria-hidden>→</span>
            </a>
          )}
          {SOCIAL.contactEmail && (
            <a
              href={`mailto:${SOCIAL.contactEmail}`}
              className="flex items-center justify-between border border-white/15 px-5 py-5 hover:border-ivory"
            >
              <span>
                <span className="label block text-mist">Email</span>
                <span className="mt-1 block">{SOCIAL.contactEmail}</span>
              </span>
              <span aria-hidden>→</span>
            </a>
          )}
          <p className="pt-4 text-sm text-mist">
            Questions about sizing or delivery? Read the{' '}
            <Link href="/legal/faq" className="underline underline-offset-4">
              FAQ
            </Link>{' '}
            first — most answers are there.
          </p>
        </div>
      ) : (
        <div className="mt-10 space-y-10">
          {page.sections.map((section, i) => (
            <section key={i}>
              {section.h && <h2 className="font-display text-2xl">{section.h}</h2>}
              <div className="mt-3 space-y-4 text-[15px] leading-relaxed text-ivory/80">
                {section.p.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
