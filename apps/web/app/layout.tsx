import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'DeutschFlow – Learn a language. Live it.',
  description:
    'Learn German, English, Spanish, French or Italian by living it: real-life missions with AI characters, natural corrections and a plan that adapts to you.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
