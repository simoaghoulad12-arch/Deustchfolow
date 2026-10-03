import { products, SIZE_GUIDES } from '@/lib/commerce/catalog';
import type { Product, ProductCategory } from '@/lib/commerce/types';
import type { Locale } from './locale';

/**
 * Arabic text for Collection 01, keyed by product slug. Only copy changes:
 * prices, SKUs, sizes, images and the "details" that are visible in the
 * imagery stay exactly as in the catalog. Nothing is added that the English
 * copy does not say (no fabric, weight or fit claims).
 */
interface ProductAr {
  name: string;
  line: string;
  story: string;
  details: string[];
  /** Same order as the catalog's images. */
  alts: string[];
}

const AR: Record<string, ProductAr> = {
  'performance-tank': {
    name: 'تانك الأداء',
    line: 'الأداء',
    story:
      'القطعة التي وُلدت فيها العلامة. فتحات إبط عميقة، وخطوط فضية تمتد على طول الجسم، ومونوغرام التاج على الصدر — صُنعت للمجموعة التي لا يصوّرها أحد.',
    details: [
      'مونوغرام التاج على الصدر الأيسر',
      'خطوط فضية أمامًا وعلى الجانبين',
      'فتحات إبط بقصّة السباق',
    ],
    alts: [
      'تانك الأداء في النادي، منظر أمامي',
      'تانك الأداء مفرودًا مع مونوغرام التاج والخطوط الفضية',
      'تانك الأداء وشورت التدريب معًا',
    ],
  },
  'training-shorts': {
    name: 'شورت التدريب',
    line: 'التدريب',
    story:
      'لا شيء زائد. فقط ما تحتاجه الحركة — طبعة خطوط فضية ومونوغرام التاج عند الساق. يتناسق مع تانك الأداء كخط واحد.',
    details: ['مونوغرام التاج عند الساق', 'طبعة خطوط فضية', 'طول فوق الركبة'],
    alts: [
      'شورت التدريب في النادي',
      'شورت التدريب مفرودًا بجانب تانك الأداء',
      'شورت التدريب مع تانك الأداء، منظر المرآة',
    ],
  },
  'compression-long-sleeve': {
    name: 'قميص الضغط بأكمام طويلة',
    line: 'الضغط',
    story:
      'جلد ثانٍ للصباحات الباردة والحصص الثقيلة. قريب من الجسم، ومونوغرام على الصدر، ولا شيء يعلق بك.',
    details: ['قصّة ملاصقة تتبع شكل الجسم', 'مونوغرام التاج على الصدر', 'أكمام كاملة الطول'],
    alts: ['قميص الضغط بأكمام طويلة، صورة تصوّرية'],
  },
  'performance-tee': {
    name: 'تيشيرت الأداء',
    line: 'الأداء',
    story:
      'تيشيرت التدريب بقصّة رياضية عند الكتفين. المونوغرام على الصدر — المعيار نفسه، يتكرر كل يوم.',
    details: ['قصّة رياضية عند الكتفين', 'مونوغرام التاج على الصدر', 'ياقة مستديرة'],
    alts: ['تيشيرت الأداء، صورة تصوّرية'],
  },
  'essential-tee': {
    name: 'التيشيرت الأساسي',
    line: 'الأساسي',
    story:
      'أساس الخزانة. تيشيرت أسود نظيف يحمل علامة التاج NS وكلمة NATYSIMO على الصدر — لُبس في كونيغسألي، وصُنع لكل يوم بعده.',
    details: ['علامة التاج NS مع كلمة NATYSIMO على الصدر الأيسر', 'ياقة مستديرة'],
    alts: [
      'التيشيرت الأساسي في دوسلدورف',
      'التيشيرت الأساسي مطويًا والمونوغرام على الصدر بجانب علبة NATYSIMO',
    ],
  },
  'graphic-tee': {
    name: 'تيشيرت غرافيك',
    line: 'أوفرسايز',
    story:
      'تيشيرت أوفرسايز بتصميم جريء. رسمة موجة من شبك سلكي فوق كلمة NATYSIMO APPAREL — العلامة تقول اسمها بصوت عالٍ.',
    details: ['رسمة موجة من شبك سلكي في الأمام', 'كلمة NATYSIMO APPAREL', 'قصّة واسعة مريحة'],
    alts: ['تيشيرت غرافيك مطويًا يُظهر رسمة الموجة وكلمة NATYSIMO APPAREL'],
  },
  'premium-hoodie': {
    name: 'هودي بريميوم',
    line: 'بريميوم',
    story: 'ثقل هادئ. المونوغرام بلون القماش على الصدر، وجيب كنغر، وقبعة تؤطّر الوجه دون ضجيج.',
    details: ['مونوغرام التاج على الصدر', 'جيب كنغر', 'قبعة بحبل شدّ', 'أساور وحافة بنسيج مضلّع'],
    alts: ['هودي بريميوم بالعاجي، صورة تصوّرية'],
  },
  'signature-cap': {
    name: 'القبعة المميزة',
    line: 'المميز',
    story: 'العلامة في الأمام وفي الوسط. أسود على أسود مع مونوغرام التاج على اللوحة الأمامية.',
    details: ['مونوغرام التاج على اللوحة الأمامية', 'حافة منحنية'],
    alts: ['القبعة المميزة، صورة تصوّرية'],
  },
  jogger: {
    name: 'بنطال الجوغر',
    line: 'الراحة',
    story:
      'للانضباط شكل. ضيّق نحو الكاحل، بحافة مطوية، والمونوغرام عند الفخذ — من الإحماء إلى المشي نحو البيت.',
    details: [
      'ساق مدبّبة وكاحل بحافة مطوية',
      'حبل خصر بأطراف عليها المونوغرام',
      'مونوغرام عند الفخذ',
    ],
    alts: [
      'بنطال الجوغر مع الهودي، صورة تصوّرية',
      'حبل الشدّ بأطرافه المزيّنة بالمونوغرام، تفصيل تصوّري',
    ],
  },
  'gym-bag': {
    name: 'حقيبة النادي',
    line: 'النخبة',
    story: 'كل ما تحتاجه الحصة، ولا شيء زائد. مونوغرام التاج في الأمام وفي الوسط.',
    details: ['مونوغرام التاج في الأمام', 'مقابض للحمل'],
    alts: ['حقيبة النادي، صورة تصوّرية', 'حقيبة النادي محمولة مع هودي بريميوم، صورة تصوّرية'],
  },
  'crossbody-bag': {
    name: 'حقيبة الكتف',
    line: 'المميز',
    story:
      'هاتف ومفاتيح وبطاقة — تُحمل على الجسم من النادي إلى المدينة. علامة التاج NS والكلمة في الأمام.',
    details: ['علامة التاج NS مع كلمة NATYSIMO في الأمام', 'حزام للحمل على الجسم'],
    alts: ['حقيبة الكتف محمولة على الجسم في دوسلدورف'],
  },
  'essential-shorts': {
    name: 'الشورت الأساسي',
    line: 'الأساسي',
    story:
      'شورت الأيام العادية. أسود نظيف، وعلامة NS والكلمة عند الساق — يتناسق مع التيشيرت الأساسي كطقم.',
    details: ['علامة التاج NS مع كلمة NATYSIMO عند الساق'],
    alts: ['الشورت الأساسي مع التيشيرت الأساسي'],
  },
  'crew-socks': {
    name: 'جوارب كرو',
    line: 'الأداء',
    story: 'اللمسة الأخيرة، بنفس المعيار الذي صُنع به كل ما فوقها. علامة التاج NS عند الكاحل.',
    details: ['علامة التاج NS عند الكاحل', 'ارتفاع كرو'],
    alts: ['جوارب كرو مع حذاء رياضي أسود'],
  },
};

