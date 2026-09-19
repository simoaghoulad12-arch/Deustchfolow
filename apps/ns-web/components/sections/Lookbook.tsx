import { products } from '@/data/products';
import { PlaceholderArt } from '@/components/ui/PlaceholderArt';

const tiles = [
  { product: products[0]!, span: 'sm:col-span-7 sm:row-span-2', tone: 'ink' as const },
  { product: products[2]!, span: 'sm:col-span-5', tone: 'bone' as const },
  { product: products[4]!, span: 'sm:col-span-5', tone: 'ink' as const },
  { product: products[3]!, span: 'sm:col-span-6', tone: 'ink' as const },
  { product: products[5]!, span: 'sm:col-span-6', tone: 'bone' as const },
];

export function Lookbook() {
  return (
    <section id="lookbook" className="bg-ink px-5 py-24 sm:px-8 sm:py-32">
      <div className="mb-12 flex items-end justify-between">
        <h2 className="font-display text-3xl sm:text-5xl">Editorial</h2>
        <p className="hidden text-xs uppercase tracking-widest2 text-smoke sm:block">Issue 01 — Movement</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {tiles.map(({ product, span, tone }) => (
          <div key={product.slug} className={`relative aspect-[4/5] overflow-hidden ${span}`}>
            <PlaceholderArt category={product.category} tone={tone} className="h-full w-full" showLabel={false} />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void/70 to-transparent p-4">
              <p className="text-xs uppercase tracking-widest2 text-bone">{product.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
