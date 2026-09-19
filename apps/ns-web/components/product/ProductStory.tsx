'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ProductVisual } from '@/components/product/ProductVisual';
import { formatPrice, type Product } from '@/data/products';
import { useCart } from '@/lib/cart-context';

const GALLERY_LABELS = ['Front', 'Back', 'Logo Detail', 'Fabric', 'Editorial'];

export function ProductStory({ product }: { product: Product }) {
  const cart = useCart();
  const [color, setColor] = useState(product.colors[0]!);
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  function handleAddToBag() {
    if (!size) return;
    cart.addLine({
      slug: product.slug,
      name: product.name,
      priceCents: product.priceCents,
      color,
      size,
      image: product.images.hero,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      {/* Immediately usable purchase area — no scroll required. */}
      <div className="grid grid-cols-1 gap-8 px-5 pt-28 sm:px-8 sm:pt-36 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/5] overflow-hidden bg-ink lg:sticky lg:top-28 lg:h-[70svh] lg:aspect-auto">
          <ProductVisual
            src={product.images.hero}
            alt={product.name}
            category={product.category}
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
          />
        </div>

        <div className="lg:pt-4">
          <p className="text-xs uppercase tracking-widest2 text-gold">{product.category}</p>
          <h1 className="mt-2 font-display text-3xl sm:text-4xl">{product.name}</h1>
          <p className="mt-2 text-lg">{formatPrice(product.priceCents)}</p>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-smoke">{product.story}</p>

          <div className="mt-8">
            <p className="mb-2 text-xs uppercase tracking-widest2 text-smoke">
              Color — {color}
            </p>
            <div className="flex gap-2">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={c === color}
                  className={`border px-4 py-2 text-xs uppercase tracking-widest2 transition ${
                    c === color ? 'border-gold text-gold' : 'border-bone/30 hover:border-bone'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs uppercase tracking-widest2 text-smoke">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  aria-pressed={s === size}
                  className={`h-11 w-11 border text-xs transition ${
                    s === size ? 'border-gold text-gold' : 'border-bone/30 hover:border-bone'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddToBag}
            disabled={!size}
            className="mt-8 w-full bg-bone py-4 text-xs uppercase tracking-widest2 text-ink transition hover:bg-gold disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:px-16"
          >
            {added ? 'Added' : size ? 'Add to Bag' : 'Select a size'}
          </button>

          {(product.material || product.care || product.fit) && (
            <dl className="mt-10 space-y-2 border-t border-stone/20 pt-6 text-sm">
              {product.fit ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-smoke">Fit</dt>
                  <dd>{product.fit}</dd>
                </div>
              ) : null}
              {product.material ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-smoke">Material</dt>
                  <dd>{product.material}</dd>
                </div>
              ) : null}
              {product.care ? (
                <div className="flex justify-between gap-4">
                  <dt className="text-smoke">Care</dt>
                  <dd>{product.care}</dd>
                </div>
              ) : null}
            </dl>
          )}
        </div>
      </div>

      {/* Editorial detail story — optional to explore further. */}
      <div className="mt-24 space-y-3 px-5 sm:mt-32 sm:px-8">
        <p className="mb-6 text-xs uppercase tracking-widest2 text-smoke">The Details</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {product.images.gallery.map((src, index) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10%' }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className={`relative aspect-[4/5] overflow-hidden bg-ink ${
                index === 0 ? 'sm:col-span-2 sm:aspect-[16/9]' : ''
              }`}
            >
              <ProductVisual
                src={src}
                alt={`${product.name} — ${GALLERY_LABELS[index] ?? 'detail'}`}
                category={product.category}
                sizes="(min-width: 640px) 50vw, 100vw"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