const COLORS_AR: Record<string, string> = { Black: 'أسود', Ivory: 'عاجي' };

const CATEGORY_AR: Record<ProductCategory, string> = {
  tank: 'تانك',
  tee: 'تيشيرت',
  'long-sleeve': 'أكمام طويلة',
  shorts: 'شورت',
  hoodie: 'هودي',
  jogger: 'جوغر',
  cap: 'قبعة',
  bag: 'حقيبة',
  socks: 'جوارب',
};

const CATEGORY_EN: Record<ProductCategory, string> = {
  tank: 'Tank',
  tee: 'Tee',
  'long-sleeve': 'Long sleeve',
  shorts: 'Shorts',
  hoodie: 'Hoodie',
  jogger: 'Jogger',
  cap: 'Cap',
  bag: 'Bag',
  socks: 'Socks',
};

export function categoryLabel(category: ProductCategory, locale: Locale): string {
  return (locale === 'ar' ? CATEGORY_AR : CATEGORY_EN)[category];
}

/** "Black" → "أسود". The stored colour name (used in SKUs and carts) is never changed. */
export function colorName(name: string, locale: Locale): string {
  return locale === 'ar' ? (COLORS_AR[name] ?? name) : name;
}

export function sizeName(size: string, locale: Locale): string {
  return locale === 'ar' && size === 'One Size' ? 'مقاس واحد' : size;
}

export function localizeProduct(product: Product, locale: Locale): Product {
  if (locale === 'en') return product;
  const a = AR[product.slug];
  if (!a) return product;
  return {
    ...product,
    name: a.name,
    line: a.line,
    story: a.story,
    details: a.details,
    images: product.images.map((image, i) => ({
      ...image,
      alt: a.alts[i] ?? image.alt,
    })) as Product['images'],
  };
}

export function localizedProducts(locale: Locale): Product[] {
  return products.map((p) => localizeProduct(p, locale));
}

export function localizedProduct(slug: string, locale: Locale): Product | undefined {
  const p = products.find((x) => x.slug === slug);
  return p ? localizeProduct(p, locale) : undefined;
}

type SizeGuide = {
  title: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
};

const GUIDE_AR: Record<string, { title: string; columns: string[] }> = {
  tops: { title: 'القمصان — قياسات الجسم (سم)', columns: ['المقاس', 'الصدر', 'الخصر'] },
  bottoms: { title: 'السراويل — قياسات الجسم (سم)', columns: ['المقاس', 'الخصر', 'الورك'] },
  socks: { title: 'الجوارب — مقاس الحذاء الأوروبي', columns: ['المقاس', 'EU'] },
};

export function sizeGuide(kind: keyof typeof SIZE_GUIDES, locale: Locale): SizeGuide | null {
  const guide = SIZE_GUIDES[kind];
  if (!guide) return null;
  if (locale === 'en') return guide;
  const a = GUIDE_AR[kind];
  return a ? { ...guide, title: a.title, columns: a.columns } : guide;
}
