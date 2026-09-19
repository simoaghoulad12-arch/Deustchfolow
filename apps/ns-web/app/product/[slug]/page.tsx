import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Navigation } from '@/components/navigation/Navigation';
import { Footer } from '@/components/sections/Footer';
import { ProductStory } from '@/components/product/ProductStory';
import { getProductBySlug, products } from '@/data/products';

interface ProductPageProps {
  params: { slug: string };
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export function generateMetadata({ params }: ProductPageProps): Metadata {
  const product = getProductBySlug(params.slug);
  return { title: product ? `${product.name} — NS` : 'NS' };
}

export default function ProductPage({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  if (!product) notFound();

  return (
    <>
      <Navigation />
      <main className="min-h-[80svh] pb-24">
        <ProductStory product={product} />
      </main>
      <Footer />
    </>
  );
}
