import Reveal from './Reveal'

export default function HoneySection() {
  return (
    <section id="honig" className="relative mx-auto max-w-5xl px-6 py-28 sm:py-36">
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <span className="section-eyebrow">
            <span className="gold-line !w-8" /> Reiner Ursprung
          </span>
          <h2 className="font-serif text-4xl font-semibold text-gold-100 sm:text-5xl">
            Der Honig
          </h2>
          <p className="mt-6 text-base leading-relaxed text-gold-100/75 sm:text-lg">
            Asal Achifa beginnt mit traditionellem <span className="text-gold-300">marokkanischem
            Naturhonig</span> – handverlesen von Imkern, die ihr Wissen über Generationen
            weitergeben. Ausgewählte Blüten, ein mildes Klima und geduldige Handarbeit ergeben
            einen Honig, der so bleibt, wie ihn die Natur vorgesehen hat.
          </p>
          <ul className="mt-8 space-y-3">
            {[
              '100% natürlich, ohne Zusatzstoffe',
              'Keine Konservierungsstoffe',
              'Traditionelle Ernte aus ausgewählten Blüten',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-gold-100/80 sm:text-base">
                <span className="h-1.5 w-1.5 rounded-full bg-gold-400 shadow-gold-sm" />
                {item}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass-card relative mx-auto aspect-square w-full max-w-sm overflow-hidden p-8">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold-400/20 blur-3xl" />
            <svg viewBox="0 0 200 200" className="relative h-full w-full">
              <defs>
                <linearGradient id="dropGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f3d98a" />
                  <stop offset="100%" stopColor="#a8681f" />
                </linearGradient>
              </defs>
              <path
                d="M100 30c30 40 55 68 55 98a55 55 0 1 1-110 0c0-30 25-58 55-98z"
                fill="url(#dropGrad2)"
                opacity="0.9"
              />
              <ellipse cx="80" cy="120" rx="14" ry="20" fill="#fff" opacity="0.25" />
            </svg>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
