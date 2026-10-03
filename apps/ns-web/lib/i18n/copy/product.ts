import type { Copy } from '../copy';

interface ProductCopy {
  purchase: {
    colour: string;
    selectSizePrompt: string;
    size: string;
    sizeGuide: string;
    addToBag: string;
    buyNow: string;
    selectSize: string;
    info: [string, string][];
  };
  guide: { close: string; title: string; note: string; oneSize: string };
  page: {
    breadcrumb: string;
    collection: string;
    designDetails: string;
    fitMaterial: string;
    fit: string;
    material: string;
    care: string;
    fitDefault: string;
    materialDefault: string;
    careDefault: string;
    deliveryReturns: string;
    deliveryText: string;
    returnsText: string;
    returns: string;
    delivery: string;
    partOfSet: string;
    conceptNote: string;
    enter: (world: string) => string;
    complete: string;
  };
  set: {
    the: string;
    inThisSet: string;
    allSets: string;
    separately: string;
    permanent: string;
    oneSize: string;
    sizeLabel: (s: string) => string;
    selectSize: string;
    sizeOf: (name: string) => string;
    addSet: string;
    selectAll: string;
    buyNow: string;
  };
  sets: { title: string; description: string; eyebrow: string; intro: string };
}

export const productCopy: Copy<ProductCopy> = {
  en: {
    purchase: {
      colour: 'Colour',
      selectSizePrompt: 'Select a size',
      size: 'Size',
      sizeGuide: 'Size guide',
      addToBag: 'Add to bag',
      buyNow: 'Buy now',
      selectSize: 'Select size',
      info: [
        ['Delivery', 'Morocco & Europe'],
        ['Size guide', 'Body measurements'],
        ['Returns', 'Policy published at launch'],
        ['Support', 'Direct via Instagram'],
      ],
    },
    guide: {
      close: 'Close size guide',
      title: 'Size guide',
      note: 'Standard body measurements for choosing your size. Garment measurements for each piece are published with the Collection 01 launch. Between sizes? Size up for a relaxed fit, down for a closer one.',
      oneSize: 'One size.',
    },
    page: {
      breadcrumb: 'Breadcrumb',
      collection: 'Collection 01',
      designDetails: 'Design details',
      fitMaterial: 'Fit & material',
      fit: 'Fit',
      material: 'Material',
      care: 'Care',
      fitDefault: 'Fit notes and model sizing are published with the launch photography.',
      materialDefault: 'Composition confirmed by the supplier and published at launch.',
      careDefault: 'Care label details published at launch.',
      deliveryReturns: 'Delivery & returns',
      deliveryText:
        'Delivery across Morocco, plus Germany and the EU. Rates and delivery times are confirmed at checkout when the store opens.',
      returnsText: 'Returns and exchanges follow the policy published before launch.',
      returns: 'Returns',
      delivery: 'Delivery',
      partOfSet: 'Part of a set',
      conceptNote:
        '“Product render” and “Concept visual” images are not photographs of the finished piece and may differ in detail. Final product photography replaces them at launch.',
      enter: (world) => `Enter ${world}`,
      complete: 'Complete the uniform',
    },
    set: {
      the: 'The set',
      inThisSet: 'In this set',
      allSets: 'All sets',
      separately: 'Separately',
      permanent: 'Permanent set price — how this look is sold, not a sale.',
      oneSize: 'One size',
      sizeLabel: (s) => `Size ${s}`,
      selectSize: 'Select size',
      sizeOf: (name) => `${name} size`,
      addSet: 'Add set to bag',
      selectAll: 'Select all sizes',
      buyNow: 'Buy now',
    },
    sets: {
      title: 'The Sets',
      description:
        'Curated NATYSIMO looks — Training Set, Gym-to-Street, Gym Starter and Full Look — at a permanent set price.',
      eyebrow: 'Curated looks',
      intro:
        'Complete looks, built to be worn together. One permanent set price — no countdowns, no sales.',
    },
  },
  ar: {
    purchase: {
      colour: 'اللون',
      selectSizePrompt: 'اختر المقاس',
      size: 'المقاس',
      sizeGuide: 'دليل المقاسات',
      addToBag: 'أضف إلى السلة',
      buyNow: 'اشترِ الآن',
      selectSize: 'اختر المقاس',
      info: [
        ['التوصيل', 'المغرب وأوروبا'],
        ['دليل المقاسات', 'قياسات الجسم'],
        ['الإرجاع', 'تُنشر السياسة عند الإطلاق'],
        ['الدعم', 'مباشرة عبر إنستغرام'],
      ],
    },
    guide: {
      close: 'إغلاق دليل المقاسات',
      title: 'دليل المقاسات',
      note: 'قياسات الجسم القياسية لاختيار مقاسك. تُنشر قياسات كل قطعة مع إطلاق المجموعة 01. بين مقاسين؟ اختر الأكبر لقصّة مريحة، والأصغر لقصّة أقرب إلى الجسم.',
      oneSize: 'مقاس واحد.',
    },
    page: {
      breadcrumb: 'مسار التنقل',
      collection: 'المجموعة 01',
      designDetails: 'تفاصيل التصميم',
      fitMaterial: 'القصّة والخامة',
      fit: 'القصّة',
      material: 'الخامة',
      care: 'العناية',
      fitDefault: 'تُنشر ملاحظات القصّة ومقاس العارض مع صور الإطلاق.',
      materialDefault: 'يؤكد المورّد التركيب وتُنشر المعلومات عند الإطلاق.',
      careDefault: 'تُنشر تفاصيل ملصق العناية عند الإطلاق.',
      deliveryReturns: 'التوصيل والإرجاع',
      deliveryText:
        'التوصيل داخل المغرب، إضافة إلى ألمانيا والاتحاد الأوروبي. تُؤكَّد الأسعار ومدد التوصيل عند الدفع حين يُفتح المتجر.',
      returnsText: 'يتبع الإرجاع والاستبدال السياسة التي تُنشر قبل الإطلاق.',
      returns: 'الإرجاع',
      delivery: 'التوصيل',
      partOfSet: 'ضمن طقم',
      conceptNote:
        'صور «تصميم رقمي للمنتج» و«صورة تصوّرية» ليست صورًا فوتوغرافية للقطعة النهائية وقد تختلف في التفاصيل. تحلّ صور المنتج النهائية محلها عند الإطلاق.',
      enter: (world) => `ادخل عالم ${world}`,
      complete: 'أكمل الزي',
    },
    set: {
      the: 'الطقم',
      inThisSet: 'في هذا الطقم',
      allSets: 'كل الأطقم',
      separately: 'منفردة',
      permanent: 'سعر طقم دائم — هكذا تُباع هذه الإطلالة، وليس تخفيضًا.',
      oneSize: 'مقاس واحد',
      sizeLabel: (s) => `المقاس ${s}`,
      selectSize: 'اختر المقاس',
      sizeOf: (name) => `مقاس ${name}`,
      addSet: 'أضف الطقم إلى السلة',
      selectAll: 'اختر كل المقاسات',
      buyNow: 'اشترِ الآن',
    },
    sets: {
      title: 'الأطقم',
      description:
        'إطلالات NATYSIMO منسّقة — طقم التدريب، من النادي إلى الشارع، بداية النادي والإطلالة الكاملة — بسعر طقم دائم.',
      eyebrow: 'إطلالات منسّقة',
      intro: 'إطلالات كاملة صُمّمت لتُلبس معًا. سعر طقم دائم واحد — بلا عدّ تنازلي وبلا تخفيضات.',
    },
  },
};
