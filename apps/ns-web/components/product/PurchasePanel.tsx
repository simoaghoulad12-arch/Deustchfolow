'use client';

import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/commerce/types';
import { availability, findVariant } from '@/lib/commerce/catalog';
import { formatPrice } from '@/lib/commerce/provider';
import { useStore } from '@/lib/commerce/store';
import { useLocale } from '@/lib/i18n/context';
import { useCopy } from '@/lib/i18n/copy';
import { productCopy } from '@/lib/i18n/copy/product';
import { colorName, localizeProduct, sizeName } from '@/lib/i18n/products';
import { localizeWorld } from '@/lib/i18n/worlds';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { SizeGuide } from './SizeGuide';
import { WishButton } from './WishButton';

export function PurchasePanel({ product: source }: { product: Product }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useCopy(productCopy).purchase;
  const product = localizeProduct(source, locale);
  const { addLine } = useStore();
  const [color, setColor] = useState(product.colors[0].name);
  const oneSize = product.sizes.length === 1;
  const [size, setSize] = useState<string | null>(oneSize ? product.sizes[0] : null);
  const [needSize, setNeedSize] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [barVisible, setBarVisible] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const sizesRef = useRef<HTMLFieldSetElement>(null);
  const world = localizeWorld(product.world, locale);

  // Sticky mobile bar appears once the primary CTA scrolls out of view.
  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) =>
        entry && setBarVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const stock = availability(product, color, size, locale);
  const soldOut = (s: string) => findVariant(product, color, s)?.inventory === 0;

  const add = (thenCheckout: boolean) => {
    if (!size) {
      setNeedSize(true);
      sizesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    const variant = findVariant(product, color, size);
    if (!variant) return;
    addLine({
      sku: variant.sku,
      slug: product.slug,
      name: source.name,
      world: product.world,
      color,
      size,
      unitPriceCents: product.price.amountCents,
      image: product.images[0].src,
    });
    if (thenCheckout) router.push('/checkout');
  };

  return (
    <div data-world={product.world}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label text-accent">
            {world.name} · {product.line}
          </p>
          <h1 className="mt-3 font-display text-[2.6rem] leading-[1] sm:text-5xl">
            {product.name}
          </h1>
        </div>
        <WishButton slug={product.slug} name={product.name} className="-me-2 -mt-1 shrink-0" />
      </div>
      <p className="mt-4 text-lg tabular-nums">{formatPrice(product.price.amountCents, locale)}</p>
      <p className="mt-3 flex items-center gap-2 text-xs text-mist">
        <span
          aria-hidden
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            stock.tone === 'ok' && 'bg-emerald-400',
            stock.tone === 'low' && 'bg-amber-400',
            stock.tone === 'out' && 'bg-fog',
            stock.tone === 'unknown' && 'bg-accent',
          )}
        />
        {stock.label}
      </p>

      <p className="mt-7 max-w-md text-[15px] leading-relaxed text-ivory/80">{product.story}</p>

      {/* Colour */}
      <fieldset className="mt-9">
        <legend className="label flex w-full justify-between text-mist">
          <span>{t.colour}</span>
          <span className="text-ivory">{colorName(color, locale)}</span>
        </legend>
        <div className="mt-4 flex gap-3">
          {product.colors.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => setColor(c.name)}
              aria-pressed={color === c.name}
              aria-label={colorName(c.name, locale)}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-full border transition-colors',
                color === c.name ? 'border-accent' : 'border-white/15 hover:border-white/40',
              )}
            >
              <span
                className="h-7 w-7 rounded-full border border-white/10"
                style={{ backgroundColor: c.hex }}
              />
            </button>
          ))}
        </div>
      </fieldset>

      {/* Size */}
      {!oneSize && (
        <fieldset ref={sizesRef} className="mt-8">
          <legend className="label flex w-full items-center justify-between text-mist">
            <span className={cn(needSize && !size && 'text-accent')}>
              {needSize && !size ? t.selectSizePrompt : t.size}
            </span>
            <button
              type="button"
              onClick={() => setGuideOpen(true)}
              className="flex items-center gap-2 text-ivory underline-offset-4 hover:underline"
            >
              <Icon name="ruler" className="h-4 w-4" /> {t.sizeGuide}
            </button>
          </legend>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {product.sizes.map((s) => {
              const out = soldOut(s);
              return (
                <button
                  key={s}
                  type="button"
                  disabled={out}
                  onClick={() => {
                    setSize(s);
                    setNeedSize(false);
                  }}
                  aria-pressed={size === s}
                  className={cn(
                    'h-12 border text-xs tracking-[0.12em] transition-colors duration-300',
                    size === s
                      ? 'border-ivory bg-ivory text-ink'
                      : 'border-white/15 text-ivory hover:border-white/50',
                    out && 'cursor-not-allowed text-fog line-through',
                  )}
                >
                  {sizeName(s, locale)}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <div ref={ctaRef} className="mt-8 grid gap-2.5">
        <button type="button" onClick={() => add(false)} className="btn-solid w-full">
          {t.addToBag}
        </button>
        <button type="button" onClick={() => add(true)} className="btn-line w-full">
          {t.buyNow}
        </button>
      </div>

      <ul className="mt-8 grid grid-cols-2 gap-px bg-white/[0.07] text-[11px] leading-snug text-mist">
        {t.info.map(([k, v]) => (
          <li key={k} className="bg-ink px-3 py-3">
            <span className="label block text-ivory/80">{k}</span>
            <span className="mt-1 block">{v}</span>
          </li>
        ))}
      </ul>

      <SizeGuide product={product} open={guideOpen} onClose={() => setGuideOpen(false)} />

      <AnimatePresence>
        {barVisible && (
          <motion.div
            className="safe-bottom fixed inset-x-0 bottom-0 z-30 border-t border-white/[0.07] bg-ink/90 px-4 pt-3 backdrop-blur-xl lg:hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 pb-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{product.name}</p>
                <p className="text-xs tabular-nums text-mist">
                  {formatPrice(product.price.amountCents, locale)}
                  {size ? ` · ${sizeName(size, locale)}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => add(false)}
                className="btn-solid min-h-[48px] px-6"
              >
                {size ? t.addToBag : t.selectSize}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
