/**
 * Natty Simo – management system (90 days), as of 3 Oct 2026.
 *
 * Private working document for the founder, rendered at /manager (noindex,
 * unlinked — see ASSETS.md). All copy is Moroccan Darija in Arabic script,
 * rendered right-to-left. Kept in Latin script on purpose: the brand names
 * (Natty Simo = person, NATYSIMO = clothing), the DM keywords PLAN /
 * DEUTSCH / SQUAD (people type exactly these), the claim and the script
 * tags. Nothing is invented; open points stay marked as open.
 */

export const MANAGER_META = {
  title: 'Natty Simo – نظام المانجمنت (90 يوم)',
  date: '3 أكتوبر 2026',
  author: '@Simo',
} as const;

export type Cta = 'PLAN' | 'DEUTSCH' | 'SQUAD';
export const CTAS: Cta[] = ['PLAN', 'DEUTSCH', 'SQUAD'];

export const IDENTITY = {
  summary:
    'Natty Simo ماشي غير قناة ديال الفيتنس، هو أسلوب حياة: الانضباط هو الطريق للحرية وللبراند ديالك.',
  claim: 'Discipline builds freedom.',
  chain: ['الانضباط', 'الفيتنس', 'اللغة', 'ألمانيا', 'تطوير الذات', 'الحرية', 'البراند ديالك'],
  hierarchy: [
    'Natty Simo (الشخص، البراند الشخصي)',
    'الفيتنس / الهايبريد / الانضباط (الأساس)',
    'المغاربة فألمانيا',
    'Deutsch بالدارجة',
    'NATYSIMO (براند الحوايج)',
    'برنامج الهايبريد والمنتوجات',
  ],
  deutschNote:
    'Smart Deutsch يقدر يكبر، ولكن Natty Simo ماغاديش يولي حساب ديال أستاذ الألمانية وصافي. الألمانية أداة وحاجة كتميزك. كل ريل ديال الألمانية خاصو سياق حقيقي ديال Natty Simo.',
  /** Only the known part. The rest of the story chain is still open — never invent it. */
  storyChain: ['سلا', 'ألمانيا'],
  storyChainOpen: true,
} as const;

export const AUDIENCE = {
  summary:
    'شباب من المغرب باغيين يوليو فورمة ومنضبطين، يحسنو حياتهم ويطورو راسهم، مهتمين بألمانيا، باغيين يتعلمو الألمانية ولا كيفكرو فالأوسبيلدونغ ولا القراية فألمانيا. فالأرقام ديالك: 79,6 % من الحسابات اللي كتفاعل، 81 % رجال، وأغلبهم بين 18 و34 عام.',
  points: [
    {
      term: 'الاهتمامات',
      text: 'الفيتنس، بناء العضلات، الهايبريد ترينينغ، الانضباط، الموتيفاسيون، تطوير الذات، ألمانيا، الألمانية، الأوسبيلدونغ، القراية، حياة حسن.',
    },
    { term: 'الدارجة', text: 'هي اللغة الأساسية فكل ريل.' },
    { term: 'الألمانية', text: 'حاجة كتميزك، ماشي الهوية الأساسية.' },
    {
      term: 'السوتيتر ديما',
      text: 'فيديو بالدارجة بسوتيتر بالألمانية ولا بالعربية حسب السياق، وفيديو بالألمانية بشرح بالدارجة.',
    },
  ],
  protectionIntro: 'تقريبا 10 % من الريتش ديالك تحت 18 عام. داكشي علاش:',
} as const;

/** Hard content limits. Checked in every reel review (see QUALITY_CHECK › risk). */
export const PROTECTION_RULES = [
  'ماكاين حتى وعد ديال ريجيم متطرف',
  'ماكاين حتى وعد بلي شي مكمل غذائي كيداوي ولا كيدير المعجزات',
  'ماكاين حتى وعد خطير فالتمارين',
  'ماكاين حتى كلام مشكل على الجسم',
  'ماكاينش تصوير المرضى ولا فالمصلحة ديال السبيطار',
  'ماكاين حتى معلومة خاصة على المرضى',
];

export const GOAL_CHAIN = ['مشاهدة', 'فولو', 'هضرة', 'كوميونيتي', 'ثقة', 'منتوج'];

export const RULES_INTRO =
  'المشكل ديالك هو الارتباط، ماشي الريتش: 93,5 % من التفاعلات جات من ناس ماشي فولوورز، وغير 876 رد على الستوري فتلت شهور.';

export const RULES: { title: string; text: string }[] = [
  {
    title: 'غير 3 أولويات فالسيمانة',
    text: 'الكونتنو/الريلز، الكوميونيتي، التحليل. كلشي آخر زيادة.',
  },
  {
    title: 'فكرة جديدة؟ دوزها من الاختبار',
    text: 'واش كتعاون دابا وحدة من هاد التلت أولويات؟ إلا لا، الجواب هو: ماشي دابا.',
  },
  {
    title: 'الفيتنس هو الأساس',
    text: 'Deutsch بالدارجة ماكيفوتش 1 من 4–5 ريلز فالسيمانة.',
  },
  {
    title: 'حتى ريل بلا CTA',
    text: 'خاص CTA اللي كيحل هضرة ولا كيدير حركة فالكوميونيتي، ماشي غير «دير لايك وفولو».',
  },
  {
    title: 'الكوميونيتي قبل الفيوز',
    text: 'كل سيمانة حسب شحال من واحد جا من الريلز ودخل فالهضرة ولا فالبرودكاست.',
  },
  { title: 'اللي تسالى حسن من اللي كامل', text: '' },
];

export const RULES_NOTE =
  'التوزيع ديال الريلز يقدر يتبدل إلا الداتا بيّنات هادشي. ولكن الفيتنس كيبقى هو الأساس.';

export type ReelKind = 'fitness' | 'morocco-germany' | 'deutsch' | 'personal';

