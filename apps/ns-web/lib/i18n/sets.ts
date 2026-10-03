import type { ProductSet } from '@/lib/commerce/sets';
import type { Locale } from './locale';

/** Arabic text for the curated sets, keyed by slug. Prices and items stay in sets.ts. */
const AR: Record<string, { name: string; tagline: string; story: string; alt: string }> = {
  'training-set': {
    name: 'طقم التدريب',
    tagline: 'تانك + شورت التدريب',
    story: 'الزي الذي وُلدت فيه العلامة. خط واحد من الأعلى إلى الأسفل — خطوط فضية على الأسود.',
    alt: 'تانك الأداء وشورت التدريب مفرودين',
  },
  'gym-to-street': {
    name: 'من النادي إلى الشارع',
    tagline: 'تيشيرت + شورت + حقيبة كتف + جوارب',
    story:
      'تمامًا كما لُبس في كونيغسألي: التيشيرت والشورت الأساسيان وحقيبة الكتف وجوارب كرو. من آخر مجموعة تمرين إلى المدينة.',
    alt: 'إطلالة «من النادي إلى الشارع» كاملة في دوسلدورف',
  },
  'gym-starter': {
    name: 'بداية النادي',
    tagline: 'تيشيرت الأداء + شورت التدريب + جوارب',
    story: 'كل ما تحتاجه للحصة الأولى، ولكل حصة بعدها.',
    alt: 'تيشيرت الأداء وشورت التدريب، صورة تصوّرية',
  },
  'full-look': {
    name: 'الإطلالة الكاملة',
    tagline: 'هودي بريميوم + جوغر',
    story: 'الطبقة للمشي إلى النادي، وللصباحات الباردة، ولأيام الراحة.',
    alt: 'الهودي والجوغر معًا، صورة تصوّرية',
  },
};

export function localizeSet(set: ProductSet, locale: Locale): ProductSet {
  if (locale === 'en') return set;
  const a = AR[set.slug];
  if (!a) return set;
  return {
    ...set,
    name: a.name,
    tagline: a.tagline,
    story: a.story,
    image: { ...set.image, alt: a.alt },
  };
}

/** "طقم التدريب" stays as is; the others get the word "طقم" in front. */
export function setTitleFor(set: ProductSet, locale: Locale): string {
  if (locale === 'en') return /\bset$/i.test(set.name) ? set.name : `${set.name} Set`;
  return set.name.startsWith('طقم') ? set.name : `طقم ${set.name}`;
}
