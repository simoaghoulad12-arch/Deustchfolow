import { WORLDS, type World, type WorldId } from '@/lib/brand';
import type { Locale } from './locale';

/** Arabic text for the three worlds. Ids, hex values, logos and image paths stay as they are. */
const AR: Record<
  WorldId,
  {
    name: string;
    headline: string;
    descriptor: string;
    intro: string;
    focus: string[];
    palette: string[];
    imageAlt: string;
  }
> = {
  sports: {
    name: 'الرياضة',
    headline: 'الأداء يبني الحرية.',
    descriptor: 'الأداء · التدريب · الرياضيون',
    intro:
      'أرض التدريب. قطع مصممة للمجموعة والعدو والحصة التي لا يصوّرها أحد — خطوط فضية على الأسود، ولا شيء يبطئك.',
    focus: ['الأداء', 'التدريب', 'الرياضيون'],
    palette: ['أسود', 'فضي', 'أبيض'],
    imageAlt: 'رياضي بقميص NATYSIMO الرياضي وسروال التدريب، في منتصف حصة بالنادي',
  },
  clothing: {
    name: 'الملابس',
    headline: 'الانضباط يبني الحرية.',
    descriptor: 'ستريت وير · أسلوب حياة · ملابس',
    intro:
      'بعد العمل. مونوغرام التاج يخرج إلى الشارع — ذهب على أسود، وعاجي للتباين، مفصّل ليُلبس كل يوم.',
    focus: ['ستريت وير', 'أسلوب الحياة', 'الملابس'],
    palette: ['أسود', 'ذهبي', 'عاجي'],
    imageAlt: 'قميص NATYSIMO الأساسي مطويًا على الإسمنت بجوار علبة هدايا المونوغرام',
  },
  hybrid: {
    name: 'الهجين',
    headline: 'أقوى من الأمس.',
    descriptor: 'النادي · الشارع · كل يوم',
    intro:
      'حيث يلتقي الاثنان. قطع من النادي إلى الشارع تحملك من أول تكرار إلى آخر اجتماع — ذهب وفضة، ومعيار واحد.',
    focus: ['القوة', 'اللياقة', 'الانضباط'],
    palette: ['أسود', 'ذهبي', 'فضي'],
    imageAlt:
      'مؤسس NATYSIMO في شارع كونيغسألي بدوسلدورف، بالقميص الأساسي والشورت وحقيبة الكتف والجوارب',
  },
};

export function localizeWorld(id: WorldId, locale: Locale): World {
  const w = WORLDS[id];
  if (locale === 'en') return w;
  const a = AR[id];
  return {
    ...w,
    name: a.name,
    headline: a.headline,
    descriptor: a.descriptor,
    intro: a.intro,
    focus: a.focus,
    palette: w.palette.map((p, i) => ({ ...p, name: a.palette[i] ?? p.name })),
    image: { ...w.image, alt: a.imageAlt },
  };
}

export function localizedWorlds(locale: Locale): Record<WorldId, World> {
  return {
    sports: localizeWorld('sports', locale),
    clothing: localizeWorld('clothing', locale),
    hybrid: localizeWorld('hybrid', locale),
  };
}