export interface ReelSlot {
  slot: number;
  optional?: boolean;
  kind: ReelKind;
  topic: string;
  hook: string;
  ctas: Cta[];
}

export const REELS_PER_WEEK = { min: 4, max: 5, minFitness: 2, maxDeutsch: 1 } as const;

export const REEL_SLOTS: ReelSlot[] = [
  {
    slot: 1,
    kind: 'fitness',
    topic: 'هايبريد / فيتنس / انضباط',
    hook: '«كنجري 5 كيلو وكندفع 100 كيلو فالبنش. Natty. هادا هو البلان ديالي.»',
    ctas: ['PLAN'],
  },
  {
    slot: 2,
    kind: 'fitness',
    topic: 'هايبريد / انضباط / سلسلة («Hybrid Journey – النهار X/90»)',
    hook: '«النهار 12: ترينينغ من بعد الشيفت ديال العشية.»',
    ctas: ['PLAN', 'SQUAD'],
  },
  {
    slot: 3,
    kind: 'morocco-germany',
    topic: 'المغاربة فألمانيا / ضحك / الواقع',
    hook: '«الوقت عند الألمان ضد "دابا دابا" ديال المغاربة.»',
    ctas: ['SQUAD'],
  },
  {
    slot: 4,
    kind: 'deutsch',
    topic: 'Deutsch بالدارجة مع سياق Natty',
    hook: '«3 جمل بالألمانية خاصك تعرفهم فالجيم.»',
    ctas: ['DEUTSCH'],
  },
  {
    slot: 5,
    optional: true,
    kind: 'personal',
    topic: 'الشيفتات / قصة شخصية / وراء البراند',
    hook: '«نتوما اللي غادي تختارو: كحل ولا أوف وايت للبياسة الأولى ديالي؟»',
    ctas: ['SQUAD'],
  },
];

export const REEL_NOTES = [
  {
    term: 'ريلز الألمانية غير بسياق',
    text: 'الجيم، الأوسبيلدونغ، الشيفت، ألمانيا، الحياة اليومية، مواقف حقيقية ديال المغاربة فألمانيا. ماكاينش ريلز ديال أستاذ الألمانية بلا علاقة بـ Natty.',
  },
  {
    term: 'الطون',
    text: 'مستفز ولكن ظريف. كتضحك على التصرفات، عمرك ما على المجموعات، الأجسام ولا المرضى. ماكاينش تصوير فالمصلحة ديال السبيطار ولا شي حاجة فيها المرضى.',
  },
];

export const FUNNEL_FLOW = [
  'CTA فالريل',
  'الشخص كيكتب الكلمة',
  'الجواب ديالك (فـ 24 ساعة)',
  'سؤال واحد',
  'محتوى مفيد',
  'فولو-آب من بعد 2–3 أيام',
  'دعوة لـ Natty Squad',
  'من بعد يمكن منتوج',
];

export const FUNNEL_NOTE = 'بلا أوتوماسيون، كتجاوب براسك، وإلا تزيرتي استعمل ردود محفوظة.';

export interface FunnelStep {
  step: string;
  text: string;
  /** A ready-to-send DM text block, when the plan gives one. */
  snippet?: string;
}

export interface Funnel {
  keyword: Cta;
  label: string;
  steps: FunnelStep[];
}

export const FUNNELS: Funnel[] = [
  {
    keyword: 'PLAN',
    label: 'فيتنس / هايبريد',
    steps: [
      {
        step: 'الجواب',
        text: 'فوكال ولا ميساج قصير بالدارجة.',
        snippet: 'وا صاحبي، ها البداية ديالك. غير سؤال واحد قبل…',
      },
      {
        step: 'السؤال',
        text: 'ولا: شحال من مرة فالسيمانة تقدر تترينا؟',
        snippet: 'شنو الهدف ديالك دابا: العضلات، النفس ولا بجوج؟',
      },
      {
        step: 'المحتوى المفيد',
        text: 'الميني بلان المناسب ولا ريل كيجاوب على السؤال.',
      },
      { step: 'فولو-آب من بعد 2–3 أيام', text: '', snippet: 'كيف دازت أول حصة؟' },
      {
        step: 'الكوميونيتي',
        text: 'دعوة لـ Natty Squad. الأجوبة اللي كتجمع كتبين شنو محتاجة الكوميونيتي بصح (مصدر لبرنامج الهايبريد).',
      },
    ],
  },
  {
    keyword: 'DEUTSCH',
    label: 'الألمانية / ألمانيا',
    steps: [
      { step: 'الجواب', text: 'الماتيريال اللي وعدتي بيه (كلمات ولا جمل) مع سياق Natty.' },
      {
        step: 'السؤال',
        text: '',
        snippet: 'علاش محتاج الألمانية: أوسبيلدونغ، خدمة، قراية ولا الحياة اليومية؟',
      },
      { step: 'المحتوى المفيد', text: 'ريل مناسب ولا جواب على الموقف ديالو بالضبط.' },
      {
        step: 'الفولو-آب',
        text: '',
        snippet: 'عاوناتك؟ شنو أكبر مشكل عندك مع ألمانيا؟',
      },
      { step: 'الكوميونيتي', text: 'دعوة لـ Natty Squad، ماشي لكورس ديال الألمانية.' },
    ],
  },
  {
    keyword: 'SQUAD',
    label: 'البرودكاست',
    steps: [
      { step: 'الجواب', text: 'اللينك ديال قناة Natty Squad وجملة وحدة على شنو كيدوز تما.' },
      {
        step: 'السؤال',
        text: '',
        snippet: 'شنو بغيتي أكثر فالسكواد: نصائح الترينينغ، مساعدة فالألمانية ولا وراء البراند؟',
      },
      { step: 'الترحيب فالقناة', text: 'أول سونداج باش الجديد يشارك ديريكت.' },
      { step: 'الفولو-آب', text: 'من بعد سيمانة: واش المحتوى عاجبو.' },
    ],
  },
];

