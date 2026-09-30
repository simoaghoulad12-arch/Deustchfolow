import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, IBM_Plex_Mono, Inter } from 'next/font/google';
import './globals.css';
import { StoreProvider } from '@/lib/commerce/store';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { MobileDock } from '@/components/layout/MobileDock';
import { Toast } from '@/components/layout/Toast';
import { CartDrawer } from '@/components/commerce/CartDrawer';
import { BRAND, SOCIAL } from '@/lib/brand';

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

export const metadata: Metadata = {
  metadataBase: new URL(BRAND.url),
  title: {
    default: 'NATYSIMO — Discipline Builds Freedom',
    template: '%s — NATYSIMO',
  },
  description:
    'NATYSIMO — gym clothing, performance wear and streetwear with Moroccan roots. Three worlds — Sports, Clothing, Hybrid — one standard: discipline builds freedom.',
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
    title: 'NATYSIMO — Discipline Builds Freedom',
    description: 'Performance. Identity. Lifestyle. Collection 01 — Sports, Clothing, Hybrid.',
    images: [
      { url: '/og.jpg', width: 1200, height: 630, alt: 'NATYSIMO — Discipline builds freedom' },
    ],
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image', images: ['/og.jpg'] },
  appleWebApp: { title: 'NATYSIMO', statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#060606',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
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
        <StoreProvider>
          <a
            href="#main"
            className="label sr-only z-[70] bg-ivory px-4 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
          >
            Skip to content
          </a>
          <SiteHeader />
          <main id="main">{children}</main>
          <SiteFooter />
          <MobileDock />
          <CartDrawer />
          <Toast />
        </StoreProvider>
      </body>
    </html>
  );
}
