import Image from 'next/image';
import Link from 'next/link';
import { Parallax } from '@/components/motion/Parallax';
import { Reveal, TextReveal } from '@/components/motion/Reveal';

/** Brand story. Copy comes from the brand's own German statement (kept verbatim as the pull-quote). */
export function Story() {
  return (
    <section data-world="clothing" className="relative bg-coal py-24 sm:py-36" aria-labelledby="story-title">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-24">
        <Reveal className="order-2 lg:order-1">
          <p className="label text-accent">Our story</p>
          <h2 id="story-title" className="mt-6 font-display text-[2.6rem] leading-[1.02] sm:text-7xl">
            <TextReveal lines={['Same dreams.', <span key="b" className="italic text-gold">Different work ethic.</span>]} />
          </h2>
          <div className="mt-8 max-w-lg space-y-5 text-[15px] leading-relaxed text-ivory/80">
            <p>
              NATYSIMO is more than a clothing brand. It is a mindset — born from discipline, hard work and the will never to stand still.
            </p>
            <p>We connect performance with style, for everyone who wants more. The gym is where it starts. The street is where it shows.</p>
          </div>
          <blockquote lang="de" className="mt-10 border-l border-gold/60 pl-5 font-display text-xl italic leading-snug text-ivory/70">
            „Wir verbinden Performance mit Stil – für alle, die mehr wollen.“
          </blockquote>
          <Link href="/story" className="btn-line mt-10">
            Read the story
          </Link>
        </Reveal>

        <Reveal className="order-1 lg:order-2" y={40}>
          <Parallax className="aspect-[4/5] bg-graphite" strength={6}>
            <Image
              src="/images/photo/founder-duesseldorf.jpg"
              alt="The NATYSIMO founder on Königsallee, Düsseldorf, wearing the Essential Tee, shorts, crossbody bag and socks"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-[50%_30%] brightness-[0.85] contrast-[1.05] saturate-[0.8]"
            />
          </Parallax>
          <p className="label mt-4 flex justify-between text-fog">
            <span>Königsallee, Düsseldorf</span>
            <span>Essential Tee · Essential Shorts</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
