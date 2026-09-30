import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, products, relatedProducts } from '@/lib/commerce/catalog';
import { WORLDS, BRAND } from '@/lib/brand';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PurchasePanel } from '@/components/product/PurchasePanel';
import { ProductCard } from '@/components/product/ProductCard';
import { Mark } from '@/components/brand/Mark';
import { Reveal } from '@/components/motion/Reveal';
import { setsContaining } from '@/lib/commerce/sets';
import { formatPrice } from '@/lib/commerce/provider';

interface Props {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: Props): Metadata {
  const product = getProduct(params.slug);
  if (!product) return {};
  const world = WORLDS[product.world];
  return {
    title: `${product.name} — ${world.name}`,
    description: product.story,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} — NATYSIMO ${world.name}`,
      description: product.story,
      images: [{ url: product.images[0].src }],
    },
  };
}

export default function ProductPage({ params }: Props) {
  const product = getProduct(params.slug);
  if (!product) notFound();
  const world = WORLDS[product.world];
  const related = relatedProducts(product);
  const hasConcept = product.images.some((i) => i.kind !== 'photo');
  const sets = setsContaining(product.slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `NATYSIMO ${product.name}`,
    description: product.story,
    brand: { '@type': 'Brand', name: BRAND.name },
    image: product.images.map((i) => `${BRAND.url}${i.src}`),
    sku: product.variants[0]?.sku,
    offers: {
      '@type': 'Offer',
      priceCurrency: product.price.currency,
      price: (product.price.amountCents / 100).toFixed(2),
      url: `${BRAND.url}/product/${product.slug}`,
    },
  };

  return (
    <div data-world={product.world} className="pb-10 pt-16 sm:pt-[72px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mx-auto hidden max-w-[1600px] px-8 py-5 lg:block">
        <ol className="label flex gap-3 text-fog">
          <li>
            <Link href="/shop" className="hover:text-ivory">
              Collection 01
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link href={`/worlds/${product.world}`} className="hover:text-ivory">
              {world.name}
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li className="text-ivory/80">{product.name}</li>
        </ol>
      </nav>

      <div className="mx-auto grid max-w-[1600px] lg:grid-cols-[1.35fr_1fr] lg:gap-12 lg:px-8">
        <ProductGallery product={product} />
        <div className="px-5 pt-8 lg:px-0 lg:pt-0">
          <div className="lg:sticky lg:top-28">
            <PurchasePanel product={product} />

            <div className="mt-12 border-t border-white/[0.07]">
              <details className="group border-b border-white/[0.07]" open>
                <summary className="label flex cursor-pointer list-none items-center justify-between py-5">
                  Design details{' '}
                  <span className="text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <ul className="space-y-2.5 pb-6 text-sm text-ivory/80">
                  {product.details.map((d) => (
                    <li key={d} className="flex gap-3">
                      <span className="mt-2 h-px w-3 shrink-0 bg-accent" />
                      {d}
                    </li>
                  ))}
                </ul>
              </details>
              <details className="group border-b border-white/[0.07]">
                <summary className="label flex cursor-pointer list-none items-center justify-between py-5">
                  Fit &amp; material{' '}
                  <span className="text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <dl className="grid grid-cols-[88px_1fr] gap-y-3 pb-6 text-sm">
                  <dt className="text-mist">Fit</dt>
                  <dd className="text-ivory/80">
                    {product.specs?.fit ??
                      'Fit notes and model sizing are published with the launch photography.'}
                  </dd>
                  <dt className="text-mist">Material</dt>
                  <dd className="text-ivory/80">
                    {product.specs?.material ??
                      'Composition confirmed by the supplier and published at launch.'}
                  </dd>
                  <dt className="text-mist">Care</dt>
                  <dd className="text-ivory/80">
                    {product.specs?.care ?? 'Care label details published at launch.'}
                  </dd>
                </dl>
              </details>
              <details className="group border-b border-white/[0.07]">
                <summary className="label flex cursor-pointer list-none items-center justify-between py-5">
                  Delivery &amp; returns{' '}
                  <span className="text-lg transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="space-y-3 pb-6 text-sm leading-relaxed text-ivory/80">
                  <p>
                    Delivery across Morocco, plus Germany and the EU. Rates and delivery times are
                    confirmed at checkout when the store opens.
                  </p>
                  <p>
                    Returns and exchanges follow the policy published before launch.{' '}
                    <Link href="/legal/returns" className="underline underline-offset-4">
                      Returns
                    </Link>{' '}
                    ·{' '}
                    <Link href="/legal/shipping" className="underline underline-offset-4">
                      Delivery
                    </Link>
                  </p>
                </div>
              </details>
            </div>

            {sets.length > 0 && (
              <div className="mt-8">
                <p className="label text-mist">Part of a set</p>
                <ul className="mt-3 space-y-2">
                  {sets.map((set) => (
                    <li key={set.slug}>
                      <Link
                        href={`/sets/${set.slug}`}
                        className="group flex items-center justify-between border border-white/10 px-4 py-4 transition-colors hover:border-accent/50"
                      >
                        <span>
                          <span className="block text-sm">{set.name}</span>
                          <span className="mt-1 block text-xs text-mist">{set.tagline}</span>
                        </span>
                        <span className="text-sm tabular-nums">{formatPrice(set.priceCents)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hasConcept && (
              <p className="mt-6 text-[11px] leading-relaxed text-fog">
                “Product render” and “Concept visual” images are not photographs of the finished
                piece and may differ in detail. Final product photography replaces them at launch.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* World signature band */}
      <section className="mx-auto mt-24 max-w-[1600px] px-5 sm:px-8">
        <Reveal className="flex flex-col items-center gap-6 border-y border-white/[0.07] py-16 text-center">
          <div className="w-20">
            <Mark world={product.world} sizes="80px" />
          </div>
          <p className="label text-accent">NATYSIMO {world.name}</p>
          <p className="max-w-lg font-display text-3xl leading-tight sm:text-4xl">
            {world.headline}
          </p>
          <Link href={`/worlds/${product.world}`} className="btn-line">
            Enter {world.name}
          </Link>
        </Reveal>
      </section>

      <section className="mx-auto mt-20 max-w-[1600px] px-5 sm:px-8" aria-labelledby="related">
        <h2 id="related" className="label text-mist">
          Complete the uniform
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 lg:grid-cols-4 lg:gap-x-5">
          {related.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
