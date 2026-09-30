import type { MetadataRoute } from 'next';
import { BRAND, WORLD_ORDER } from '@/lib/brand';
import { products } from '@/lib/commerce/catalog';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = BRAND.url;
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, priority: 1 },
    { url: `${base}/shop`, lastModified: now, priority: 0.9 },
    { url: `${base}/story`, lastModified: now, priority: 0.6 },
    ...WORLD_ORDER.map((id) => ({ url: `${base}/worlds/${id}`, lastModified: now, priority: 0.8 })),
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: now, priority: 0.7 })),
  ];
}
