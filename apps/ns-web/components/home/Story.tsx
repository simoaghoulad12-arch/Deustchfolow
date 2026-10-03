import Image from 'next/image';
import Link from 'next/link';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { SOCIAL } from '@/lib/brand';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

/** Brand story — grounded in what the Instagram export confirms (see docs/BRAND_AUDIT.md). */
export function Story() {
  const locale = getLocale();
  const t = pick(home, locale).story;
  return (
    <section
      data-world="clothing"
      className="relative bg-coal py-24 sm:py-36"
      aria-labelledby="story-title"
    >
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
        <Reveal className="order-2 lg:order-1">
          <p className="label text-mist">{t.eyebrow}</p>
          <h2
            id="story-title"
            className="mt-6 font-display text-[2.6rem] leading-[1.02] sm:text-7xl"
          >
            <TextReveal
              lines={[
                t.lines[0],
                <span key="b" className="italic text-gold">
                  {t.lines[1]}
                </span>,
              ]}
            />
          </h2>
          <div className="mt-8 max-w-lg space-y-5 text-[15px] leading-relaxed text-ivory/80">
            <p>{t.p1(SOCIAL.instagramHandle)}</p>
            <p>{t.p2}</p>
          </div>
          <blockquote
            lang="ar"
            dir="rtl"
            className="mt-10 border-s border-gold/60 ps-5 text-start font-display text-2xl leading-snug text-ivory/75"
          >
            القرار كرجع ليك
            <footer
              lang={locale === 'ar' ? 'ar' : 'en'}
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className="label mt-2 text-start text-fog"
            >
              {t.quoteGloss}
            </footer>
          </blockquote>
          <Link href="/story" className="btn-line mt-10">
            {t.cta}
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2" y={40}>
          <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
            <Image
              src="/images/photo/founder-duesseldorf.jpg"
              alt={t.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_30%] brightness-[0.85] contrast-[1.05] saturate-[0.8]"
            />
          </Parallax>
          <p className="label mt-4 flex justify-between text-fog">
            <span>{t.captionPlace}</span>
            <span>{t.captionItems}</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
