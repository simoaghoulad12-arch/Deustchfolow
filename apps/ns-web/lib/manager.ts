/**
 * Natty Simo – Management-System (90 Tage), Stand 3. Okt. 2026.
 *
 * Private working document for the founder, rendered at /manager (noindex,
 * unlinked — see ASSETS.md). Copy is kept exactly as written; nothing is
 * invented. Open points stay marked as open. The brand name is spelled
 * NATYSIMO here like everywhere else in the site.
 */

export const MANAGER_META = {
  title: 'Natty Simo – Management-System (90 Tage)',
  date: '3. Okt. 2026',
  author: '@Simo',
} as const;

export type Cta = 'PLAN' | 'DEUTSCH' | 'SQUAD';
export const CTAS: Cta[] = ['PLAN', 'DEUTSCH', 'SQUAD'];

export const IDENTITY = {
  summary:
    'Natty Simo steht für eine Lebensweise, nicht für einen Fitness-Kanal: Disziplin als Weg zur Freiheit und zur eigenen Marke.',
  claim: 'Discipline builds freedom.',
  chain: [
    'Disziplin',
    'Fitness',
    'Sprache',
    'Deutschland',
    'Selbstentwicklung',
    'Freiheit',
    'eigene Marke',
  ],
  hierarchy: [
    'Natty Simo (die Person)',
    'Fitness / Hybrid / Disziplin (der Kern)',
    'Marokkaner in Deutschland',
    'Deutsch bdarija',
    'NATYSIMO (die Kleidungsmarke)',
    'Hybrid-Programm und Produkte',
  ],
  deutschNote:
    'Smart Deutsch darf wachsen, aber du wirst kein reiner Deutschlehrer. Jedes Deutsch-Reel trägt einen Natty-Bezug.',
  /** Only the known part. The rest of the story chain is still open. */
  storyChain: ['Salé', 'Deutschland'],
  storyChainOpen: true,
} as const;

export const AUDIENCE = {
  summary:
    'Junge Menschen in Marokko, die Fitness, Disziplin und ein besseres Leben suchen: 79,6 % der interagierenden Konten, 81 % Männer, die meisten zwischen 18 und 34.',
  points: [
    {
      term: 'Interessen',
      text: 'Fitness, Muskelaufbau, Hybrid Training, Selbstentwicklung, Motivation, Deutschland, Deutsch lernen, Ausbildung und Studium in Deutschland.',
    },
    { term: 'Darija', text: 'ist die Hauptsprache jedes Reels.' },
    { term: 'Deutsch', text: 'ist Werkzeug und Alleinstellungsmerkmal, nie die Hauptsache.' },
    {
      term: 'Untertitel immer',
      text: 'Darija-Video mit deutschen oder arabischen Untertiteln, Deutsch-Inhalt mit Darija-Erklärung.',
    },
    {
      term: 'Schutz',
      text: 'Fast 10 % deiner Reichweite sind unter 18. Keine Diät-Extreme, keine Supplement-Versprechen.',
    },
  ],
} as const;

export const GOAL_CHAIN = ['View', 'Follow', 'Gespräch', 'Community', 'Vertrauen', 'Produkt'];

export const RULES_INTRO =
  'Dein Problem ist Bindung, nicht Reichweite: 93,5 % der Interaktionen kamen von Nicht-Followern, nur 876 Story-Antworten in drei Monaten.';

export const RULES: { title: string; text: string }[] = [
  {
    title: 'Nur 3 Prioritäten pro Woche',
    text: 'Content/Reels, Community, Analyse. Alles andere ist Zusatz.',
  },
  {
    title: 'Neue Idee? Erst der Test',
    text: 'Hilft das jetzt einer dieser drei Prioritäten? Wenn nein, lautet die Antwort NICHT JETZT.',
  },
  {
    title: 'Fitness ist der Kern',
    text: 'Deutsch bdarija ist höchstens 1 von 4–5 Reels pro Woche.',
  },
  {
    title: 'Kein Reel ohne CTA',
    text: 'die ein Gespräch oder eine Community-Aktion auslöst, nicht nur „Like und Follow“.',
  },
  {
    title: 'Community vor Views',
    text: 'Jede Woche zählt, wie viele Menschen aus Reels im Gespräch oder im Broadcast landen.',
  },
  { title: 'Fertig ist besser als perfekt', text: '' },
];

