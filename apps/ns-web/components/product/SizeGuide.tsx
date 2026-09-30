'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { SIZE_GUIDES } from '@/lib/commerce/catalog';
import type { Product } from '@/lib/commerce/types';
import { Icon } from '@/components/ui/Icon';

export function SizeGuide({ product, open, onClose }: { product: Product; open: boolean; onClose: () => void }) {
  const guide = SIZE_GUIDES[product.sizeGuide];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button type="button" aria-label="Close size guide" className="fixed inset-0 z-50 bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Size guide"
            className="safe-bottom pointer-events-auto max-h-[85svh] w-full overflow-y-auto border-t border-white/10 bg-coal px-5 pb-8 pt-5 sm:w-[520px] sm:border"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between">
              <p className="label">Size guide</p>
              <button type="button" onClick={onClose} className="-mr-2 flex h-11 w-11 items-center justify-center" aria-label="Close size guide">
                <Icon name="close" />
              </button>
            </div>
            {guide ? (
              <>
                <p className="mt-4 font-display text-2xl">{guide.title}</p>
                <table className="mt-6 w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {guide.columns.map((c) => (
                        <th key={c} scope="col" className="label py-3 font-medium text-mist">
                          {c}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guide.rows.map((row) => (
                      <tr key={row[0]} className="border-b border-white/[0.06]">
                        {row.map((cell, i) => (
                          <td key={i} className={`py-3 tabular-nums ${i === 0 ? 'font-medium' : 'text-ivory/80'}`}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-6 text-xs leading-relaxed text-mist">
                  Standard body measurements for choosing your size. Garment measurements for each piece are published with the Collection 01 launch. Between sizes? Size up for a relaxed fit, down for a closer one.
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-mist">One size.</p>
            )}
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
