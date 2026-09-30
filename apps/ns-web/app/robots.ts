import type { MetadataRoute } from 'next';
import { BRAND } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/checkout', '/account', '/wishlist'] },
    sitemap: `${BRAND.url}/sitemap.xml`,
  };
}
