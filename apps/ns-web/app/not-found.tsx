import Link from 'next/link';
import { Navigation } from '@/components/navigation/Navigation';

export default function NotFound() {
  return (
    <>
      <Navigation />
      <main className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <p className="text-xs uppercase tracking-widest2 text-gold">404</p>
        <h1 className="mt-4 font-display text-3xl sm:text-5xl">This page doesn&rsquo;t exist.</h1>
        <Link
          href="/"
          className="mt-8 border border-bone/30 px-6 py-3 text-xs uppercase tracking-widest2 transition hover:border-gold hover:text-gold"
        >
          Return home
        </Link>
      </main>
    </>
  );
}