export const RULES_NOTE =
  'Die Verteilung der Reels darf sich ändern, wenn die Daten es rechtfertigen. Fitness bleibt trotzdem der Kern.';

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
    topic: 'Hybrid / Fitness / Disziplin',
    hook: '„Ich laufe 5 km UND bankdrücke 100 kg. Natty. Das ist mein Plan.“',
    ctas: ['PLAN'],
  },
  {
    slot: 2,
    kind: 'fitness',
    topic: 'Hybrid / Disziplin / Serie („Hybrid Journey – Tag X/90“)',
    hook: '„Tag 12: Training nach der Spätschicht.“',
    ctas: ['PLAN', 'SQUAD'],
  },
  {
    slot: 3,
    kind: 'morocco-germany',
    topic: 'Marokkaner in Deutschland / Humor / Reality',
    hook: '„Deutsche Pünktlichkeit vs. marokkanisches ‚daba daba‘.“',
    ctas: ['SQUAD'],
  },
  {
    slot: 4,
    kind: 'deutsch',
    topic: 'Deutsch bdarija mit Natty-Bezug',
    hook: '„3 deutsche Sätze fürs Gym, die jeder braucht.“',
    ctas: ['DEUTSCH'],
  },
  {
    slot: 5,
    optional: true,
    kind: 'personal',
    topic: 'Schichtdienst / Personal Story / Behind the Brand',
    hook: '„Ihr entscheidet: Schwarz oder Off-White für mein erstes Teil?“',
    ctas: ['SQUAD'],
  },
];

export const REEL_NOTES = [
  {
    term: 'Deutsch-Reels nur mit Bezug',
    text: 'Deutsch fürs Gym, Deutsch für die Ausbildung, Deutsch im Schichtdienst, Deutsch in Deutschland, typische Situationen für Marokkaner in Deutschland. Keine allgemeinen Lektionen.',
  },
  {
    term: 'Ton',
    text: 'provokant, aber sympathisch. Du neckst Verhalten, nie Gruppen, Körper oder Patienten. Aufnahmen auf Station und Patientenbezug gibt es nie.',
  },
];

export const FUNNEL_FLOW = [
  'Reel-CTA',
  'User schreibt das Keyword',
  'deine Antwort (innerhalb von 24 Stunden)',
  '1 Frage',
  'hilfreicher Inhalt',
  'Follow-up nach 2–3 Tagen',
  'Einladung in Natty Squad',
  'später eventuell ein Produkt',
];

export const FUNNEL_NOTE =
  'Keine Automation, du antwortest selbst, notfalls mit gespeicherten Textbausteinen.';

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
    label: 'Fitness / Hybrid',
    steps: [
      {
        step: 'Antwort',
        text: 'Sprachnachricht oder kurzer Text auf Darija.',
        snippet: 'Wa sahbi, hier ist dein Einstieg. Eine Frage vorab …',
      },
      {
        step: 'Frage',
        text: 'Wahlweise: wie oft pro Woche kannst du trainieren?',
        snippet: 'Was ist dein Ziel gerade: Muskeln, Ausdauer oder beides?',
      },
      {
        step: 'Hilfreicher Inhalt',
        text: 'der passende Mini-Plan oder ein Reel, das die Frage beantwortet.',
      },
      { step: 'Follow-up nach 2–3 Tagen', text: '', snippet: 'Wie lief die erste Einheit?' },
      {
        step: 'Community',
        text: 'Einladung zu Natty Squad. Die gesammelten Antworten zeigen, was die Community wirklich braucht (Quelle fürs Hybrid-Programm).',
      },
    ],
  },
  {
    keyword: 'DEUTSCH',
    label: 'Deutsch / Deutschland',
    steps: [
      { step: 'Antwort', text: 'Das versprochene Material (Vokabeln oder Sätze) mit Natty-Bezug.' },
      {
        step: 'Frage',
        text: '',
        snippet: 'Wofür brauchst du Deutsch: Ausbildung, Arbeit, Studium oder Alltag?',
      },
      {
        step: 'Hilfreicher Inhalt',
        text: 'ein passendes Reel oder eine Antwort auf die konkrete Situation.',
      },
      {
        step: 'Follow-up',
        text: '',
        snippet: 'Hat dir das geholfen? Was ist dein größtes Problem mit Deutschland?',
      },
      { step: 'Community', text: 'Einladung zu Natty Squad, nicht in einen eigenen Deutsch-Kurs.' },
    ],
  },
  {
    keyword: 'SQUAD',
    label: 'Broadcast',
    steps: [
      { step: 'Antwort', text: 'Link zum Natty-Squad-Channel plus ein Satz, was dort passiert.' },
      {
        step: 'Frage',
        text: '',
        snippet:
          'Was wünschst du dir im Squad am meisten: Trainingstipps, Deutsch-Hilfe oder Behind the Brand?',
      },
      { step: 'Begrüßung im Channel', text: 'erste Umfrage, damit der Neue sofort mitmacht.' },
      { step: 'Follow-up', text: 'nach einer Woche, ob die Inhalte passen.' },
    ],
  },
];

export const SQUAD_INTRO =
  'Natty Squad ist der Ort, an dem aus Zuschauern eine Community wird. Plane 2–4 Nachrichten pro Woche, mehr braucht es nicht.';

