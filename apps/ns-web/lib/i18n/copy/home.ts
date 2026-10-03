import type { Copy } from '../copy';

interface Tile {
  alt: string;
  label: string;
}

interface Home {
  tagline: string;
  pillars: string[];
  journey: string[];
  hero: {
    label: string;
    alt: string;
    markAlt: string;
    pillars: string;
    shop: string;
    worlds: string;
    scroll: string;
    footer: string;
  };
  worlds: {
    eyebrow: string;
    title: string;
    note: string;
    enterAria: (world: string) => string;
    pieces: (n: number) => string;
    palette: string;
    enter: (world: string) => string;
  };
  collection: {
    eyebrow: (n: number) => string;
    title: string;
    viewAll: string;
  };
  sets: { eyebrow: string; title: string; all: string };
  manifesto: {
    eyebrow: string;
    /** The word wrapped in gold italics is `highlight`; `lines[1]` contains `{h}`. */
    lines: [string, string, string, string];
    highlight: string;
    cards: [string, string][];
  };
  anatomy: {
    eyebrow: string;
    title: string;
    intro: string;
    alt: string;
    cta: string;
    points: { title: string; body: string }[];
  };
  story: {
    eyebrow: string;
    lines: [string, string];
    p1: (handle: string) => string;
    p2: string;
    quoteGloss: string;
    cta: string;
    alt: string;
    captionPlace: string;
    captionItems: string;
  };
  lifestyle: { eyebrow: string; text: string; tiles: Tile[] };
  details: {
    eyebrow: string;
    title: [string, string];
    items: { title: string; body: string }[];
  };
  community: {
    eyebrow: string;
    text: (label: string) => string;
    follow: string;
    viewOnInstagram: (alt: string) => string;
    feedAlts: string[];
  };
  final: { lines: [string, string]; shop: string; story: string };
  shop: {
    title: string;
    description: string;
    eyebrow: string;
    filterAria: string;
    all: string;
    intro: (n: number) => string;
  };
  collectionPage: {
    description: (n: number) => string;
    eyebrow: string;
    lines: [string, string];
    text: (n: number) => string;
    cta: string;
  };
}

