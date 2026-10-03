import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/commerce/store';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileDock } from '@/components/layout/MobileDock';
import { Toast } from '@/components/layout/Toast';
import { CartDrawer } from '@/components/commerce/CartDrawer';
import { BRAND, SOCIAL } from '@/lib/brand';
import { LocaleProvider } from '@/lib/i18n/context';
import { dirOf, htmlLang } from '@/lib/i18n/locale';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { shell } from '@/lib/i18n/copy/shell';

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
  display: 'swap',
});

const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  variable: '--font-arabic',
  weight: ['400', '500', '600'],
  display: 'swap',
  preload: false,
});

const META = {
  en: {
    title: 'NATYSIMO — Discipline Builds Freedom',
    description:
      'NATYSIMO — gym clothing, performance wear and streetwear with Moroccan roots. Three worlds — Sports, Clothing, Hybrid — one standard: discipline builds freedom.',
    og: 'Performance. Identity. Lifestyle. Collection 01 — Sports, Clothing, Hybrid.',
    ogLocale: 'en_US',
  },
  ar: {
    title: 'NATYSIMO — الانضباط يبني الحرية',
    description:
      'NATYSIMO — ملابس رياضية وملابس أداء وستريت وير بجذور مغربية. ثلاثة عوالم: الرياضة والملابس والهجين، ومعيار واحد: الانضباط يبني الحرية.',
    og: 'الأداء. الهوية. أسلوب الحياة. المجموعة 01 — رياضة، ملابس، هجين.',
    ogLocale: 'ar_MA',
  },
} as const;

export function generateMetadata(): Metadata {
  const m = META[getLocale()];
  return {
    metadataBase: new URL(BRAND.url),
    title: {
      default: m.title,
      template: '%s — NATYSIMO',
    },
    description: m.description,
    keywords: [
      'NATYSIMO',
      'gym clothing Morocco',
      'vêtements de sport Maroc',
      'fitness clothing',
      'streetwear',
      'performance wear',
      'oversized gym tee',
      'hybrid athlete',
      'Collection 01',
    ],
    openGraph: {
      type: 'website',
      siteName: 'NATYSIMO',
      title: m.title,
      description: m.og,
      images: [
        { url: '/og.jpg', width: 1200, height: 630, alt: 'NATYSIMO — Discipline builds freedom' },
      ],
      locale: m.ogLocale,
    },
    twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
    appleWebApp: { title: 'NATYSIMO', statusBarStyle: 'black-translucent' },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060606',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  const t = pick(shell, locale);
  return (
    <html
      lang={htmlLang(locale)}
      dir={dirOf(locale)}
      className={`${display.variable} ${sans.variable} ${mono.variable} ${arabic.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: BRAND.name,
              url: BRAND.url,
              logo: `${BRAND.url}/brand/logos/clothing-mark.png`,
              slogan: BRAND.tagline,
              sameAs: [SOCIAL.instagram],
            }),
          }}
        />
        <LocaleProvider locale={locale}>
          <StoreProvider>
            <a
              href="#main"
              className="label sr-only z-[70] bg-ivory px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:start-4 focus:top-4"
            >
              {t.skip}
            </a>
            <SiteHeader />
            <main id="main">{children}</main>
            <SiteFooter />
            <MobileDock />
            <CartDrawer />
            <Toast />
          </StoreProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