export const SQUAD_INTRO =
  'Natty Squad هو البلاصة فين المتابعين كيوليو كوميونيتي. خطط 2–4 ميساجات فالسيمانة، ماخصكش كثر.';

export const BROADCAST_TYPES: { type: string; purpose: string; example: string }[] = [
  {
    type: 'سونداج',
    purpose: 'هضرة ومصدر ديال الداتا',
    example: '«كحل ولا أوف وايت للبياسة الأولى؟»',
  },
  {
    type: 'فوكال (بالدارجة)',
    purpose: 'القرب والثقة',
    example: '60 ثانية على السيمانة ديالك والريل الجاي',
  },
  {
    type: 'تشالنج',
    purpose: 'حركة جماعية',
    example: '«30 يوم ديال Discipline»: كل نهار 10 دقايق ترينينغ وكلمة وحدة بالألمانية',
  },
  {
    type: 'Early Access',
    purpose: 'سبب باش يبقاو',
    example: 'يشوفو الريل ولا الديزاين قبل الناس كاملين',
  },
  {
    type: 'أبديت شخصي',
    purpose: 'القصة والمصداقية',
    example: 'شيفت العشية، ومع ذلك درت الترينينغ',
  },
  {
    type: 'معلومة حصرية',
    purpose: 'قيمة غير للأعضاء',
    example: 'موعد اللايف، البلان، لائحة الانتظار ديال NATYSIMO',
  },
];

export const SQUAD_CHECKLIST = [
  'الريل كيسالي بـ CTA (PLAN، DEUTSCH ولا SQUAD) وكيقول شنو الفايدة فالسكواد.',
  'القناة باينة فالبيو وفالهايلايتس.',
  'كل جواب فالديام فيه دعوة.',
  'ريل واحد فالسيمانة كيروج للسكواد ديريكت (مثلا بتشالنج ولا سونداج كاين غير تما).',
  'كتقول فالريل شنو كاين هاد السيمانة فالسكواد.',
];

export const WEEK_INTRO =
  'سيمانة عادية بغات 4–5 سوايع، وسيمانة ديال الامتحانات ولا الشيفتات الصعيبة غير تقريبا 2 سوايع. نقطة البداية: iPhone 16 وCapCut، بلا فريق، بلا ستوديو.';

export const WEEK: { day: string; task: string; time: string }[] = [
  {
    day: 'الحد',
    task: 'نهار المانجر: تحليل، كتابة 5 هوكات، تصوير 3–4 ريلز مرة وحدة، تخطيط السيمانة',
    time: '2–2,5 سوايع',
  },
  { day: 'الاثنين', task: 'المونطاج: 2 ريلز فـ CapCut، وزيد السوتيتر', time: 'تقريبا 45 دقيقة' },
  {
    day: 'الربعاء',
    task: 'محتوى آخر (كاروسيل ولا ريل) و1–2 ميساجات فالبرودكاست',
    time: '30–45 دقيقة',
  },
  {
    day: 'الترينينغ',
    task: 'صوّر الراشز: 3 كليبات فكل حصة (كليب الهوك، كليب الخدمة، الرياكسيون)، بلا وقت زايد',
    time: '0',
  },
  {
    day: 'كل نهار',
    task: 'الكومونتيرات فأول ساعة من بعد البوست، الديامات، 2–3 ستوريات',
    time: '10–15 دقيقة',
  },
  { day: 'كل 1–2 سيمانات', task: 'لايف 20 دقيقة مع سؤال وجواب (الحد فالليل)', time: '20–30 دقيقة' },
];

export const EMERGENCY_MODE = {
  time: 'تقريبا 2 سوايع',
  tasks: [
    '2 ريلز من الماتيريال اللي عندك',
    'ستوريات بسيطة كل نهار',
    'الكومونتيرات والديامات',
    'ميساج واحد فالبرودكاست',
  ],
  never: 'فوضع الطوارئ ماكاينش لايف، ماكاينش سلسلة جديدة وماكاينش بنية جديدة ديال البيزنس.',
} as const;

export type KpiId = 'shares' | 'storyReplies' | 'unfollowRate' | 'squadMembers' | 'dmLeads';

export interface Kpi {
  id: KpiId;
  label: string;
  start: string;
  target: string;
  unit?: string;
}

export const KPI_SOURCE =
  'أرقام البداية من الإكسبور ديال إنستغرام (20 يونيو حتى 17 شتنبر 2026). الأهداف تقديرات ديال التخطيط، ماشي بنشمارك. رقم البداية ديال الديامات ناقص، بدا حسب من السيمانة الأولى.';

export const KPIS: Kpi[] = [
  {
    id: 'shares',
    label: 'الشيرات فكل ريل',
    start: '89.998 شير فالمجموع (ريلز)',
    target: 'سجلها لكل ريل، والاتجاه طالع',
  },
  {
    id: 'storyReplies',
    label: 'الردود على الستوري',
    start: '876 فتلت شهور',
    target: 'على الأقل 3.000',
  },
  {
    id: 'unfollowRate',
    label: 'الأنفولو مقارنة مع الفولوورز الجداد',
    start: '4.887 مقابل 26.105 (تقريبا 19 %)',
    target: 'تحت 12 %',
    unit: '%',
  },
  { id: 'squadMembers', label: 'أعضاء البرودكاست', start: '0', target: '1.500–2.500' },
  {
    id: 'dmLeads',
    label: 'ليدز فالديام (PLAN، DEUTSCH، SQUAD)',
    start: 'ماتحسبوش',
    target: 'على الأقل 500',
  },
];

export const SUNDAY_FLOW = [
  '15 دقيقة تحليل ديال 5 أرقام.',
  'حدد أحسن ريل فالسيمانة.',
  'حدد أضعف ريل.',
  'لقا الباترن اللي كيتعاود (الموضوع، الهوك، الطول، CTA).',
  'كتب 5 هوكات.',
  'صوّر 3–4 ريلز.',
  'خطط السيمانة الجاية (الريلز، مواعيد البرودكاست، واش كاين لايف).',
];

