import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';
import { SOCIAL } from '@/lib/brand';
import { Icon } from '@/components/ui/Icon';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

const FEED = [
  { src: '/images/photo/gym-tank-mirror.jpg', pos: '50% 40%' },
  { src: '/images/photo/founder-duesseldorf.jpg', pos: '50% 35%' },
  { src: '/images/photo/worn-tee-bag.jpg', pos: '50% 40%' },
  { src: '/images/photo/gym-tank-shorts.jpg', pos: '50% 50%' },
];

/** Social bridge — Instagram is where most visitors arrive from; send them back with intent. */
export function Community() {
  const locale = getLocale();
  const t = pick(home, locale).community;
  // "20K+" reads "+20 ألف" in Arabic.
  const label =
    locale === 'ar' ? SOCIAL.communityLabel.replace(/(\d+)K\+/, '+$1 ألف') : SOCIAL.communityLabel;
  return (
    <section className="bg-ink py-24 sm:py-32" aria-labelledby="community-title">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="label text-mist">{t.eyebrow}</p>
            <h2
              id="community-title"
              className="mt-5 font-display text-5xl leading-none sm:text-7xl"
            >
              {SOCIAL.instagramHandle}
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-mist">{t.text(label)}</p>
          </div>
          <a href={SOCIAL.instagram} target="_blank" rel="noreferrer" className="btn-line">
            <Icon name="instagram" className="h-4 w-4" /> {t.follow}
          </a>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {FEED.map((f, i) => {
            const alt = t.feedAlts[i] ?? '';
            return (
              <Reveal key={f.src} delay={i * 0.08}>
                <a
                  href={SOCIAL.instagram}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-[4/5] overflow-hidden bg-graphite"
                  aria-label={t.viewOnInstagram(alt)}
                >
                  <Image
                    src={f.src}
                    alt={alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover brightness-[0.85] saturate-[0.8] transition-all duration-[1.2s] ease-cinematic group-hover:scale-105 group-hover:brightness-100"
                    style={{ objectPosition: f.pos }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Icon name="instagram" className="h-7 w-7" />
                  </span>
                </a>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