export const home: Copy<Home> = {
  en: {
    tagline: 'Discipline builds freedom.',
    pillars: ['Performance.', 'Identity.', 'Lifestyle.'],
    journey: ['From the gym.', 'To the street.', 'To life.'],
    hero: {
      label: 'NATYSIMO',
      alt: 'NATYSIMO athlete in the Performance Tank, training floor',
      markAlt: 'NATYSIMO crown monogram',
      pillars: 'Pillars',
      shop: 'Shop Collection',
      worlds: 'Explore Worlds',
      scroll: 'Scroll',
      footer: 'Collection 01 — Sports · Clothing · Hybrid',
    },
    worlds: {
      eyebrow: 'Three worlds · One house',
      title: 'Choose your world.',
      note: 'Three worlds, not three brands — each with its own mark and its own metal, one standard.',
      enterAria: (world) => `Enter NATYSIMO ${world}`,
      pieces: (n) => `${n} pieces`,
      palette: 'Palette',
      enter: (world) => `Enter ${world}`,
    },
    collection: {
      eyebrow: (n) => `Chapter one · ${n} pieces`,
      title: 'Collection 01',
      viewAll: 'View all',
    },
    sets: { eyebrow: 'Curated looks', title: 'The Sets.', all: 'All sets' },
    manifesto: {
      eyebrow: 'More than just clothes',
      lines: ['A mindset,', 'built from {h},', 'hard work and the will', 'never to stand still.'],
      highlight: 'discipline',
      cards: [
        [
          'Performance.',
          'Built on the training floor. Every piece earns its place in the session first.',
        ],
        [
          'Identity.',
          'The crown monogram is a standard, not a decoration. You wear what you’ve earned.',
        ],
        [
          'Lifestyle.',
          'The discipline doesn’t end when the session does. Neither does the uniform.',
        ],
      ],
    },
    anatomy: {
      eyebrow: 'Product anatomy · The Training Set',
      title: 'Tank & Shorts.',
      intro:
        'The set NATYSIMO was built in, as worn. Five details, each one deliberate — tap a number to read the garment.',
      alt: 'The Performance Tank and Training Shorts worn in the gym',
      cta: 'Shop the Training Set',
      points: [
        {
          title: 'Crown monogram',
          body: 'The intertwined NS beneath the crown, left chest. The mark every piece is built around.',
        },
        {
          title: 'Contour lines',
          body: 'Silver lines trace the body from the armhole down — the signature of the Sports world.',
        },
        {
          title: 'Racer cut',
          body: 'Deep armholes and narrow straps, cut to leave the shoulders free.',
        },
        {
          title: 'Contour print',
          body: 'The same silver line language carried onto the Training Shorts.',
        },
        {
          title: 'Leg monogram',
          body: 'The crown monogram at the leg of the shorts — the set reads as one line.',
        },
      ],
    },
    story: {
      eyebrow: 'Our story',
      lines: ['Same dreams.', 'Different work ethic.'],
      p1: (handle) =>
        `NATYSIMO started as ${handle}: training, filmed and shared between Morocco and Germany. No shortcuts — sessions, reels, a training plan, and a community that grew around the discipline.`,
      p2: 'The clothing is the next step of the same mindset. The gym is where it starts. The street is where it shows.',
      quoteGloss: '“The decision comes back to you.”',
      cta: 'Read the story',
      alt: 'The NATYSIMO founder on Königsallee, Düsseldorf, wearing the Essential Tee, shorts, crossbody bag and socks',
      captionPlace: 'Königsallee, Düsseldorf',
      captionItems: 'Essential Tee · Essential Shorts',
    },
    lifestyle: {
      eyebrow: 'Lifestyle',
      text: 'From the first rep to the last meeting. One uniform, worn with intent — gym, street, everyday.',
      tiles: [
        { alt: 'Performance Tank and Training Shorts in the gym', label: 'Train' },
        { alt: 'Hoodie and Jogger, concept visual', label: 'Grow' },
        { alt: 'Graphic Tee flat lay', label: 'Wear' },
        { alt: 'Ivory Premium Hoodie with Gym Bag, concept visual', label: 'Evolve' },
        { alt: 'Compression Long Sleeve, concept visual', label: 'Repeat' },
      ],
    },
    details: {
      eyebrow: 'Premium details',
      title: ['Details make the ', 'difference.'],
      items: [
        {
          title: 'The crown monogram',
          body: 'Intertwined NS beneath the crown, left chest of the Performance Tank.',
        },
        { title: 'Contour lines', body: 'Silver lines and the monogram on the Training Shorts.' },
        {
          title: 'Mark & wordmark',
          body: 'NS, crown and NATYSIMO — on the Essential Tee and Crossbody Bag.',
        },
        {
          title: 'Down to the socks',
          body: 'The same mark at the ankle. Every piece carries it.',
        },
      ],
    },
    community: {
      eyebrow: 'The discipline, documented',
      text: (label) =>
        `Where it started, and where it happens every day. A ${label} community, most of it in Morocco.`,
      follow: 'Follow on Instagram',
      viewOnInstagram: (alt) => `${alt} — view on Instagram`,
      feedAlts: [
        'Training floor, Performance Tank',
        'Königsallee, Düsseldorf',
        'Essential Tee and Crossbody Bag, worn',
        'Performance Tank and Training Shorts',
      ],
    },
    final: {
      lines: ['Discipline', 'builds freedom.'],
      shop: 'Shop Collection 01',
      story: 'The story',
    },
    shop: {
      title: 'Collection 01',
      description:
        'NATYSIMO Collection 01 — performance, streetwear and hybrid pieces across the Sports, Clothing and Hybrid worlds.',
      eyebrow: 'Chapter one',
      filterAria: 'Filter by world',
      all: 'All',
      intro: (n) => `${n} pieces across three worlds. One standard.`,
    },
    collectionPage: {
      description: (n) =>
        `NATYSIMO Collection 01 — ${n} pieces across Sports, Clothing and Hybrid. Performance tanks, training shorts, tees, hoodies, joggers and bags.`,
      eyebrow: 'Chapter one',
      lines: ['Collection 01', 'Built for more.'],
      text: (n) =>
        `The first chapter: ${n} pieces, three worlds, one standard. Built on the training floor, made to be worn beyond it.`,
      cta: 'Shop all pieces',
    },
  },
  ar: {
    tagline: 'الانضباط يبني الحرية.',
    pillars: ['الأداء.', 'الهوية.', 'أسلوب الحياة.'],
    journey: ['من النادي.', 'إلى الشارع.', 'إلى الحياة.'],
    hero: {
      label: 'NATYSIMO',
      alt: 'رياضي NATYSIMO بتانك الأداء على أرضية التدريب',
      markAlt: 'مونوغرام تاج NATYSIMO',
      pillars: 'الركائز',
      shop: 'تسوّق المجموعة',
      worlds: 'استكشف العوالم',
      scroll: 'مرّر',
      footer: 'المجموعة 01 — رياضة · ملابس · هجين',
    },
    worlds: {
      eyebrow: 'ثلاثة عوالم · بيت واحد',
      title: 'اختر عالمك.',
      note: 'ثلاثة عوالم، لا ثلاث علامات — لكل عالم شعاره ومعدنه، ومعيار واحد.',
      enterAria: (world) => `ادخل عالم NATYSIMO ${world}`,
      pieces: (n) => `${n} قطع`,
      palette: 'لوحة الألوان',
      enter: (world) => `ادخل عالم ${world}`,
    },
    collection: {
      eyebrow: (n) => `الفصل الأول · ${n} قطعة`,
      title: 'المجموعة 01',
      viewAll: 'عرض الكل',
    },
    sets: { eyebrow: 'إطلالات منسّقة', title: 'الأطقم.', all: 'كل الأطقم' },
    manifesto: {
      eyebrow: 'أكثر من مجرد ملابس',
      lines: ['عقلية', 'مبنية على {h}', 'والعمل الجاد', 'وإرادة لا تقف في مكانها.'],
      highlight: 'الانضباط',
      cards: [
        ['الأداء.', 'وُلد على أرضية التدريب. كل قطعة تكسب مكانها في الحصة أولًا.'],
        ['الهوية.', 'مونوغرام التاج معيار، لا زينة. تلبس ما استحققته.'],
        ['أسلوب الحياة.', 'الانضباط لا ينتهي بانتهاء الحصة. والزي كذلك.'],
      ],
    },
    anatomy: {
      eyebrow: 'تشريح القطعة · طقم التدريب',
      title: 'تانك وشورت.',
      intro:
        'الطقم الذي وُلدت فيه NATYSIMO، كما يُلبس. خمسة تفاصيل، كل واحد منها مقصود — اضغط على رقم لتقرأ القطعة.',
      alt: 'تانك الأداء وشورت التدريب في النادي',
      cta: 'تسوّق طقم التدريب',
      points: [
        {
          title: 'مونوغرام التاج',
          body: 'حرفا NS المتشابكان تحت التاج، على الصدر الأيسر. العلامة التي تُبنى حولها كل قطعة.',
        },
        {
          title: 'خطوط الكنتور',
          body: 'خطوط فضية ترسم الجسم من الإبط نزولًا — توقيع عالم الرياضة.',
        },
        { title: 'قصّة السباق', body: 'فتحات إبط عميقة وحمالات ضيقة، لتترك الكتفين حرّين.' },
        { title: 'طبعة الكنتور', body: 'لغة الخطوط الفضية نفسها منقولة إلى شورت التدريب.' },
        {
          title: 'مونوغرام الساق',
          body: 'مونوغرام التاج عند ساق الشورت — فيُقرأ الطقم كخط واحد.',
        },
      ],
    },
    story: {
      eyebrow: 'قصتنا',
      lines: ['نفس الأحلام.', 'جهد مختلف.'],
      p1: (handle) =>
        `بدأت NATYSIMO باسم ${handle}: تدريب يُصوَّر ويُشارَك بين المغرب وألمانيا. بلا اختصارات — حصص وريلز وخطة تدريب ومجتمع كبر حول الانضباط.`,
      p2: 'الملابس هي الخطوة التالية لنفس العقلية. النادي حيث تبدأ. والشارع حيث تظهر.',
      quoteGloss: 'القرار يعود إليك.',
      cta: 'اقرأ القصة',
      alt: 'مؤسس NATYSIMO في شارع كونيغسألي بدوسلدورف، بالتيشيرت الأساسي والشورت وحقيبة الكتف والجوارب',
      captionPlace: 'كونيغسألي، دوسلدورف',
      captionItems: 'التيشيرت الأساسي · الشورت الأساسي',
    },
    lifestyle: {
      eyebrow: 'أسلوب الحياة',
      text: 'من أول تكرار إلى آخر اجتماع. زي واحد يُلبس بقصد — النادي، الشارع، كل يوم.',
      tiles: [
        { alt: 'تانك الأداء وشورت التدريب في النادي', label: 'تدرّب' },
        { alt: 'الهودي والجوغر، صورة تصوّرية', label: 'انمُ' },
        { alt: 'تيشيرت غرافيك مفرودًا', label: 'البس' },
        { alt: 'هودي بريميوم عاجي مع حقيبة النادي، صورة تصوّرية', label: 'تطوّر' },
        { alt: 'قميص الضغط بأكمام طويلة، صورة تصوّرية', label: 'كرّر' },
      ],
    },
    details: {
      eyebrow: 'تفاصيل راقية',
      title: ['التفاصيل تصنع ', 'الفرق.'],
      items: [
        {
          title: 'مونوغرام التاج',
          body: 'حرفا NS المتشابكان تحت التاج، على الصدر الأيسر من تانك الأداء.',
        },
        { title: 'خطوط الكنتور', body: 'خطوط فضية والمونوغرام على شورت التدريب.' },
        {
          title: 'العلامة والكلمة',
          body: 'NS والتاج وكلمة NATYSIMO — على التيشيرت الأساسي وحقيبة الكتف.',
        },
        { title: 'حتى الجوارب', body: 'العلامة نفسها عند الكاحل. كل قطعة تحملها.' },
      ],
    },
    community: {
      eyebrow: 'الانضباط، موثَّقًا',
      text: (label) => `حيث بدأ كل شيء، وحيث يحدث كل يوم. مجتمع من ${label}، معظمه في المغرب.`,
      follow: 'تابعنا على إنستغرام',
      viewOnInstagram: (alt) => `${alt} — عرض على إنستغرام`,
      feedAlts: [
        'أرضية التدريب، تانك الأداء',
        'كونيغسألي، دوسلدورف',
        'التيشيرت الأساسي وحقيبة الكتف، مُلبَّسَين',
        'تانك الأداء وشورت التدريب',
      ],
    },
    final: { lines: ['الانضباط', 'يبني الحرية.'], shop: 'تسوّق المجموعة 01', story: 'القصة' },
    shop: {
      title: 'المجموعة 01',
      description:
        'مجموعة NATYSIMO 01 — قطع أداء وستريت وير وهجين عبر عوالم الرياضة والملابس والهجين.',
      eyebrow: 'الفصل الأول',
      filterAria: 'التصفية حسب العالم',
      all: 'الكل',
      intro: (n) => `${n} قطعة عبر ثلاثة عوالم. معيار واحد.`,
    },
    collectionPage: {
      description: (n) =>
        `مجموعة NATYSIMO 01 — ${n} قطعة عبر الرياضة والملابس والهجين. تانك أداء وشورتات تدريب وتيشيرتات وهوديات وجوغر وحقائب.`,
      eyebrow: 'الفصل الأول',
      lines: ['المجموعة 01', 'صُنعت لأكثر.'],
      text: (n) =>
        `الفصل الأول: ${n} قطعة، ثلاثة عوالم، معيار واحد. وُلدت على أرضية التدريب، وصُنعت لتُلبس خارجها.`,
      cta: 'تسوّق كل القطع',
    },
  },
};