export const BROADCAST_TYPES: { type: string; purpose: string; example: string }[] = [
  {
    type: 'Umfrage',
    purpose: 'Gespräch und Datenquelle',
    example: '„Schwarz oder Off-White für das erste Teil?“',
  },
  {
    type: 'Sprachnachricht (Darija)',
    purpose: 'Nähe und Vertrauen',
    example: '60 Sekunden zu deiner Woche und dem nächsten Reel',
  },
  {
    type: 'Challenge',
    purpose: 'Gemeinsame Aktion',
    example: '„30 Tage Discipline“: täglich 10 Minuten Training und 1 deutsches Wort',
  },
  {
    type: 'Early Access',
    purpose: 'Grund zu bleiben',
    example: 'Reel oder Design vor allen anderen sehen',
  },
  {
    type: 'Persönliches Update',
    purpose: 'Story und Authentizität',
    example: 'Spätschicht, Training trotzdem gemacht',
  },
  {
    type: 'Exklusive Info',
    purpose: 'Wert nur für Mitglieder',
    example: 'Live-Termin, Plan, Warteliste NATYSIMO',
  },
];

export const SQUAD_CHECKLIST = [
  'Das Reel endet mit einer CTA (PLAN, DEUTSCH oder SQUAD) und nennt den Nutzen für den Squad.',
  'Der Channel ist in der Bio und in den Highlights sichtbar.',
  'Jede DM-Antwort enthält eine Einladung.',
  'Ein Reel pro Woche bewirbt den Squad direkt (zum Beispiel mit einer Challenge oder einer Umfrage, die es nur dort gibt).',
  'Du erwähnst im Reel, was es diese Woche im Squad gibt.',
];

export const WEEK_INTRO =
  'Eine normale Woche braucht 4–5 Stunden, eine Prüfungs- oder schwere Schichtwoche nur etwa 2 Stunden. Ausgangspunkt sind iPhone 16 und CapCut, kein Team, kein Studio.';

export const WEEK: { day: string; task: string; time: string }[] = [
  {
    day: 'Sonntag',
    task: 'Manager Day: Analyse, 5 Hooks schreiben, 3–4 Reels am Stück filmen, Woche planen',
    time: '2–2,5 h',
  },
  {
    day: 'Montag',
    task: 'Editing: 2 Reels in CapCut schneiden, Untertitel einfügen',
    time: 'ca. 45 Min.',
  },
  {
    day: 'Mittwoch',
    task: 'Weiterer Content (Karussell oder Reel) plus 1–2 Broadcast-Nachrichten',
    time: '30–45 Min.',
  },
  {
    day: 'Training',
    task: 'Rohmaterial filmen: 3 Clips pro Einheit (Hook-Clip, Arbeits-Clip, Reaktion), keine Extra-Zeit',
    time: '0',
  },
  {
    day: 'Täglich',
    task: 'Kommentare in der ersten Stunde nach dem Posting, DMs, 2–3 Stories',
    time: '10–15 Min.',
  },
  { day: 'Alle 1–2 Wochen', task: '20-Minuten-Live mit Q&A (Sonntagabend)', time: '20–30 Min.' },
];