export const DECISION_RULES: { signal: string; action: string }[] = [
  { signal: 'شيرات وهضرة', action: 'دير منو سلسلة.' },
  { signal: 'غير فيوز', action: 'ماتعاودوش أوتوماتيكيا.' },
  {
    signal: 'فيوز قلال ولكن بزاف ديال الديامات ولا الهضرة',
    action: 'ماتمسحوش وماتهملوش. هاد المحتوى يقدر يكون أهم للكوميونيتي وللبيزنس.',
  },
  { signal: 'موضوع كيجيب نتائج مزيانة بزاف ديال المرات', action: 'طلّع الأولوية ديالو.' },
];

export const BRAND_PATH = {
  intro: 'بجوج كيكبرو بشوية من الكوميونيتي، ماشي من الإنتاج وضغط البيع.',
  path: ['القصة', 'وراء البراند', 'الكوميونيتي كتقرر', 'لائحة الانتظار', 'من بعد الدروب'],
  notPath: ['الإنتاج', 'السطوك', 'بيع كبير'],
  ideas: [
    'اللوغو والمونوغرام (ورّي كيفاش تولدو)',
    'التيشورت: الفصالة، الثوب، الديزاين',
    'الألوان (تصويت فالسكواد)',
    '«شنو غادي تلبسو؟»',
    'وثّق كيفاش كيتصاوب، حتى المحاولات اللي فشلات',
  ],
} as const;

export const HYBRID_STEPS = [
  'المحتوى',
  'جمع المشاكل ديال الكوميونيتي',
  'الجواب على ديامات PLAN',
  'مساعدة فابور',
  'اختبار الطلب',
  'الأعضاء المؤسسين (Founding Members)',
  'بيتا',
  'إدخال الفيدباك',
  'البرنامج النهائي',
  'اللانسمون',
];

export const HYBRID_NOTE =
  'الخطوة 6 كتبدا غير إلا الخطوة 5 بينات طلب حقيقي، بحال بزاف ديال ديامات PLAN وأجوبة نشيطة فالسكواد. الثمن غادي تقررو من بعد، وعينيك على القدرة الشرائية ديال الجمهور ديالك فالمغرب.';

export const NOT_NOW: { topic: string; why: string; allowedWhen: string }[] = [
  {
    topic: 'Asal Achifa فالقناة الرئيسية',
    why: 'موضوع غريب، خطر ديال الادعاءات الصحية، كيبعدك على الأساس',
    allowedWhen: 'ملي Natty Simo يمشي مزيان ومستقر؛ ومن بعد غير فقناة بوحدها',
  },
  {
    topic: 'إنتاج كبير ديال NATYSIMO، دروب',
    why: 'الطلب مازال ماتأكدش',
    allowedWhen: 'لائحة الانتظار والتصويتات كيبينو طلب حقيقي',
  },
  {
    topic: 'الويبسايت بيرفيكت',
    why: 'غير البنية الضرورية اللي كتحسب',
    allowedWhen: 'تكون كاينة لائحة انتظار محتاجاها',
  },
  {
    topic: 'Smart Deutsch كقناة رئيسية بوحدها',
    why: 'غادي تولي أستاذ ديال الألمانية وصافي',
    allowedWhen: 'الأساس ديال الفيتنس والكوميونيتي يكونو واقفين',
  },
  {
    topic: 'بلاتفورمات جديدة',
    why: 'كتفرق التركيز',
    allowedWhen: 'إنستغرام ماشي فالريتم والأرقام واقفة',
  },
  {
    topic: 'منتوجات جديدة',
    why: 'الطلب خاصو يتأكد قبل',
    allowedWhen: 'برنامج الهايبريد عندو Founding Members',
  },
  {
    topic: 'البيرفيكسيونيزم',
    why: 'كياكل الوقت وماكيجيبش الارتباط',
    allowedWhen: 'عمرو: اللي تسالى حسن من اللي كامل',
  },
];

export const START_TOMORROW = {
  date: 'الحد، 4 أكتوبر 2026',
  steps: [
    '15 دقيقة تحليل: أحسن ريل وأضعف ريل فالسيمانة اللي فاتت، وسجل 5 أرقام.',
    'كتب 5 هوكات (فيتنس 2، المغاربة فألمانيا 1، الألمانية مع سياق Natty 1، وراء البراند ولا الشيفتات 1).',
    'حل Natty Squad وصيفط أول ميساج بالدارجة: شكون نتا، شنو جاي هاد السيمانة، وكيفاش يشاركو؟',
    'وجّد البيو، الهايلايتس والريلز المثبتين على Natty Simo (حدد الحساب الرئيسي).',
    'صوّر 3 ريلز بنفس الحوايج ونفس الضو مرة وحدة، كل واحد بـ CTA (PLAN، DEUTSCH ولا SQUAD).',
    'الاثنين: المونطاج. الربعاء: ميساجات البرودكاست ومحتوى آخر.',
  ],
} as const;

/** ISO-8601 week key, e.g. "2026-W40". Used to scope checklists and the KPI log. */
export function isoWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

/* ───────────────────────── Reel quality check ─────────────────────────
 * Every reel is checked against this before posting. Used by the reel
 * reviewer on /manager and by the review prompt Simo pastes into Claude
 * together with a script. Stored data only uses the stable ids below,
 * never display text.
 */

export type Verdict = 'keep' | 'change' | 'delete' | 'not-now';

export const VERDICTS: { id: Verdict; label: string; when: string }[] = [
  { id: 'keep', label: 'خلّيه', when: 'كيخدم' },
  { id: 'change', label: 'بدّلو', when: 'خايب' },
  { id: 'delete', label: 'حيّدو', when: 'زايد' },
  { id: 'not-now', label: 'ماشي دابا', when: 'مزيان من بعد' },
];

