import type { Metadata } from 'next';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/sections/Footer';
import { ProductCard } from '@/components/product/ProductCard';
import { products } from '@/data/products';

export const metadata: Metadata = {
  title: 'Shop — NS',
};

export default function ShopPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-[80svh] px-5 pb-24 pt-28 sm:px-8 sm:pt-36">
        <h1 className="mb-10 font-display text-3xl sm:text-5xl">Shop</h1>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
