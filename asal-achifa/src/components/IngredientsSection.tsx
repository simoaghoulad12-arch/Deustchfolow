import Reveal from './Reveal'
import { HeartIcon, BoneIcon, MoonIcon, DropIcon, BrainIcon } from './Icons'

const ingredients = [
  {
    name: 'Kurkuma',
    arabic: 'الكركم',
    icon: BoneIcon,
    tags: ['Gelenke', 'Herz-Kreislauf'],
    text: 'Traditionell geschätzt für seine entzündungshemmende Wirkung – unterstützt bewegliche Gelenke und einen gesunden Kreislauf.',
  },
  {
    name: 'Ingwer',
    arabic: 'الزنجبيل',
    icon: BrainIcon,
    tags: ['Konzentration', 'Verdauung'],
    text: 'Wärmend und belebend – ein Klassiker der Naturheilkunde für Verdauung und geistige Klarheit.',
  },
  {
    name: 'Propolis',
    arabic: 'العكبر',
    icon: DropIcon,
    tags: ['Wundheilung', 'Schlaf'],
    text: 'Das „Bienenharz" gilt seit Jahrhunderten als natürlicher Schutzstoff für Haut und erholsame Ruhe.',
  },
]

const extraBenefits = ['Immunsystem', 'Energie', 'Herz-Kreislauf', 'Schlaf', 'Wundheilung', 'Konzentration']

export default function IngredientsSection() {
  return (
    <section id="zutaten" className="relative mx-auto max-w-6xl px-6 py-28 sm:py-36">
      <Reveal className="text-center">
        <span className="section-eyebrow justify-center">
          <span className="gold-line !w-8" /> Kraft der Natur <span className="gold-line !w-8" />
        </span>
        <h2 className="font-serif text-4xl font-semibold text-gold-100 sm:text-5xl">
          Weitere Zutaten
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-gold-100/75 sm:text-base">
          Sorgfältig ausgewählte Naturstoffe ergänzen Honig und Schwarzkümmel – für ein
          ganzheitliches Wohlbefinden.
        </p>
      </Reveal>

      <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
        {ingredients.map(({ name, arabic, icon: Icon, tags, text }, i) => (
          <Reveal key={name} delay={0.12 * i}>
            <div className="glass-card group h-full px-7 py-9 transition-shadow duration-300 hover:shadow-gold">
              <div className="flex items-center justify-between">
                <Icon className="h-9 w-9 text-gold-400 transition-transform duration-300 group-hover:scale-110" />
                <span dir="rtl" className="font-arabic text-lg text-gold-400/70">
                  {arabic}
                </span>
              </div>
              <h3 className="mt-6 font-serif text-2xl font-semibold text-gold-100">{name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-gold-100/70">{text}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-gold-500/30 bg-gold-500/5 px-3 py-1 text-[11px] uppercase tracking-wider text-gold-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.3}>
        <div className="glass-card mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 px-8 py-7">
          <HeartIcon className="h-5 w-5 text-gold-500/60" />
          {extraBenefits.map((b) => (
            <span key={b} className="text-xs uppercase tracking-[0.25em] text-gold-200/70 sm:text-sm">
              {b}
            </span>
          ))}
          <MoonIcon className="h-5 w-5 text-gold-500/60" />
        </div>
      </Reveal>
    </section>
  )
}