export const SCRIPT_MARKS: { mark: string; meaning: string }[] = [
  { mark: '[KEEP]', meaning: 'خلّي' },
  { mark: '[CHANGE]', meaning: 'بدّل' },
  { mark: '[DELETE]', meaning: 'حيّد' },
  { mark: '[ADD]', meaning: 'زيد' },
  { mark: '[MOVE]', meaning: 'بدّل البلاصة' },
];

export const FINAL_SCRIPT_MARKS = [
  '[HOOK]',
  '[VISUAL]',
  '[TEXT]',
  '[CUT]',
  '[B-ROLL]',
  '[SOUND]',
  '[PAUSE]',
  '[CTA]',
];

export type ContentType = 'reach' | 'conversion';

export const CONTENT_TYPES: { id: ContentType; label: string; text: string }[] = [
  {
    id: 'reach',
    label: 'REACH CONTENT',
    text: 'كيجيب الريتش ولكن شوية ديال الكوميونيتي ولا العلاقة. ماشي ديما خايب.',
  },
  {
    id: 'conversion',
    label: 'CONVERSION CONTENT',
    text: 'يمكن يجيب فيوز قلال، ولكن ديامات قوية. ماتمسحوش وماتهملوش.',
  },
];

/** Answered before the reel is touched. No clear answer → change it. */
export const PRE_QUESTIONS: { id: string; question: string; rule: string }[] = [
  {
    id: 'A',
    question: 'شنو هي الفكرة الأساسية؟ (جملة وحدة)',
    rule: 'إلا ماتقدرش تشرحها فجملة ← بدّلها.',
  },
  { id: 'B', question: 'علاش شي واحد غادي يتفرج فهادا؟', rule: 'سبب واحد واضح.' },
  {
    id: 'C',
    question: 'علاش مغربي بين 18 و34 عام غادي يتفرج فهادا؟',
    rule: 'إلا ماكاينش جواب واضح ← بدّل.',
  },
  {
    id: 'D',
    question: 'شنو غادي ياخد اللي كيتفرج؟',
    rule: 'على الأقل وحدة: معلومة، إحساس، موتيفاسيون، ضحك، إلهام، فايدة عملية، يلقى راسو فيه، قصة.',
  },
  {
    id: 'E',
    question: 'شنو خاصو يدير من بعد؟',
    rule: 'كومونتير، ديام، PLAN، DEUTSCH، SQUAD، يدخل للبرودكاست، سيف، بارطاجي. بلا حركة واضحة ← بدّل.',
  },
];

export interface CheckGroup {
  id: string;
  title: string;
  items: string[];
  /** Only relevant for some reels; the reviewer can still tick it. */
  note?: string;
}

/** The check a Deutsch reel cannot be posted without (see postingReadiness). */
export const DEUTSCH_CONTEXT_ITEM =
  'كاين سياق حقيقي ديال Natty Simo (الجيم، الأوسبيلدونغ، الشيفت، ألمانيا، الحياة اليومية، موقف حقيقي).';

