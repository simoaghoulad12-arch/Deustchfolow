'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Logo } from '@/components/brand/Logo';
import { useReducedMotion } from '@/lib/use-reduced-motion';

const SESSION_KEY = 'ns-intro-seen';

export function IntroExperience() {
  const [active, setActive] = useState(true);
  const [ready, setReady] = useState(false);
  const [entering, setEntering] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (window.sessionStorage.getItem(SESSION_KEY)) {
      setActive(false);
      return;
    }
    const timer = window.setTimeout(() => setReady(true), reducedMotion ? 200 : 1400);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);

  function handleEnter() {
    setEntering(true);
    window.sessionStorage.setItem(SESSION_KEY, '1');
    window.setTimeout(() => setActive(false), reducedMotion ? 150 : 900);
  }

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          className="film-grain fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-void"
          exit={{ opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div
            className="h-24 w-24 text-bone sm:h-32 sm:w-32"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: entering ? (reducedMotion ? 1 : 14) : 1,
            }}
            transition={{
              opacity: { duration: reducedMotion ? 0.15 : 1.2, ease: 'easeOut' },
              scale: entering
                ? { duration: reducedMotion ? 0.15 : 0.9, ease: [0.7, 0, 0.84, 0] }
                : { duration: 0.15 },
            }}
          >
            <Logo variant="hero" />
          </motion.div>

          <AnimatePresence>
            {ready && !entering ? (
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6 }}
                onClick={handleEnter}
                className="mt-10 text-xs uppercase tracking-widest2 text-smoke transition hover:text-gold"
              >
                Enter
              </motion.button>
            ) : null}
          </AnimatePresence>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
