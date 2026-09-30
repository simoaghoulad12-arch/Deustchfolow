import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { Parallax } from '@/components/motion/Parallax';
import { WORLDS, WORLD_ORDER } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Story',
  description: 'NATYSIMO is more than a clothing brand. It is a mindset — born from discipline, hard work and the will never to stand still.',
  alternates: { canonical: '/story' },
};

export default function StoryPage() {
  return (
    <>
      <section className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(201,162,107,0.12),transparent_70%)]" />
        <div className="relative">
          <Reveal className="mx-auto w-20 sm:w-24">
            <Mark priority sizes="96px" />
          </Reveal>
          <p className="label mt-10 text-gold">Our story</p>
          <h1 className="mt-6 font-display text-[3rem] leading-[1] sm:text-8xl">
            <TextReveal lines={['More than', <span key="c" className="italic text-gold">just clothes.</span>]} />
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-28 sm:px-8 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
            <Image src="/images/photo/gym-tank-mirror.jpg" alt="Training in the Performance Tank" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[50%_40%] grayscale-[0.4] brightness-[0.8]" />
          </Parallax>
        </Reveal>
        <Reveal className="flex flex-col justify-center">
          <div className="space-y-6 text-[17px] leading-relaxed text-ivory/85">
            <p className="font-display text-3xl leading-snug text-ivory sm:text-4xl">NATYSIMO is a mindset before it is a label.</p>
            <p>It was born from discipline, hard work and the will never to stand still. From the sessions nobody sees, and the mornings that start before the city does.</p>
            <p>We connect performance with style — for everyone who wants more. Not louder. More.</p>
            <p className="font-display text-2xl italic text-gold">Same dreams. Different work ethic.</p>
          </div>
        </Reveal>
      </section>

      <section className="border-y border-white/[0.07] bg-coal py-24 sm:py-32" aria-labelledby="system-title">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <p className="label text-gold">The identity</p>
            <h2 id="system-title" className="mt-5 font-display text-5xl leading-none sm:text-7xl">
              One crown. Three worlds.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">
              Every world carries the NS monogram beneath the crown — cut in its own metal. Silver for the training floor, gold for the street, forged steel where the two meet.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-2 sm:grid-cols-3">
            {WORLD_ORDER.map((id, i) => (
              <Reveal key={id} delay={i * 0.1}>
                <Link href={`/worlds/${id}`} data-world={id} className="group flex h-full flex-col items-center border border-white/[0.07] bg-ink px-6 py-14 text-center transition-colors hover:border-accent/40">
                  <span className="w-28 transition-transform duration-1000 ease-cinematic group-hover:scale-105 sm:w-32">
                    <Mark world={id} sizes="128px" />
                  </span>
                  <p className="label mt-10 text-accent">{WORLDS[id].name}</p>
                  <p className="mt-3 font-display text-2xl">{WORLDS[id].headline}</p>
                  <p className="label mt-4 text-fog">{WORLDS[id].descriptor}</p>
                  <div className="mt-6 flex gap-1.5">
                    {WORLDS[id].palette.map((c) => (
                      <span key={c.name} title={c.name} className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: c.hex }} />
                    ))}
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 py-28 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
        <Reveal className="lg:order-2">
          <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
            <Image src="/images/photo/founder-duesseldorf.jpg" alt="The NATYSIMO founder on Königsallee, Düsseldorf" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover object-[50%_30%] saturate-[0.8]" />
          </Parallax>
        </Reveal>
        <Reveal className="lg:order-1">
          <p className="label text-gold">Düsseldorf</p>
          <h2 className="mt-5 font-display text-5xl leading-none sm:text-6xl">From the gym to the Kö.</h2>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">
            The uniform doesn’t change when the session ends. The same monogram on the training floor and on the boulevard — because discipline is not a place you visit.
          </p>
          <blockquote lang="de" className="mt-10 border-l border-gold/60 pl-5 font-display text-xl italic leading-snug text-ivory/70">
            „NATYSIMO ist mehr als eine Kleidungsmarke. Es ist ein Mindset.“
          </blockquote>
          <Link href="/shop" className="btn-solid mt-10">
            Shop Collection 01
          </Link>
        </Reveal>
      </section>
    </>
  );
}
