import Image from 'next/image';
import { Reveal } from '@/components/motion/Reveal';

const DETAILS = [
  { src: '/images/photo/detail-monogram.jpg', title: 'The crown monogram', body: 'NS beneath the crown. The mark on every piece.' },
  { src: '/images/photo/detail-contour-lines.jpg', title: 'Contour lines', body: 'Twin silver lines that trace the body.' },
  { src: '/images/photo/detail-tee-chest.jpg', title: 'Chest signature', body: 'Monogram and collection mark, left chest.' },
  { src: '/images/photo/detail-hem-tab.jpg', title: 'Hem tab', body: 'The quiet signature, where only you look.' },
  { src: '/images/photo/detail-box.jpg', title: 'The box', body: 'Black on black, the monogram on the lid.' },
];

export function Details() {
  return (
    <section className="bg-coal py-24 sm:py-36" aria-labelledby="details-title">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8">
        <Reveal>
          <p className="label text-gold">Premium details</p>
          <h2 id="details-title" className="mt-5 max-w-3xl font-display text-5xl leading-[1] sm:text-7xl">
            Details make the <span className="italic text-gold">difference.</span>
          </h2>
        </Reveal>
      </div>
      <div className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 sm:scroll-px-8 sm:px-8 lg:mx-auto lg:grid lg:max-w-[1600px] lg:grid-cols-5 lg:overflow-visible">
        {DETAILS.map((d, i) => (
          <Reveal key={d.src} delay={i * 0.08} className="w-[64vw] max-w-[300px] shrink-0 snap-start lg:w-auto lg:max-w-none">
            <figure>
              <div className="group relative aspect-square overflow-hidden bg-graphite">
                <Image src={d.src} alt={d.title} fill sizes="(min-width: 1024px) 20vw, 64vw" className="object-cover grayscale-[0.2] transition-transform duration-[1.6s] ease-cinematic group-hover:scale-110" />
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
