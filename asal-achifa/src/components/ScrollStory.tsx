import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import HoneyBottle from './HoneyBottle'
import SeedParticles from './SeedParticles'

export default function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  })

  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.14], [0, -60])
  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <section ref={containerRef} className="relative h-[380vh]">
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        {/* Hero copy, fades as user starts scrolling */}
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="pointer-events-none absolute top-[4%] z-20 flex w-full flex-col items-center px-6 text-center sm:top-[6%]"
        >
          <p dir="rtl" className="font-arabic mb-2 text-base text-gold-300/90 sm:text-lg">
            بسم الله الرحمن الرحيم
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight text-gold-100 sm:text-5xl md:text-6xl">
            Asal Achifa
          </h1>
          <p dir="rtl" className="font-arabic gold-text mt-1 text-xl sm:text-3xl">
            عسل الشفاء
          </p>
          <div className="gold-line my-3" />
          <p className="max-w-md text-xs font-light tracking-wide text-gold-100/75 sm:text-base">
            100% natürlicher Honig mit Schwarzkümmel &amp; Schwarzkümmelöl
          </p>
          <a href="#honig" className="btn-gold pointer-events-auto mt-5 !px-6 !py-2.5 text-[11px] sm:mt-6 sm:!px-7 sm:!py-3 sm:text-xs">
            Jetzt entdecken
          </a>
        </motion.div>

        {/* Bottle + honey + seeds, pinned in the lower two-thirds of the viewport */}
        <div className="relative flex h-full w-full items-center justify-center pt-[30vh] sm:pt-[26vh]">
          <HoneyBottle progress={scrollYProgress} />
          <SeedParticles progress={scrollYProgress} />
        </div>

        {/* Edge callouts: honig, then schwarzkümmel.
            Positioning/centering lives on the outer (non-motion) wrapper; the inner
            motion.div only handles opacity/x-slide, since Framer's `x` writes a
            transform inline style that would otherwise clobber a centering
            translate-x class on the same element. */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 bottom-8 z-20 w-[88vw] max-w-[300px] -translate-x-1/2 sm:left-8 sm:top-1/2 sm:bottom-auto sm:w-[86vw] sm:translate-x-0 sm:-translate-y-1/2 lg:left-16">
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0.28, 0.34, 0.48, 0.54], [0, 1, 1, 0]),
                x: useTransform(scrollYProgress, [0.28, 0.36], [-40, 0]),
              }}
              className="glass-card pointer-events-auto p-5 sm:p-6"
            >
              <span className="section-eyebrow !mb-2 !text-[10px]">01 · Reiner Ursprung</span>
              <h3 className="font-serif text-2xl font-semibold text-gold-200 sm:text-3xl">Der Honig</h3>
              <div className="gold-line my-3" />
              <p className="text-sm leading-relaxed text-gold-100/80 sm:text-[15px]">
                Traditioneller marokkanischer Naturhonig aus ausgewählten Blüten – 100% natürlich,
                ohne Zusatz- oder Konservierungsstoffe.
              </p>
            </motion.div>
          </div>

          <div className="absolute left-1/2 bottom-8 z-20 w-[88vw] max-w-[300px] -translate-x-1/2 sm:left-auto sm:right-8 sm:top-1/2 sm:bottom-auto sm:w-[86vw] sm:translate-x-0 sm:-translate-y-1/2 lg:right-16">
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0.58, 0.66, 0.8, 0.88], [0, 1, 1, 0]),
                x: useTransform(scrollYProgress, [0.58, 0.66], [40, 0]),
              }}
              className="glass-card pointer-events-auto p-5 sm:p-6"
            >
              <span className="section-eyebrow !mb-2 !text-[10px]">02 · Hebbat Sawda</span>
              <h3 className="font-serif text-2xl font-semibold text-gold-200 sm:text-3xl">Schwarzkümmel</h3>
              <div className="gold-line my-3" />
              <p className="text-sm leading-relaxed text-gold-100/80 sm:text-[15px]">
                „In der Schwarzkümmel ist Heilung für jede Krankheit außer dem Tod." – Sahih al-Bukhari
              </p>
            </motion.div>
          </div>
        </div>

        {/* Quran verse, appears near the end of the pinned story */}
        <motion.div
          style={{
            opacity: useTransform(scrollYProgress, [0.82, 0.92], [0, 1]),
          }}
          className="pointer-events-none absolute bottom-[9%] z-10 flex w-full flex-col items-center px-6 text-center sm:bottom-[7%]"
        >
          <p dir="rtl" className="font-arabic text-xl text-gold-200 sm:text-2xl">
            وَفِي الشِّفَاءِ مِن كُلِّ دَاءٍ
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gold-400/70">Sure An-Nahl, 69</p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 text-gold-300/70"
        >
          <span className="text-[10px] uppercase tracking-[0.3em]">Scrollen</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            className="h-8 w-5 rounded-full border border-gold-400/50"
          >
            <motion.div
              animate={{ y: [0, 10, 0], opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="mx-auto mt-1.5 h-1.5 w-1.5 rounded-full bg-gold-300"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
