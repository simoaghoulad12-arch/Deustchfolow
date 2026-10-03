import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { getLocale } from '@/lib/i18n/server';
import { pick } from '@/lib/i18n/copy';
import { home } from '@/lib/i18n/copy/home';

export function Manifesto() {
  const t = pick(home, getLocale()).manifesto;
  const withHighlight = (line: string) => {
    const [before, after] = line.split('{h}');
    return (
      <>
        {before}
        <span className="italic text-gold">{t.highlight}</span>
        {after}
      </>
    );
  };
  return (
    <section
      className="relative overflow-hidden bg-ink px-5 py-28 sm:px-8 sm:py-40"
      aria-labelledby="manifesto"
    >
      <div className="mx-auto max-w-[1400px]">
        <Reveal>
          <p className="label text-mist">{t.eyebrow}</p>
        </Reveal>
        <h2
          id="manifesto"
          className="mt-8 font-display text-[2.35rem] leading-[1.05] sm:text-6xl lg:text-[5.5rem]"
        >
          <TextReveal lines={[t.lines[0], withHighlight(t.lines[1]), t.lines[2], t.lines[3]]} />
        </h2>

        <div className="mt-16 grid gap-10 sm:mt-24 lg:grid-cols-3 lg:gap-6">
          {t.cards.map(([title, body], i) => (
            <Reveal key={title} delay={i * 0.12} className="border-t border-white/10 pt-6">
              <p className="label text-fog">0{i + 1}</p>
              <p
                className="metal-text mt-4 font-display text-4xl sm:text-5xl"
                data-world={i === 0 ? 'sports' : i === 1 ? 'clothing' : 'hybrid'}
              >
                {title}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-mist">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
