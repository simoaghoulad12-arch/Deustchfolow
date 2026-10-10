import type { Metadata, Viewport } from 'next';
import { ServiceWorker } from '@/components/ServiceWorker';
import { bricolage, plexArabic, plexSans } from '@/lib/fonts';
import { dirOf } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Deutsch Akademie',
  description: 'Internes Betriebssystem und Lern-App der Smart Deutsch Akademie',
  applicationName: 'Smart Deutsch Akademie',
  // iPhone: zum Home-Bildschirm hinzufügen
  appleWebApp: { capable: true, title: 'Smart Deutsch', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1b1d21',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang, theme } = getPrefs();
  return (
    <html
      lang={lang}
      dir={dirOf(lang)}
      data-theme={theme === 'system' ? undefined : theme}
      className={`${plexSans.variable} ${plexArabic.variable} ${bricolage.variable}`}
    >
      <body className="min-h-screen antialiased">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
