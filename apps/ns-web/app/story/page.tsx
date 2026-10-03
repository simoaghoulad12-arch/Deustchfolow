import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { Parallax } from '@/components/motion/Parallax';
import { SOCIAL, WORLD_ORDER } from '@/lib/brand';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { shell } from '@/lib/i18n/copy/shell';
import { story } from '@/lib/i18n/copy/story';
import { localizeWorld } from '@/lib/i18n/worlds';

export function generateMetadata(): Metadata {
  const t = pick(story, getLocale());
  return {
    title: t.title,
    description: t.description(SOCIAL.instagramHandle),
    alternates: { canonical: '/story' },
  };
}

export default function StoryPage() {
  const locale = getLocale();
  const t = pick(story, locale);
  const roots = pick(shell, locale).roots;
  const CHAPTERS = t.chapters;
  return (
    <>
      <section className="relative flex min-h-[90svh] items-center justify-center overflow-hidden px-5 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_45%,rgba(209,173,91,0.1),transparent_70%)]" />
        <div className="relative">
          <Reveal className="mx-auto w-20 sm:w-24">
            <Mark priority sizes="96px" />
          </Reveal>
          <p className="label mt-10 text-mist">{t.eyebrow}</p>
          <h1 className="mt-6 font-display text-[2.9rem] leading-[1] sm:text-8xl">
            <TextReveal
              lines={[
                t.heroLines[0],
                <span key="c" className="italic text-gold">
                  {t.heroLines[1]}
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
              alt={t.photoAlt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_40%] grayscale-[0.4] brightness-[0.8]"
            />
          </Parallax>
        </Reveal>
        <Reveal className="flex flex-col justify-center">
          <div className="space-y-6 text-[17px] leading-relaxed text-ivory/85">
            <p className="font-display text-3xl leading-snug text-ivory sm:text-4xl">
              {t.lead(SOCIAL.instagramHandle)}
            </p>
            <p>{t.p1}</p>
            <p>{t.p2}</p>
            <p className="font-display text-2xl italic text-gold">{t.tagline}</p>
          </div>
        </Reveal>
      </section>

      <section
        className="border-t border-white/[0.07] py-24 sm:py-32"
        aria-labelledby="chapters-title"
      >
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <h2 id="chapters-title" className="label text-mist">
            {t.chaptersTitle}
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
                alt={t.rootsAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-[50%_30%] saturate-[0.8]"
              />
            </Parallax>
          </Reveal>
          <Reveal className="lg:order-1">
            <p className="label text-mist">{roots}</p>
            <h2 id="roots-title" className="mt-5 font-display text-5xl leading-none sm:text-6xl">
              {t.rootsLines[0]}
              <br />
              <span className="italic text-ivory/60">{t.rootsLines[1]}</span>
            </h2>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ivory/80">{t.rootsText}</p>
            <blockquote
              lang="ar"
              dir="rtl"
              className="mt-10 border-s border-gold/60 ps-5 text-start font-display text-3xl leading-snug text-ivory/80"
            >
              القرار كرجع ليك
              <footer
                lang={locale === 'ar' ? 'ar' : 'en'}
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="label mt-3 text-start text-fog"
              >
                {t.quoteFooter(SOCIAL.instagramHandle)}
              </footer>
            </blockquote>
          </Reveal>
        </div>
      </section>

      <section className="py-24 sm:py-32" aria-labelledby="system-title">
        <div className="mx-auto max-w-[1400px] px-5 sm:px-8">
          <Reveal>
            <p className="label text-mist">{t.identityEyebrow}</p>
            <h2 id="system-title" className="mt-5 font-display text-5xl leading-none sm:text-7xl">
              {t.identityTitle}
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-mist">{t.identityText}</p>
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
                  <p className="label mt-10 text-accent">{localizeWorld(id, locale).name}</p>
                  <p className="mt-3 font-display text-2xl">{localizeWorld(id, locale).headline}</p>
                  <p className="label mt-4 text-fog">{localizeWorld(id, locale).descriptor}</p>
                </Link>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 flex flex-col gap-2.5 sm:flex-row">
            <Link href="/shop" className="btn-solid">
              {t.shop}
            </Link>
            <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="btn-line">
              {t.follow(SOCIAL.instagramHandle)}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
