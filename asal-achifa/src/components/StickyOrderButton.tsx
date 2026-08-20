import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export default function StickyOrderButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9
      const nearFooter =
        window.scrollY + window.innerHeight > document.documentElement.scrollHeight - 520
      setVisible(pastHero && !nearFooter)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href="#kontakt"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="btn-gold fixed bottom-5 left-1/2 z-50 -translate-x-1/2 !px-7 !py-3 text-xs shadow-gold sm:bottom-6 sm:!px-9 sm:!py-3.5 sm:text-sm"
        >
          Jetzt bestellen
        </motion.a>
      )}
    </AnimatePresence>
  )
}
