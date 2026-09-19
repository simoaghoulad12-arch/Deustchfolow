import { getProductBySlug } from '@/data/products';
import { ProductVisual } from '@/components/product/ProductVisual';

const tiles = [
  { product: getProductBySlug('ns-tanktop-performance')!, span: 'sm:col-span-7 sm:row-span-2' },
  { product: getProductBySlug('ns-hoodie-premium')!, span: 'sm:col-span-5' },
  { product: getProductBySlug('ns-shorts-training')!, span: 'sm:col-span-5' },
  { product: getProductBySlug('ns-jogger-comfort')!, span: 'sm:col-span-6' },
  { product: getProductBySlug('ns-gym-bag-elite')!, span: 'sm:col-span-6' },
];

export function Lookbook() {
  return (
    <section id="lookbook" className="bg-ink px-5 py-24 sm:px-8 sm:py-32">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-display text-3xl sm:text-5xl">Editorial</h2>
        <p className="hidden text-xs uppercase tracking-widest2 text-smoke sm:block">Issue 01 — Movement</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {tiles.map(({ product, span }) => (
          <div key={product.slug} className={`relative aspect-[4/5] overflow-hidden ${span}`}>
            <ProductVisual
              src={product.images.hero}
              alt={product.name}
              category={product.category}
              sizes="(min-width: 640px) 55vw, 100vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/70 to-transparent p-4">
              <p className="text-xs uppercase tracking-widest2 text-bone">{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
