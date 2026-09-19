import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'About — Nattysimo',
};

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[80svh] px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
        <p className="text-xs uppercase tracking-widest2 text-gold">About Nattysimo</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
          NS is built for people who train before anyone is watching.
        </h1>
        <div className="mt-10 max-w-xl space-y-6 text-sm leading-relaxed text-smoke sm:text-base">
          <p>
            Nattysimo is a sportswear identity, not a slogan. It exists for the discipline that
            happens off-camera — the repetition, the quiet consistency, the work no one applauds.
          </p>
          <p>
            The product is the message. Every piece is designed to disappear into the work you do
            in it, not compete with it. Discipline builds freedom.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
