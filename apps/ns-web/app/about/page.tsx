import type { Metadata } from 'next';
import Image from 'next/image';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/sections/Footer';

export const metadata: Metadata = {
  title: 'About — Nattysimo',
};

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[80svh]">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="px-5 pb-16 pt-32 sm:px-8 sm:pt-40 lg:py-40">
            <p className="text-xs uppercase tracking-widest2 text-gold">About Nattysimo</p>
            <h1 className="mt-4 max-w-lg font-display text-4xl leading-tight sm:text-6xl">
              NS is built for people who train before anyone is watching.
            </h1>
            <div className="mt-10 max-w-lg space-y-6 text-sm leading-relaxed text-smoke sm:text-base">
              <p>
                Nattysimo is a sportswear identity, not a slogan. It exists for the discipline
                that happens off-camera — the repetition, the quiet consistency, the work no one
                applauds.
              </p>
              <p>
                The product is the message. Every piece is designed to disappear into the work
                you do in it, not compete with it. Discipline builds freedom.
              </p>
            </div>
          </div>

          <div className="relative h-[50vh] lg:h-auto lg:min-h-[640px]">
            <Image
              src="/images/real/tanktop-shorts-side.png"
              alt="Nattysimo athlete training in NS gear"
              fill
              className="object-cover object-[65%_20%]"
              sizes="(min-width: 1024px) 50vw, 100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-void/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-void/30 lg:via-transparent lg:to-transparent" />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