export const EMERGENCY_MODE = {
  time: 'ca. 2 Stunden',
  tasks: [
    '2 Reels aus vorhandenem Material',
    'tägliche einfache Stories',
    'Kommentare und DMs',
    '1 Broadcast-Nachricht',
  ],
  never:
    'Im Notfallmodus gibt es kein Live, keine neue Serie und keine neue Business-Infrastruktur.',
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
  'Startwerte aus dem Instagram-Export (20. Juni bis 17. September 2026). Die Zielwerte sind Planungsannahmen, keine Benchmarks. Der DM-Startwert fehlt, zähle ab der ersten Woche mit.';

export const KPIS: Kpi[] = [
  {
    id: 'shares',
    label: 'Shares pro Reel',
    start: '89.998 Shares insgesamt (Reels)',
    target: 'Pro Reel notieren, Trend steigt',
  },
  {
    id: 'storyReplies',
    label: 'Story-Antworten',
    start: '876 in 3 Monaten',
    target: 'mindestens 3.000',
  },
  {
    id: 'unfollowRate',
    label: 'Unfollows im Verhältnis zu neuen Followern',
    start: '4.887 zu 26.105 (ca. 19 %)',
    target: 'unter 12 %',
    unit: '%',
  },
  { id: 'squadMembers', label: 'Broadcast-Mitglieder', start: '0', target: '1.500–2.500' },
  {
    id: 'dmLeads',
    label: 'DM-Leads (PLAN, DEUTSCH, SQUAD)',
    start: 'nicht erfasst',
    target: 'mindestens 500',
  },
];

export const SUNDAY_FLOW = [
  '15 Minuten Analyse der 5 Zahlen.',
  'Top-Reel der Woche bestimmen.',
  'Schwächstes Reel bestimmen.',
  'Wiederholbare Muster erkennen (Thema, Hook, Länge, CTA).',
  '5 Hooks schreiben.',
  '3–4 Reels filmen.',
  'Nächste Woche planen (Reels, Broadcast-Termine, ob ein Live ansteht).',
];

export const DECISION_RULES: { signal: string; action: string }[] = [
  { signal: 'Shares und Gespräche', action: 'eine Serie daraus machen.' },
  { signal: 'Nur Views', action: 'nicht automatisch wiederholen.' },
  {
    signal: 'Wenig Views, aber viele DMs oder Gespräche',
    action:
      'nicht löschen und nicht ignorieren. Solche Inhalte können für Community und Business wichtiger sein.',
  },
  { signal: 'Ein Thema bringt wiederholt gute Ergebnisse', action: 'Priorität erhöhen.' },
];

export const BRAND_PATH = {
  intro:
    'Beide Projekte wachsen langsam aus der Community heraus, nicht aus Produktion und Verkaufsdruck.',
  path: ['Story', 'Behind the Brand', 'Community entscheidet', 'Warteliste', 'später Drop'],
  notPath: ['Produktion', 'Lager', 'großer Verkauf'],
  ideas: [
    'Logo und Monogramm (Entstehung zeigen)',
    'T-Shirt: Schnitt, Material, Design',
    'Farben (Abstimmung im Squad)',
    '„Was würdet ihr tragen?“',
    'Entstehung dokumentieren, auch Fehlversuche',
  ],
} as const;

export const HYBRID_STEPS = [
  'Content',
  'Probleme der Community sammeln',
  'PLAN-DMs beantworten',
  'Kostenlose Hilfe geben',
  'Nachfrage testen',
  'Founding Members',
  'Beta',
  'Feedback einarbeiten',
  'Endgültiges Programm',
  'Launch',
];

export const HYBRID_NOTE =
  'Schritt 6 beginnt erst, wenn Schritt 5 echte Nachfrage zeigt, etwa viele PLAN-DMs und aktive Antworten im Squad. Die Preisgestaltung entscheidest du später, mit Blick auf die Kaufkraft deiner Zielgruppe in Marokko.';

export const NOT_NOW: { topic: string; why: string; allowedWhen: string }[] = [
  {
    topic: 'Asal Achifa auf dem Hauptkanal',
    why: 'Fremdes Thema, Health-Claims-Risiko, lenkt vom Kern ab',
    allowedWhen: 'Natty Simo stabil läuft; dann nur auf einem eigenen Kanal',
  },
  {
    topic: 'Große NATYSIMO-Produktion, Drop',
    why: 'Nachfrage ist nicht validiert',
    allowedWhen: 'Warteliste und Abstimmungen zeigen echte Nachfrage',
  },
  {
    topic: 'Website-Perfektion',
    why: 'Nur notwendige Infrastruktur zählt',
    allowedWhen: 'Es gibt eine Warteliste, die sie braucht',
  },
  {
    topic: 'Smart Deutsch als eigener Hauptkanal',
    why: 'Du würdest zum reinen Deutschlehrer',
    allowedWhen: 'Fitness-Kern und Community stehen',
  },
  {
    topic: 'Neue Plattformen',
    why: 'Verteilt Aufmerksamkeit',
    allowedWhen: 'Instagram läuft im Rhythmus und die KPIs stehen',
  },
  {
    topic: 'Neue Produkte',
    why: 'Erst Nachfrage validieren',
    allowedWhen: 'Das Hybrid-Programm hat Founding Members',
  },
  {
    topic: 'Perfektionismus',
    why: 'Kostet Zeit, bringt keine Bindung',
    allowedWhen: 'nie: fertig ist besser als perfekt',
  },
];

export const START_TOMORROW = {
  date: 'Sonntag, 4. Oktober 2026',
  steps: [
    '15 Minuten Analyse: Top-Reel und schwächstes Reel der letzten Woche, die 5 Zahlen notieren.',
    '5 Hooks schreiben (Fitness 2, Marokkaner in Deutschland 1, Deutsch mit Natty-Bezug 1, Behind the Brand oder Schichtdienst 1).',
    'Natty Squad eröffnen und die erste Nachricht in Darija senden: Wer bist du, was kommt diese Woche, wie macht man mit?',
    'Bio, Highlights und angepinnte Reels auf Natty Simo ausrichten (Hauptaccount festlegen).',
    '3 Reels im gleichen Outfit und mit gleichem Licht am Stück filmen, jedes mit einer CTA (PLAN, DEUTSCH oder SQUAD).',
    'Montag: schneiden. Mittwoch: Broadcast-Nachrichten und weiterer Content.',
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
