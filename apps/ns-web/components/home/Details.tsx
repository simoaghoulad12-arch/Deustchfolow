import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';

/** Real photography only — details as worn on the produced pieces. */
const DETAILS = [
  {
    src: '/images/photo/worn-tank-chest.jpg',
    title: 'The crown monogram',
    body: 'Intertwined NS beneath the crown, left chest of the Performance Tank.',
  },
  {
    src: '/images/photo/worn-shorts-leg.jpg',
    title: 'Contour lines',
    body: 'Silver lines and the monogram on the Training Shorts.',
  },
  {
    src: '/images/photo/worn-tee-bag.jpg',
    title: 'Mark & wordmark',
    body: 'NS, crown and NATYSIMO — on the Essential Tee and Crossbody Bag.',
  },
  {
    src: '/images/photo/worn-socks.jpg',
    title: 'Down to the socks',
    body: 'The same mark at the ankle. Every piece carries it.',
  },
];

export function Details() {
  return (
    <section className="bg-coal py-24 sm:py-36" aria-labelledby="details-title">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal>
          <p className="label text-mist">Premium details</p>
          <h2
            id="details-title"
            className="mt-5 max-w-3xl font-display text-5xl leading-[1] sm:text-7xl"
          >
            Details make the <span className="italic text-ivory/60">difference.</span>
          </h2>
        </Reveal>
      </div>
      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 sm:scroll-px-8 sm:px-8 lg:mx-auto lg:grid lg:max-w-[1600px] lg:grid-cols-4 lg:overflow-visible">
        {DETAILS.map((d, i) => (
          <Reveal
            key={d.src}
            delay={i * 0.08}
            className="w-[64vw] max-w-[300px] shrink-0 snap-start lg:w-auto lg:max-w-none"
          >
            <figure>
              <div className="group relative aspect-square overflow-hidden bg-graphite">
                <Image
                  src={d.src}
                  alt={d.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 64vw"
                  className="object-cover grayscale-[0.2] transition-transform duration-[1.6s] ease-cinematic group-hover:scale-110"
                />
              </div>
              <figcaption className="mt-4">
                <p className="label text-ivory">
                  <span className="mr-3 text-fog">0{i + 1}</span>
                  {d.title}
                </p>
                <p className="mt-2 text-sm text-mist">{d.body}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
