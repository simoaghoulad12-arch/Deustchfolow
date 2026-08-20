import Reveal from './Reveal'
import { MailIcon, PinIcon, InstagramIcon, TikTokIcon, FacebookIcon } from './Icons'

function MoroccanStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        {Array.from({ length: 8 }, (_, i) => (
          <rect
            key={i}
            x="30"
            y="30"
            width="40"
            height="40"
            transform={`rotate(${i * 22.5} 50 50)`}
          />
        ))}
        <circle cx="50" cy="50" r="46" strokeOpacity="0.4" />
      </g>
    </svg>
  )
}

export default function ContactFooter() {
  return (
    <footer id="kontakt" className="relative overflow-hidden pt-28 sm:pt-36">
      <MoroccanStar className="pointer-events-none absolute left-1/2 top-8 h-[420px] w-[420px] -translate-x-1/2 text-gold-500/[0.06]" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <Reveal>
          <p dir="rtl" className="font-arabic gold-text text-3xl sm:text-4xl">
            عسل الشفاء
          </p>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-gold-100 sm:text-4xl">
            Bereit für Asal Achifa?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-sm text-gold-100/70 sm:text-base">
            Schreib uns – wir melden uns persönlich bei dir.
          </p>
          <a href="mailto:simoaghoulad12@gmail.com" className="btn-gold mt-8 inline-flex">
            Jetzt bestellen
          </a>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="glass-card mx-auto mt-16 grid grid-cols-1 gap-8 px-8 py-10 text-left sm:grid-cols-2 sm:px-12">
            <div>
              <span className="section-eyebrow !mb-3">Standort</span>
              <div className="flex items-start gap-3 text-sm text-gold-100/80">
                <PinIcon className="mt-0.5 h-5 w-5 shrink-0 text-gold-400" />
                <div>
                  <p className="text-gold-200">Salé, Marokko</p>
                  <p className="mt-1 text-gold-100/60">
                    Community &amp; Basis auch in Darmstadt / Frankfurt, Deutschland
                  </p>
                </div>
              </div>
            </div>
            <div>
              <span className="section-eyebrow !mb-3">Kontakt</span>
              <a
                href="mailto:simoaghoulad12@gmail.com"
                className="flex items-center gap-3 text-sm text-gold-100/80 transition-colors hover:text-gold-300"
              >
                <MailIcon className="h-5 w-5 shrink-0 text-gold-400" />
                simoaghoulad12@gmail.com
              </a>
              <div className="mt-5 flex items-center gap-4">
                {[InstagramIcon, TikTokIcon, FacebookIcon].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    aria-label="Social Media"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gold-500/30 text-gold-300 transition-colors hover:border-gold-400 hover:text-gold-200"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.25}>
          <div className="mt-16 flex flex-col items-center gap-2 border-t border-gold-500/10 py-10 text-xs text-gold-100/40">
            <p>© {new Date().getFullYear()} Asal Achifa · عسل الشفاء</p>
            <p>Entwickelt von Mohammed Agoulat · Salé, Marokko</p>
          </div>
        </Reveal>
      </div>
    </footer>
  )
}
