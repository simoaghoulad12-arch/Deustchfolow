import type { Metadata, Viewport } from 'next';
import { bricolage, plexArabic, plexSans } from '@/lib/fonts';
import { dirOf } from '@/lib/i18n';
import { getPrefs } from '@/lib/prefs';
import './globals.css';

export const metadata: Metadata = {
  title: 'Smart Deutsch Akademie',
  description: 'Internes Betriebssystem und Lern-App der Smart Deutsch Akademie',
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
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