export const QUALITY_CHECK: CheckGroup[] = [
  {
    id: 'idea',
    title: 'الفكرة',
    items: [
      'الفكرة واضحة (كتشرح فجملة وحدة).',
      'كتناسب البراند ديال Natty Simo.',
      'كتناسب الجمهور (المغرب، 18–34).',
      'كاين سبب حقيقي باش شي واحد يتفرج.',
    ],
  },
  {
    id: 'hook',
    title: 'الهوك (0–1 ثانية و1–3 ثواني)',
    items: [
      'أول كلمة قوية.',
      'أول ثانية فيها سبب باش يكمل.',
      'أول جملة مفهومة ديريكت.',
      'البداية فالتصويرة كتجبد.',
      'كاين توتر ولا فضول.',
      'محدد، كيتصدق، وكيشبه لـ Natty Simo.',
      'قصير، بلا كلام زايد، والمعلومة المهمة ماجاتش معطلة.',
    ],
  },
  {
    id: 'script',
    title: 'السكريبت (كلمة بكلمة)',
    items: [
      'كل كلمة وكل جملة تشافت وتعلمات ([KEEP] [CHANGE] [DELETE] [ADD] [MOVE]).',
      'ماكاين كلام زايد، ماكاين تكرار.',
      'الترتيب مزيان.',
      'مفهوم، طبيعي، كيشبه لسيمو ماشي لنص ديال الذكاء الاصطناعي.',
      'الطون، الإحساس والاستفزاز فبلاصتهم.',
      'كيتصدق: ماكاين حتى ادعاء ماشي صحيح.',
    ],
  },
  {
    id: 'darija',
    title: 'الدارجة',
    items: [
      'كتشبه للدارجة ديال الزنقة بصح.',
      'شاب مغربي غادي يقولها بحال هكا بالضبط.',
      'بلا كلمات ألمانية زايدة، ماشي رسمية بزاف.',
      'مفهومة ديريكت.',
    ],
  },
  {
    id: 'deutsch',
    title: 'الألمانية',
    note: 'غير إلا كانت الألمانية فالريل.',
    items: [
      'القواعد والكلمات صحاح.',
      'النطق نقي.',
      'مفهومة فمستوى B1/B2 إلا كانت للجمهور.',
      'الكلمة بالألمانية ضرورية بصح (وإلا شرح بالدارجة).',
      DEUTSCH_CONTEXT_ITEM,
    ],
  },
  {
    id: 'retention',
    title: 'الريتونشن (ثانية بثانية)',
    items: [
      'ماكاينش ثواني ميتة (Dead Seconds).',
      'ماكاينش بوزات زايدة.',
      'كاين حركة كافية فالتصويرة.',
      'كاين سؤال مفتوح.',
      'كاين سبب باش يكمل حتى للآخر.',
      'المعلومة المهمة ماجاتش معطلة.',
      'ماكاين حتى سبب واضح باش يخرج.',
    ],
  },
  {
    id: 'visual',
    title: 'التصويرة',
    items: [
      'الكاميرا، الضو، الزاوية والكادر مزيانين.',
      'الوجه، الوقفة والخلفية مناسبين.',
      'الحركة، الثبات والسرعة مناسبين.',
      'B-Roll فبلاصتو (لقطات الجيم، لقطات ألمانيا).',
      'الكوبات مزيانين (Jump Cuts، زوم، تبديل الزاوية).',
      'النص على الشاشة: البلاصة، الحجم، القراية، التوقيت، ماشي بزاف ديال النص.',
    ],
  },
  {
    id: 'audio',
    title: 'الصوت',
    items: [
      'الصوت ديالك مفهوم وطبيعي.',
      'الموسيقى مناسبة وطايحة على الصوت.',
      'SFX عندهم معنى.',
      'ماكاين صداع فالخلفية، ماكاين سكات زايد.',
    ],
  },
  {
    id: 'subtitles',
    title: 'السوتيتر',
    items: [
      'كل كلمة تشافت، بلا أخطاء.',
      'الدارجة والألمانية صحاح، بلا ترجمة غالطة.',
      'التوقيت مضبوط.',
      'كيتقرا مزيان، السطورة قصار.',
      'الكلمات المهمة باينين.',
    ],
  },
  {
    id: 'story',
    title: 'القصة والإحساس',
    items: [
      'الستروكتور باينة (مثلا: هوك ← مشكل ← توتر ← تطور ← نتيجة ← CTA).',
      'كاين تطور.',
      'إحساس واضح (موتيفاسيون، مفاجأة، فضول، فخر، ضحك، يلقى راسو، طموح، أمل …).',
    ],
  },
  {
    id: 'provocation',
    title: 'الاستفزاز',
    items: [
      'الاستفزاز كيضرب التصرفات، ماشي الناس ولا المجموعات.',
      'ماكاين هجوم على الجنسيات، الديانات، الأجسام، المرضى، الناس الضعاف.',
      'كلام عنيف بلا سبب: نفس الطاقة، بطريقة أذكى.',
    ],
  },
  {
    id: 'cta',
    title: 'CTA',
    items: [
      'كاين CTA واضح: PLAN، DEUTSCH ولا SQUAD.',
      'كيجي طبيعي من المحتوى.',
      'محدد، ماشي «دير لايك وفولو».',
      'كيقول الفايدة ديال السكواد إلا كانت مناسبة.',
    ],
  },
  {
    id: 'funnel',
    title: 'الفانيل ديال الديام',
    items: [
      'CTA كيدي لفانيل حقيقي (جواب ← سؤال ← محتوى ← فولو-آب ← Natty Squad).',
      'الردود المحفوظة واجدين.',
    ],
  },
  {
    id: 'caption',
    title: 'الكابشن',
    items: [
      'ماكتعاودش الريل وصافي (سياق، معلومة زايدة، نقاش ولا CTA).',
      'أول سطر قوي.',
      'كتقرا مزيان، طول مناسب.',
      'الكلمة (keyword) متعاودة.',
      'بلا هاشتاغات زايدة، بلا أخطاء.',
    ],
  },
  {
    id: 'cover',
    title: 'الكوفر',
    items: [
      'مفهوم فثانية وحدة، كلمات قلال.',
      'إحساس قوي، كونطراست واضح.',
      'الموضوع باين ديريكت، كيناسب البراند.',
      '3 ديال النصوص للكوفر مكتوبين باش تختار.',
    ],
  },
  {
    id: 'brand',
    title: 'البراند',
    items: [
      'كتعرف بلي هادا Natty Simo (الشخصية، اللغة، الموقف، القصة).',
      'ماشي أي فيتنس كرياتور يقدر يديرو (وإلا BRAND WEAK).',
      'الكتابة: Natty Simo (الشخص)، NATYSIMO (الحوايج).',
    ],
  },
  {
    id: 'monetization',
    title: 'الكوميونيتي والفلوس',
    items: [
      'كيبني الكوميونيتي ولا ليدز فالديام (ولا هو REACH CONTENT عن قصد).',
      'كيعاون من بعد فشي حاجة: برنامج الهايبريد، NATYSIMO، الشراكات، المنتوجات.',
    ],
  },
  {
    id: 'risk',
    title: 'الحماية والمخاطر',
    items: [
      ...PROTECTION_RULES.map((r) => `${r}.`),
      'ماكاينش سوء فهم ممكن، ماكاينش ادعاءات زايدة.',
    ],
  },
  {
    id: 'not-now',
    title: 'اختبار «ماشي دابا»',
    items: [
      'الفكرة كتعاون الكونتنو/الريلز، الكوميونيتي ولا التحليل.',
      'ماكاين حتى فكرة من لائحة «ماشي دابا» مخبية فيها.',
    ],
  },
];

export type ScoreId =
  | 'hook'
  | 'retention'
  | 'story'
  | 'language'
  | 'value'
  | 'emotion'
  | 'visual'
  | 'audio'
  | 'cta'
  | 'community'
  | 'brand'
  | 'monetization';

export type Rating = 'strong' | 'ok' | 'weak' | 'change';
export const RATINGS: Rating[] = ['strong', 'ok', 'weak', 'change'];

export const RATING_LABELS: Record<Rating, string> = {
  strong: 'قوي',
  ok: 'مزيان',
  weak: 'ضعيف',
  change: 'بدّل',
};

/** Ratings stored before the Darija switch used German words. */
const LEGACY_RATINGS: Record<string, Rating> = {
  STARK: 'strong',
  OK: 'ok',
  SCHWACH: 'weak',
  // The old German "change" (A-umlaut + NDERN), built from a char code so
  // this file stays free of German text.
  [String.fromCharCode(0xc4) + 'NDERN']: 'change',
};

/** Accepts current ids and the old German values; anything else is dropped. */
export function normalizeRating(value: unknown): Rating | undefined {
  if (typeof value !== 'string') return undefined;
  if ((RATINGS as string[]).includes(value)) return value as Rating;
  return LEGACY_RATINGS[value];
}

