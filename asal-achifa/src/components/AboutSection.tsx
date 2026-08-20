import Reveal from './Reveal'
import { PinIcon } from './Icons'

export default function AboutSection() {
  return (
    <section id="marke" className="relative mx-auto max-w-4xl px-6 py-28 sm:py-36">
      <Reveal className="text-center">
        <span className="section-eyebrow justify-center">
          <span className="gold-line !w-8" /> Herkunft &amp; Handwerk <span className="gold-line !w-8" />
        </span>
        <h2 className="font-serif text-4xl font-semibold text-gold-100 sm:text-5xl">
          Über Asal Achifa
        </h2>
      </Reveal>

      <Reveal delay={0.12}>
        <div className="glass-card mx-auto mt-12 px-8 py-12 text-center sm:px-16">
          <p className="text-base leading-relaxed text-gold-100/80 sm:text-lg">
            Entwickelt von <span className="text-gold-300">Mohammed Agoulat</span>, verbindet Asal
            Achifa das überlieferte Heilwissen der Prophetenmedizin mit moderner
            Qualitätskontrolle. Jede Charge entsteht in <span className="text-gold-300">Salé,
            Marokko</span> – von Hand geprüft, ohne Kompromisse bei Reinheit und Herkunft.
          </p>
          <div className="mx-auto mt-8 flex max-w-md items-center justify-center gap-6 text-xs uppercase tracking-[0.25em] text-gold-400/80 sm:text-sm">
            <span>Tradition</span>
            <span className="h-1 w-1 rounded-full bg-gold-500/60" />
            <span>Reinheit</span>
            <span className="h-1 w-1 rounded-full bg-gold-500/60" />
            <span>Qualität</span>
          </div>
          <div className="mt-8 inline-flex items-center gap-2 text-sm text-gold-200/80">
            <PinIcon className="h-4 w-4 text-gold-400" />
            Salé, Marokko
          </div>
        </div>
      </Reveal>
    </section>
  )
}
