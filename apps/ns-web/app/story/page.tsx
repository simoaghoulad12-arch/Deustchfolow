import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { Parallax } from '@/components/motion/Parallax';
import { BRAND, SOCIAL, WORLDS, WORLD_ORDER } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Story',
  description:
    'Before the clothing, there was the training. NATYSIMO grew out of @natty.simo — Moroccan roots, built in Germany, around one idea: discipline builds freedom.',
  alternates: { canonical: '/story' },
};

const CHAPTERS = [
  ['Training', 'It starts on the floor. Every day, whether anyone is watching or not.'],
  ['Consistency', 'Not the perfect session — the next one. Then the one after that.'],
  [
    'Failure',
    'Missed days, slow progress, starting again. Nobody posts that part. It still counts.',
  ],
  ['Growth', 'Small, repeated, earned. The mirror changes last.'],
  ['Identity', 'At some point the discipline stops being what you do and becomes who you are.'],
];

export default function StoryPage() {
  return (
    <>
      <section className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(209,173,91,0.1),transparent_70%)]" />
        <div className="relative">
          <Reveal className="mx-auto w-20 sm:w-24">
            <Mark priority sizes="96px" />
          </Reveal>
          <p className="label mt-10 text-mist">Our story</p>
          <h1 className="mt-6 font-display text-[2.9rem] leading-[1] sm:text-8xl">
            <TextReveal
              lines={[
                'Before the clothing,',
                <span key="c" className="italic text-gold">
                  there was the training.
                </span>,
              ]}
            />
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1400px] gap-12 px-5 pb-28 sm:px-8 lg:grid-cols-2 lg:gap-24">
        <Reveal>
          <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
            <Image
              src="/images/photo/gym-tank-mirror.jpg"
              alt="Training in the Performance Tank"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_40%] grayscale-[0.4] brightness-[0.8]"
            />
          </Parallax>
        </Reveal>
        <Reveal className="flex flex-col justify-center">
          <div className="space-y-6 text-[17px] leading-relaxed text-ivory/85">
            <p className="font-display text-3xl leading-snug text-ivory sm:text-4xl">
              NATYSIMO started as {SOCIAL.instagramHandle}.
            </p>
            <p>
              Training, filmed and shared — between Morocco and Germany. No investors and no
              shortcuts: sessions, reels, a training plan, and a community that grew around the
              discipline.
            </p>
            <p>
              The clothing is the next step of the same mindset. Pieces built on the training floor,
              made to be worn beyond it.
            </p>
            <p className="font-display text-2xl italic text-gold">
              Same dreams. Different work ethic.
            </p>
          </div>
        </Reveal>
      </section>

      <section
        className="border-t border-white/[0.07] py-24 sm:py-32"
        aria-labelledby="chapters-title"
      >
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <h2 id="chapters-title" className="label text-mist">
            What it’s built on
          </h2>
          <ol className="mt-10">
            {CHAPTERS.map(([title, body], i) => (
              <Reveal
                as="li"
                key={title}
                delay={i * 0.05}
                className="grid gap-3 border-t border-white/10 py-8 sm:grid-cols-[120px_1fr_1.2fr] sm:items-baseline sm:gap-8"
              >
                <span className="font-mono text-xs text-fog">0{i + 1}</span>
                <span className="font-display text-4xl sm:text-5xl">{title}.</span>
                <span className="max-w-md text-sm leading-relaxed text-mist">{body}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section
        className="border-y border-white/[0.07] bg-coal py-24 sm:py-32"
        aria-labelledby="roots-title"
      >
        <div className="mx-auto grid max-w-[1400px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
          <Reveal className="lg:order-2">
            <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
              <Image
                src="/images/photo/founder-duesseldorf.jpg"
                alt="The NATYSIMO founder in Düsseldorf, Germany"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_30%] saturate-[0.8]"
              />
            </Parallax>
          </Reveal>
          <Reveal className="lg:order-1">
            <p className="label text-mist">{BRAND.roots}</p>
            <h2 id="roots-title" className="mt-5 font-display text-5xl leading-none sm:text-6xl">
              Moroccan roots.
              <br />
              <span className="italic text-ivory/60">International standard.</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">
              Most of the community lives in Morocco — Casablanca, Marrakech, Tanger, Fès, Salé. The
              brand is built in Germany. NATYSIMO is made for both: the energy of home, executed to
              an international standard.
            </p>
            <blockquote
              lang="ar"
              dir="rtl"
              className="mt-10 border-r border-gold/60 pr-5 text-right font-display text-3xl leading-snug text-ivory/80"
            >
              القرار كرجع ليك
              <footer lang="en" dir="ltr" className="label mt-3 text-left text-fog">
                “The decision comes back to you.” — {SOCIAL.instagramHandle}
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="system-title">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <p className="label text-mist">The identity</p>
            <h2 id="system-title" className="mt-5 font-display text-5xl leading-none sm:text-7xl">
              One crown. Three worlds.
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">
              Every world carries the NS monogram beneath the crown — cut in its own metal. Silver
              for the training floor, gold for the street, forged steel where the two meet.
            </p>
          </Reveal>
          <div className="mt-16 grid gap-2 sm:grid-cols-3">
            {WORLD_ORDER.map((id, i) => (
              <Reveal key={id} delay={i * 0.1}>
                <Link
                  href={`/worlds/${id}`}
                  data-world={id}
                  className="group flex h-full flex-col items-center border border-white/[0.07] bg-coal px-6 py-14 text-center transition-colors hover:border-accent/40"
                >
                  <span className="w-28 transition-transform duration-1000 ease-cinematic group-hover:scale-105 sm:w-32">
                    <Mark world={id} sizes="128px" />
                  </span>
                  <p className="label mt-10 text-accent">{WORLDS[id].name}</p>
                  <p className="mt-3 font-display text-2xl">{WORLDS[id].headline}</p>
                  <p className="label mt-4 text-fog">{WORLDS[id].descriptor}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 flex flex-col gap-2.5 sm:flex-row">
            <Link href="/shop" className="btn-solid">
              Shop Collection 01
            </Link>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="btn-line">
              Follow {SOCIAL.instagramHandle}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
