import { getProductBySlug } from '@/data/products';
import { ProductVisual } from '@/components/product/ProductVisual';

/**
 * Explicit heights per row, not aspect-ratio-per-cell — mixing aspect-ratio
 * with differently-sized grid columns (and row-span) produces mismatched
 * implicit row tracks, which used to break this layout badly. Varied
 * aspect ratios across cells of equal height is how real editorial bento
 * grids work anyway.
 */
const ROW_1_HEIGHT = 'aspect-[4/5] sm:aspect-auto sm:h-[420px] lg:h-[560px]';
const ROW_2_HEIGHT = 'aspect-[4/5] sm:aspect-auto sm:h-[300px] lg:h-[380px]';

const tiles = [
  { product: getProductBySlug('ns-tanktop-performance')!, span: 'sm:col-span-7', height: ROW_1_HEIGHT },
  { product: getProductBySlug('ns-hoodie-premium')!, span: 'sm:col-span-5', height: ROW_1_HEIGHT },
  { product: getProductBySlug('ns-shorts-training')!, span: 'sm:col-span-4', height: ROW_2_HEIGHT },
  { product: getProductBySlug('ns-jogger-comfort')!, span: 'sm:col-span-4', height: ROW_2_HEIGHT },
  { product: getProductBySlug('ns-gym-bag-elite')!, span: 'sm:col-span-4', height: ROW_2_HEIGHT },
];

export function Lookbook() {
  return (
    <section id="lookbook" className="bg-ink px-5 py-24 sm:px-8 sm:py-32">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-display text-3xl sm:text-5xl">Editorial</h2>
        <p className="hidden text-xs uppercase tracking-widest2 text-smoke sm:block">Issue 01 — Movement</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {tiles.map(({ product, span, height }) => (
          <div key={product.slug} className={`relative overflow-hidden ${height} ${span}`}>
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
