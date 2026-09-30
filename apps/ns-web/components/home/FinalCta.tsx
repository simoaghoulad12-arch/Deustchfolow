import Link from 'next/link';
import { Mark } from '@/components/brand/Mark';
import { Reveal, TextReveal } from '@/components/motion/Reveal';
import { Icon } from '@/components/ui/Icon';

export function FinalCta() {
  return (
    <section
      className="relative overflow-hidden bg-ink py-32 sm:py-48"
      aria-labelledby="final-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_50%_45%,rgba(209,173,91,0.12),transparent_70%)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-5 text-center">
        <Reveal className="w-24 sm:w-32">
          <Mark sizes="128px" />
        </Reveal>
        <h2 id="final-title" className="mt-10 font-display text-[2.8rem] leading-[1] sm:text-8xl">
          <TextReveal
            lines={[
              'Discipline',
              <span key="f" className="italic text-gold">
                builds freedom.
              </span>,
            ]}
          />
        </h2>
        <Reveal
          delay={0.3}
          className="mt-10 flex w-full max-w-[420px] flex-col gap-2.5 sm:w-auto sm:max-w-none sm:flex-row sm:gap-3"
        >
          <Link href="/shop" className="btn-solid">
            Shop Collection 01 <Icon name="arrow" className="h-4 w-4" />
          </Link>
          <Link href="/story" className="btn-line">
            The story
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
