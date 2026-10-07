import { Bricolage_Grotesque, IBM_Plex_Sans, IBM_Plex_Sans_Arabic } from 'next/font/google';

// Schriften wie in legacy/index.html. next/font lädt sie beim Build und liefert sie selbst aus:
// Die Browser der Nutzer senden keine Anfragen an Google (Datenschutz).
export const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex',
  display: 'swap',
});
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-ar',
  display: 'swap',
});
export const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-head',
  display: 'swap',
});
