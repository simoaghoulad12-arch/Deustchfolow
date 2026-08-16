import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeutschFlow – Deutsch lernen. Deutsch sprechen.',
  description:
    'DeutschFlow begleitet dich von A1 bis C1: strukturiertes Lernen, echte Konversation und Tutor-Stunden auf dem Weg nach Deutschland.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
