import type { Copy } from '../copy';

interface Story {
  title: string;
  description: (handle: string) => string;
  eyebrow: string;
  heroLines: [string, string];
  photoAlt: string;
  lead: (handle: string) => string;
  p1: string;
  p2: string;
  tagline: string;
  chaptersTitle: string;
  chapters: [string, string][];
  rootsAlt: string;
  rootsLines: [string, string];
  rootsText: string;
  quoteFooter: (handle: string) => string;
  identityEyebrow: string;
  identityTitle: string;
  identityText: string;
  shop: string;
  follow: (handle: string) => string;
}

export const story: Copy<Story> = {
  en: {
    title: 'Story',
    description: (handle) =>
      `Before the clothing, there was the training. NATYSIMO grew out of ${handle} — Moroccan roots, built in Germany, around one idea: discipline builds freedom.`,
    eyebrow: 'Our story',
    heroLines: ['Before the clothing,', 'there was the training.'],
    photoAlt: 'Training in the Performance Tank',
    lead: (handle) => `NATYSIMO started as ${handle}.`,
    p1: 'Training, filmed and shared — between Morocco and Germany. No investors and no shortcuts: sessions, reels, a training plan, and a community that grew around the discipline.',
    p2: 'The clothing is the next step of the same mindset. Pieces built on the training floor, made to be worn beyond it.',
    tagline: 'Same dreams. Different work ethic.',
    chaptersTitle: 'What it’s built on',
    chapters: [
      ['Training', 'It starts on the floor. Every day, whether anyone is watching or not.'],
      ['Consistency', 'Not the perfect session — the next one. Then the one after that.'],
      [
        'Failure',
        'Missed days, slow progress, starting again. Nobody posts that part. It still counts.',
      ],
      ['Growth', 'Small, repeated, earned. The mirror changes last.'],
      ['Identity', 'At some point the discipline stops being what you do and becomes who you are.'],
    ],
    rootsAlt: 'The NATYSIMO founder in Düsseldorf, Germany',
    rootsLines: ['Moroccan roots.', 'International standard.'],
    rootsText:
      'Most of the community lives in Morocco — Casablanca, Marrakech, Tanger, Fès, Salé. The brand is built in Germany. NATYSIMO is made for both: the energy of home, executed to an international standard.',
    quoteFooter: (handle) => `“The decision comes back to you.” — ${handle}`,
    identityEyebrow: 'The identity',
    identityTitle: 'One crown. Three worlds.',
    identityText:
      'Every world carries the NS monogram beneath the crown — cut in its own metal. Silver for the training floor, gold for the street, forged steel where the two meet.',
    shop: 'Shop Collection 01',
    follow: (handle) => `Follow ${handle}`,
  },
  ar: {
    title: 'القصة',
    description: (handle) =>
      `قبل الملابس، كان هناك التدريب. نمت NATYSIMO من ${handle} — جذور مغربية، وبناء في ألمانيا، حول فكرة واحدة: الانضباط يبني الحرية.`,
    eyebrow: 'قصتنا',
    heroLines: ['قبل الملابس،', 'كان هناك التدريب.'],
    photoAlt: 'التدريب بتانك الأداء',
    lead: (handle) => `بدأت NATYSIMO باسم ${handle}.`,
    p1: 'تدريب يُصوَّر ويُشارَك — بين المغرب وألمانيا. بلا مستثمرين وبلا اختصارات: حصص وريلز وخطة تدريب ومجتمع كبر حول الانضباط.',
    p2: 'الملابس هي الخطوة التالية لنفس العقلية. قطع وُلدت على أرضية التدريب، وصُنعت لتُلبس خارجها.',
    tagline: 'نفس الأحلام. جهد مختلف.',
    chaptersTitle: 'ما تقوم عليه',
    chapters: [
      ['التدريب', 'يبدأ كل شيء على الأرضية. كل يوم، سواء كان أحد يراقبك أم لا.'],
      ['الاستمرارية', 'ليست الحصة المثالية — بل التالية. ثم التي بعدها.'],
      [
        'الإخفاق',
        'أيام فائتة، وتقدّم بطيء، وبداية من جديد. لا أحد ينشر هذا الجزء. ومع ذلك يُحتسب.',
      ],
      ['النمو', 'صغير، متكرر، مستحَق. والمرآة تتغير آخر شيء.'],
      ['الهوية', 'في لحظة ما يتوقف الانضباط عن كونه ما تفعله، ويصير من تكون.'],
    ],
    rootsAlt: 'مؤسس NATYSIMO في دوسلدورف بألمانيا',
    rootsLines: ['جذور مغربية.', 'معيار عالمي.'],
    rootsText:
      'معظم المجتمع يعيش في المغرب — الدار البيضاء ومراكش وطنجة وفاس وسلا. والعلامة تُبنى في ألمانيا. صُنعت NATYSIMO للاثنين: طاقة البيت، منفَّذة بمعيار عالمي.',
    quoteFooter: (handle) => `القرار يعود إليك. — ${handle}`,
    identityEyebrow: 'الهوية',
    identityTitle: 'تاج واحد. ثلاثة عوالم.',
    identityText:
      'كل عالم يحمل مونوغرام NS تحت التاج — منحوتًا بمعدنه الخاص. الفضة لأرضية التدريب، والذهب للشارع، والفولاذ المطروق حيث يلتقي الاثنان.',
    shop: 'تسوّق المجموعة 01',
    follow: (handle) => `تابع ${handle}`,
  },
};