/** No overall 10/10 — every category is rated on its own. */
export const SCORE_CATEGORIES: { id: ScoreId; label: string }[] = [
  { id: 'hook', label: 'الهوك' },
  { id: 'retention', label: 'الريتونشن' },
  { id: 'story', label: 'القصة' },
  { id: 'language', label: 'اللغة' },
  { id: 'value', label: 'القيمة' },
  { id: 'emotion', label: 'الإحساس' },
  { id: 'visual', label: 'التصويرة' },
  { id: 'audio', label: 'الصوت' },
  { id: 'cta', label: 'CTA' },
  { id: 'community', label: 'الكوميونيتي' },
  { id: 'brand', label: 'كيناسب البراند' },
  { id: 'monetization', label: 'الفلوس' },
];

export const POSTING_CHECKLIST = [
  'الهوك تشاف',
  'أول كلمة تشافت',
  'كل كلمة تشافت',
  'الدارجة تشافت',
  'الألمانية تشافت',
  'القواعد تشافو',
  'السوتيتر تشافو',
  'التوقيت تشاف',
  'الثواني الميتة تحيدو',
  'الصوت تشاف',
  'الموسيقى تشافت',
  'التصويرة تشافت',
  'CTA تشاف',
  'الكلمة (keyword) تشافت',
  'فانيل الديام تشاف',
  'الكابشن تشاف',
  'الكوفر تشاف',
  'كيناسب البراند',
  'هدف الكوميونيتي تشاف',
  'إمكانية الربح تشافت',
  'بلا ادعاءات زايدة',
  'بلا استفزاز زايد',
  'دوّز اختبار «ماشي دابا»',
];

/** The order every review answer follows. */
export const REVIEW_ANSWER_FORMAT = [
  'هدف المحتوى',
  'الهوك (تحليل كلمة بكلمة)',
  'السكريبت (كل كلمة فيها مشكل معلّمة)',
  'الريتونشن (فين كيبدا يمل اللي كيتفرج؟)',
  'التصويرة (شنو كيبان على الشاشة وإمتى؟)',
  'الصوت (الصوت، الموسيقى، الساوند)',
  'CTA (واش الحركة واضحة؟)',
  'فانيل الديام (شنو كيوقع من بعد CTA؟)',
  'البراند (واش كيناسب Natty Simo؟)',
  'الفلوس (شنو الدخل اللي كيعاون فيه من بعد؟)',
  'Must Fix (التبديلات الضرورية)',
  'النسخة النهائية (واجدة للتصوير والنشر)',
  'ليستة النشر',
];

export const REVIEW_RULE =
  'ماتعاودش تكتب ديريكت. الأول حلل، لقا الأخطاء، لقا نقط القوة، شرح التحسينات، ومن بعد عاد النسخة النهائية. عمرك ما تبدل الفكرة بلا ماتقول: التبديلات الكبيرة كتبدا بـ «غادي نبدل الاتجاه حيت …».';

export const GOLDEN_RULE = {
  chain: ['فيوز', 'فولوورز', 'ديامات', 'كوميونيتي', 'ثقة', 'كليان', 'منتوجات'],
  text: 'ماشي كونتنو كثر بأي ثمن. الهدف ماشي غير تولي فيرال، الهدف هو براند شخصي قوي كيدخل الفلوس على المدى الطويل.',
} as const;

/* ───────────── Reel review records (stored per device on /manager) ───────────── */

export interface ReelReview {
  id: string;
  title: string;
  /** REEL_SLOTS slot number, or null if not assigned yet. */
  slot: number | null;
  cta: Cta | null;
  contentType: ContentType | null;
  /** Ticked QUALITY_CHECK items as "groupId:index". */
  checks: string[];
  /** Ticked POSTING_CHECKLIST items by index. */
  posting: number[];
  scores: Partial<Record<ScoreId, Rating>>;
  mustFix: string;
  createdAt: string;
}

export function checkKey(groupId: string, index: number): string {
  return `${groupId}:${index}`;
}

export function newReelReview(id: string, createdAt: string): ReelReview {
  return {
    id,
    title: '',
    slot: null,
    cta: null,
    contentType: null,
    checks: [],
    posting: [],
    scores: {},
    mustFix: '',
    createdAt,
  };
}

/** Brings a stored review up to date (old German rating values → ids). */
export function normalizeReview(review: ReelReview): ReelReview {
  const scores: Partial<Record<ScoreId, Rating>> = {};
  for (const c of SCORE_CATEGORIES) {
    const rating = normalizeRating((review.scores as Record<string, unknown> | undefined)?.[c.id]);
    if (rating) scores[c.id] = rating;
  }
  return { ...review, scores };
}

/** The CTA a slot uses by default (first allowed one). */
export function defaultCtaForSlot(slot: number): Cta | null {
  return REEL_SLOTS.find((r) => r.slot === slot)?.ctas[0] ?? null;
}

/**
 * Whether a reel may be posted, and what still blocks it. The rules come
 * straight from the system: no reel without a real CTA that fits its slot,
 * no category rated "change", every Must Fix done, the protection rules and
 * the full posting checklist ticked — and a Deutsch reel needs Natty context.
 */
