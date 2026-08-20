import Reveal from './Reveal'
import { ShieldIcon, LeafIcon, BoltIcon } from './Icons'

const benefits = [
  { icon: ShieldIcon, label: 'Immunsystem' },
  { icon: LeafIcon, label: 'Verdauung' },
  { icon: BoltIcon, label: 'Energie' },
]

export default function BlackSeedSection() {
  return (
    <section id="schwarzkuemmel" className="relative overflow-hidden py-28 sm:py-36">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-gold-500/[0.04] to-transparent" />
      <div className="mx-auto max-w-4xl px-6 text-center">
        <Reveal>
          <span className="section-eyebrow justify-center">
            <span className="gold-line !w-8" /> Hebbat Sawda · حبة سوداء <span className="gold-line !w-8" />
          </span>
          <h2 className="font-serif text-4xl font-semibold text-gold-100 sm:text-5xl">
            Die Schwarzkümmel
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-card mx-auto mt-10 max-w-2xl px-8 py-10 sm:px-12">
            <p dir="rtl" className="font-arabic text-xl leading-loose text-gold-200 sm:text-2xl">
              «الحبة السوداء شفاء من كل داء إلا السام»
            </p>
            <div className="gold-line mx-auto my-5" />
            <p className="font-serif text-lg italic text-gold-100/90 sm:text-xl">
              „In der Schwarzkümmel ist Heilung für jede Krankheit außer dem Tod."
            </p>
            <p className="mt-3 text-xs uppercase tracking-[0.3em] text-gold-400/70">
              Sahih al-Bukhari
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-10 max-w-2xl text-sm leading-relaxed text-gold-100/75 sm:text-base">
            Schwarzkümmel (Nigella sativa) zählt zu den am besten erforschten Heilpflanzen der
            Naturmedizin. Seine Inhaltsstoffe – allen voran Thymoquinon – werden traditionell zur
            Unterstützung von Immunsystem, Verdauung und Energiehaushalt geschätzt.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {benefits.map(({ icon: Icon, label }, i) => (
            <Reveal key={label} delay={0.1 * i}>
              <div className="glass-card flex flex-col items-center gap-3 px-6 py-8">
                <Icon className="h-8 w-8 text-gold-400" />
                <span className="font-serif text-lg text-gold-100">{label}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
