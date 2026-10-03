import type { Copy } from '../copy';

interface CatalogUi {
  kind: { render: string; concept: string };
  roles: Record<string, string>;
  colours: (names: string) => string;
  pieces: (n: number) => string;
  separately: string;
  wishRemove: (name: string) => string;
  wishSave: (name: string) => string;
  galleryImages: (name: string) => string;
}

export const catalogUi: Copy<CatalogUi> = {
  en: {
    kind: { render: 'Product render', concept: 'Concept visual' },
    roles: {
      model: 'On body',
      front: 'Front',
      back: 'Back',
      detail: 'Detail',
      flatlay: 'Flat lay',
      lifestyle: 'Lifestyle',
    },
    colours: (names) => `Colours: ${names}`,
    pieces: (n) => `${n} pieces`,
    separately: 'separately',
    wishRemove: (name) => `Remove ${name} from wishlist`,
    wishSave: (name) => `Save ${name} to wishlist`,
    galleryImages: (name) => `${name} images`,
  },
  ar: {
    kind: { render: 'تصميم رقمي للمنتج', concept: 'صورة تصوّرية' },
    roles: {
      model: 'على الجسم',
      front: 'الأمام',
      back: 'الخلف',
      detail: 'تفصيل',
      flatlay: 'مفرود',
      lifestyle: 'أسلوب حياة',
    },
    colours: (names) => `الألوان: ${names}`,
    pieces: (n) => `${n} قطع`,
    separately: 'منفردة',
    wishRemove: (name) => `إزالة ${name} من المفضلة`,
    wishSave: (name) => `حفظ ${name} في المفضلة`,
    galleryImages: (name) => `صور ${name}`,
  },
};
