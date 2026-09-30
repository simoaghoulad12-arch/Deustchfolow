'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '@/lib/commerce/store';

export function Toast() {
  const { toast } = useStore();
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex justify-center lg:bottom-8"
    >
      <AnimatePresence>
        {toast && (
          <motion.p
            key={toast}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="label border border-white/10 bg-graphite/95 px-5 py-3 text-ivory backdrop-blur"
          >
            {toast}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