export function postingReadiness(review: ReelReview): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  const slot = REEL_SLOTS.find((r) => r.slot === review.slot);

  if (!review.title.trim()) blockers.push('العنوان ولا الفكرة ناقصين.');
  if (!slot) blockers.push('السلوت ناقص.');
  if (!review.cta) blockers.push('ماكاينش CTA: ختار PLAN، DEUTSCH ولا SQUAD.');
  else if (slot && !slot.ctas.includes(review.cta))
    blockers.push(`CTA ${review.cta} ماكيناسبش السلوت ${slot.slot} (${slot.ctas.join(' / ')}).`);

  if (slot?.kind === 'deutsch') {
    const deutsch = QUALITY_CHECK.find((g) => g.id === 'deutsch')!;
    const contextIndex = deutsch.items.indexOf(DEUTSCH_CONTEXT_ITEM);
    if (!review.checks.includes(checkKey('deutsch', contextIndex)))
      blockers.push('ريل الألمانية بلا سياق Natty Simo مأكد.');
  }

  const risk = QUALITY_CHECK.find((g) => g.id === 'risk')!;
  const openRisks = risk.items.filter((_, i) => !review.checks.includes(checkKey('risk', i)));
  if (openRisks.length > 0) blockers.push(`اختبار الحماية مازال مفتوح (${openRisks.length}).`);

  const toChange = SCORE_CATEGORIES.filter((c) => review.scores[c.id] === 'change');
  if (toChange.length > 0)
    blockers.push(`${RATING_LABELS.change} فـ: ${toChange.map((c) => c.label).join('، ')}.`);

  const openMustFix = review.mustFix
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !/^\[x\]/i.test(l));
  if (openMustFix.length > 0)
    blockers.push(`Must Fix مازال مفتوح (${openMustFix.length}). السطورة اللي سالاو بداهم بـ [x].`);

  const openPosting = POSTING_CHECKLIST.length - new Set(review.posting).size;
  if (openPosting > 0) blockers.push(`ليستة النشر: ${openPosting} مازال.`);

  return { ready: blockers.length === 0, blockers };
}

/** The full review prompt, to paste into Claude together with a script or transcript. */
export function buildReviewPrompt(): string {
  const lines: string[] = [];
  lines.push('Natty Simo – مراقبة الجودة ديال المحتوى');
  lines.push('');
  lines.push(
    'نتا من دابا المانجر ديال المحتوى، الكرييتيف دايركتور، محرر السكريبت، سبيسياليست الهوك، محلل الريتونشن وحارس البراند ديال Natty Simo. ماتمدحش، راجع بصرامة. بلا مجاملة.',
  );
  lines.push(
    'جاوب ديما بالدارجة المغربية بالحروف العربية. الكلمات PLAN و DEUTSCH و SQUAD، أسماء البراند والعلامات بحال [KEEP] خليهم كيف ما هوما. إلا كان فالريل شي جزء بالألمانية، خليه بالألمانية وشرحو بالدارجة. النسخة النهائية ديال السكريبت بالدارجة.',
  );
  lines.push('');
  lines.push(`الأحكام: ${VERDICTS.map((v) => `${v.label} (${v.when})`).join('، ')}.`);
  lines.push(`علامات السكريبت: ${SCRIPT_MARKS.map((m) => `${m.mark} = ${m.meaning}`).join('، ')}.`);
  lines.push('');
  lines.push('البراند');
  lines.push(`${IDENTITY.summary} الشعار: ${IDENTITY.claim}`);
  lines.push(`السلسلة: ${IDENTITY.chain.join(' ← ')}`);
  lines.push(`الترتيب: ${IDENTITY.hierarchy.map((h, i) => `${i + 1}. ${h}`).join(' ')}`);
  lines.push(
    'الكتابة: Natty Simo = الشخص والكرياتور. NATYSIMO = براند الحوايج. حتى كتابة أخرى ماكايناش.',
  );
  lines.push(IDENTITY.deutschNote);
  lines.push(`القصة: ${IDENTITY.storyChain.join(' ← ')} ← … (الباقي مازال مفتوح، ماتخترع والو)`);
  lines.push('');
  lines.push('الجمهور');
  lines.push(AUDIENCE.summary);
  for (const p of AUDIENCE.points) lines.push(`- ${p.term}: ${p.text}`);
  lines.push(`${AUDIENCE.protectionIntro} ${PROTECTION_RULES.join('، ')}.`);
  lines.push('');
  lines.push('السلوتات ديال الريلز');
  for (const r of REEL_SLOTS)
    lines.push(
      `${r.slot}${r.optional ? ' (اختياري)' : ''}. ${r.topic} ← CTA ${r.ctas.join(' ولا ')}`,
    );
  lines.push(`الكلمات ديال CTA: ${CTAS.join('، ')}. ماشي «دير لايك وفولو».`);
  lines.push('');
  lines.push('قبل ما تبدا، جاوب');
  for (const q of PRE_QUESTIONS) lines.push(`${q.id}. ${q.question} ${q.rule}`);
  lines.push('');
  lines.push('راجع');
  for (const g of QUALITY_CHECK) {
    lines.push(`${g.title}${g.note ? ` (${g.note})` : ''}`);
    for (const i of g.items) lines.push(`- ${i}`);
  }
  lines.push('');
  lines.push(`علّم ${CONTENT_TYPES.map((c) => `«${c.label}» (${c.text})`).join(' ولا ')}`);
  lines.push(
    `السكور النهائي، ماشي 10/10: ${SCORE_CATEGORIES.map((c) => c.label).join('، ')}، كل وحدة: ${RATINGS.map((r) => RATING_LABELS[r]).join(' / ')}. من بعد: MUST FIX، SHOULD FIX، OPTIONAL، KEEP.`,
  );
  lines.push('');
  lines.push(`مهم: ${REVIEW_RULE}`);
  lines.push('');
  lines.push('شكل الجواب (بهاد الترتيب بالضبط)');
  REVIEW_ANSWER_FORMAT.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push(
    `السكريبت النهائي بـ ${FINAL_SCRIPT_MARKS.join(' ')}. وزيد 3 هوكات بديلة و3 نصوص للكوفر.`,
  );
  lines.push('');
  lines.push('ليستة النشر');
  for (const p of POSTING_CHECKLIST) lines.push(`☐ ${p}`);
  lines.push('');
  lines.push(`القاعدة الذهبية: ${GOLDEN_RULE.chain.join(' ← ')}. ${GOLDEN_RULE.text}`);
  lines.push(IDENTITY.claim);
  lines.push('');
  lines.push('ها المحتوى ديالي:');
  return lines.join('\n');
}
