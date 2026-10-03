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
    'Natty Simo (die Person, Personal Brand)',
    'Fitness / Hybrid / Disziplin (der Kern)',
    'Marokkaner in Deutschland',
    'Deutsch bdarija',
    'NATYSIMO (Clothing Brand)',
    'Hybrid-Programm und Produkte',
  ],
  deutschNote:
    'Smart Deutsch darf wachsen, aber Natty Simo wird kein reiner Deutschlehrer-Account. Deutsch ist ein Tool und Differenzierungsmerkmal. Jedes Deutsch-Reel braucht einen relevanten Natty-Simo-Kontext.',
  /** Only the known part. The rest of the story chain is still open — never invent it. */
  storyChain: ['Salé', 'Deutschland'],
  storyChainOpen: true,
} as const;

export const AUDIENCE = {
  summary:
    'Junge Menschen aus Marokko, die fitter und disziplinierter werden, ihr Leben verbessern und sich weiterentwickeln wollen, Deutschland interessant finden, Deutsch lernen wollen oder Ausbildung/Studium in Deutschland überlegen. In deinen Zahlen: 79,6 % der interagierenden Konten, 81 % Männer, die meisten zwischen 18 und 34.',
  points: [
    {
      term: 'Interessen',
      text: 'Fitness, Muskelaufbau, Hybrid Training, Disziplin, Motivation, Selbstentwicklung, Deutschland, Deutsch, Ausbildung, Studium, besseres Leben.',
    },
    { term: 'Darija', text: 'ist die Hauptsprache jedes Reels.' },
    { term: 'Deutsch', text: 'ist Differenzierung, nicht Hauptidentität.' },
    {
      term: 'Untertitel immer',
      text: 'Darija-Video mit deutschen oder arabischen Untertiteln je nach Kontext, deutsches Video mit Darija-Erklärung.',
    },
  ],
  protectionIntro: 'Ungefähr 10 % der Reichweite sind unter 18. Deshalb:',
} as const;

/** Hard content limits. Checked in every reel review (see QUALITY_CHECK › risk). */
export const PROTECTION_RULES = [
  'keine extremen Diätversprechen',
  'keine Supplement-Heilsversprechen',
  'keine gefährlichen Fitnessversprechen',
  'keine problematischen Aussagen über Körper',
  'keine Patienten-/Stationsaufnahmen',
  'keine privaten Patientendaten',
];

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
    text: 'Gym, Ausbildung, Schicht, Deutschland, Alltag, echte Situationen für Marokkaner in Deutschland. Keine reinen Deutschlehrer-Reels ohne Natty-Bezug.',
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

/* ───────────────────────── Reel-Qualitäts-Check ─────────────────────────
 * The content quality control system: every reel is checked against this
 * before posting. Used by the reel reviewer on /manager and by the review
 * prompt that Simo pastes into Claude together with a script.
 */

export type Verdict = 'BEHALTEN' | 'ÄNDERN' | 'STREICHEN' | 'NICHT JETZT';

export const VERDICTS: { verdict: Verdict; when: string }[] = [
  { verdict: 'BEHALTEN', when: 'funktioniert' },
  { verdict: 'ÄNDERN', when: 'ist schlecht' },
  { verdict: 'STREICHEN', when: 'ist unnötig' },
  { verdict: 'NICHT JETZT', when: 'ist später sinnvoll' },
];

export const SCRIPT_MARKS: { mark: string; meaning: string }[] = [
  { mark: '[KEEP]', meaning: 'behalten' },
  { mark: '[CHANGE]', meaning: 'ändern' },
  { mark: '[DELETE]', meaning: 'löschen' },
  { mark: '[ADD]', meaning: 'hinzufügen' },
  { mark: '[MOVE]', meaning: 'Position ändern' },
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
    text: 'Bringt Reichweite, aber wenig Community oder Beziehung. Nicht automatisch schlecht.',
  },
  {
    id: 'conversion',
    label: 'CONVERSION CONTENT',
    text: 'Könnte wenig Views haben, aber starke DMs erzeugen. Nicht löschen, nicht ignorieren.',
  },
];

/** Answered before the reel is touched. No clear answer → ÄNDERN. */
export const PRE_QUESTIONS: { id: string; question: string; rule: string }[] = [
  {
    id: 'A',
    question: 'Was ist die zentrale Idee? (ein Satz)',
    rule: 'Nicht in einem Satz erklärbar → ÄNDERN.',
  },
  { id: 'B', question: 'Warum sollte jemand das anschauen?', rule: 'Ein konkreter Grund.' },
  {
    id: 'C',
    question: 'Warum sollte ein Marokkaner zwischen 18 und 34 das anschauen?',
    rule: 'Keine klare Antwort → ÄNDERN.',
  },
  {
    id: 'D',
    question: 'Was bekommt der Zuschauer?',
    rule: 'Mindestens eins: Information, Emotion, Motivation, Unterhaltung, Inspiration, praktischer Nutzen, Identifikation, Story.',
  },
  {
    id: 'E',
    question: 'Was soll der Zuschauer danach tun?',
    rule: 'Kommentieren, DM, PLAN, DEUTSCH, SQUAD, Broadcast beitreten, speichern, teilen. Keine klare Handlung → ÄNDERN.',
  },
];

export interface CheckGroup {
  id: string;
  title: string;
  items: string[];
  /** Only relevant for some reels; the reviewer can still tick it. */
  note?: string;
}

export const QUALITY_CHECK: CheckGroup[] = [
  {
    id: 'idea',
    title: 'Idee',
    items: [
      'Die Idee ist klar (in einem Satz erklärbar).',
      'Sie passt zur Brand Natty Simo.',
      'Sie passt zur Zielgruppe (Marokko, 18–34).',
      'Es gibt einen echten Grund, warum jemand das sehen sollte.',
    ],
  },
  {
    id: 'hook',
    title: 'Hook (0–1 s und 1–3 s)',
    items: [
      'Das erste Wort ist stark.',
      'Die erste Sekunde hat einen Grund weiterzuschauen.',
      'Die erste Aussage ist sofort verständlich.',
      'Das visuelle Opening zieht.',
      'Es entsteht Spannung oder Neugier.',
      'Spezifisch, glaubwürdig und passend zu Natty Simo.',
      'Kurz genug, keine Füllwörter, wichtigste Info nicht zu spät.',
    ],
  },
  {
    id: 'script',
    title: 'Script (Wort für Wort)',
    items: [
      'Jedes Wort und jede Aussage geprüft und markiert ([KEEP] [CHANGE] [DELETE] [ADD] [MOVE]).',
      'Keine unnötigen Wörter, keine Wiederholungen.',
      'Reihenfolge stimmt.',
      'Verständlich, natürlich, klingt wie Simo und nicht wie ein KI-Text.',
      'Tonalität, Emotion und Provokation stimmen.',
      'Glaubwürdig: nichts behauptet, was nicht stimmt.',
    ],
  },
  {
    id: 'darija',
    title: 'Darija',
    items: [
      'Klingt wie echte marokkanische Alltagssprache.',
      'Ein junger Marokkaner würde es genau so sagen.',
      'Keine unnötigen deutschen Wörter, nichts zu formell.',
      'Sofort verständlich.',
    ],
  },
  {
    id: 'deutsch',
    title: 'Deutsch',
    note: 'Nur wenn Deutsch vorkommt.',
    items: [
      'Grammatik und Wortwahl korrekt.',
      'Aussprache sauber.',
      'B1/B2-verständlich, wenn es für die Zielgruppe gedacht ist.',
      'Das deutsche Wort ist wirklich nötig (sonst Darija-Erklärung).',
      'Relevanter Natty-Simo-Kontext (Gym, Ausbildung, Schicht, Deutschland, Alltag, echte Situation).',
    ],
  },
  {
    id: 'retention',
    title: 'Retention (Sekunde für Sekunde)',
    items: [
      'Keine toten Sekunden (Dead Seconds).',
      'Keine unnötigen Pausen.',
      'Visuell passiert genug.',
      'Es entsteht eine offene Frage.',
      'Es gibt einen Grund, bis zum Ende zu schauen.',
      'Die wichtigste Information kommt nicht zu spät.',
      'Kein offensichtlicher Drop-off-Grund.',
    ],
  },
  {
    id: 'visual',
    title: 'Visual',
    items: [
      'Kamera, Licht, Perspektive und Bildausschnitt stimmen.',
      'Gesicht, Körperhaltung und Hintergrund passen.',
      'Bewegung, Stabilität und Geschwindigkeit passen.',
      'B-Roll sinnvoll (Gym Shots, Deutschland Shots).',
      'Cuts sitzen (Jump Cuts, Zooms, Perspektivwechsel).',
      'Text Overlay: Position, Größe, Lesbarkeit, Timing, nicht zu viel Text.',
    ],
  },
  {
    id: 'audio',
    title: 'Audio',
    items: [
      'Stimme verständlich und natürlich.',
      'Musik passend und leiser als die Stimme.',
      'SFX sinnvoll.',
      'Keine störenden Geräusche, keine unnötige Stille.',
    ],
  },
  {
    id: 'subtitles',
    title: 'Untertitel',
    items: [
      'Rechtschreibung geprüft, jedes Wort.',
      'Darija und Deutsch korrekt, keine falsche Übersetzung.',
      'Timing sitzt.',
      'Lesbar, Zeilenlänge kurz.',
      'Wichtige Wörter hervorgehoben.',
    ],
  },
  {
    id: 'story',
    title: 'Story und Emotion',
    items: [
      'Struktur erkennbar (z. B. Hook → Problem → Spannung → Entwicklung → Payoff → CTA).',
      'Es gibt eine Entwicklung.',
      'Eine klare Emotion (Motivation, Überraschung, Neugier, Stolz, Humor, Identifikation, Ehrgeiz, Hoffnung …).',
    ],
  },
  {
    id: 'provocation',
    title: 'Provokation',
    items: [
      'Provokation greift Verhalten an, nicht Menschen oder Gruppen.',
      'Keine Angriffe auf Nationalitäten, Religionen, Körper, Patienten, vulnerable Personen.',
      'Unnötig aggressive Aussagen: gleiche Energie, intelligenter formuliert.',
    ],
  },
  {
    id: 'cta',
    title: 'CTA',
    items: [
      'Klarer CTA vorhanden: PLAN, DEUTSCH oder SQUAD.',
      'Er entsteht natürlich aus dem Inhalt.',
      'Konkret, nicht „Like und Follow“.',
      'Nennt den Nutzen für den Squad, wenn passend.',
    ],
  },
  {
    id: 'funnel',
    title: 'DM-Funnel',
    items: [
      'Der CTA führt in einen echten Funnel (Antwort → Frage → Inhalt → Follow-up → Natty Squad).',
      'Textbausteine für die Antworten sind bereit.',
    ],
  },
  {
    id: 'caption',
    title: 'Caption',
    items: [
      'Wiederholt nicht einfach das Reel (Kontext, Zusatzinfo, Diskussion oder CTA).',
      'Erste Zeile stark.',
      'Lesbar, passende Länge.',
      'Keyword wiederholt.',
      'Keine unnötigen Hashtags, keine Tippfehler.',
    ],
  },
  {
    id: 'cover',
    title: 'Cover',
    items: [
      'In 1 Sekunde verständlich, wenige Wörter.',
      'Starke Emotion, klarer Kontrast.',
      'Thema sofort erkennbar, passt zur Brand.',
      '3 Cover-Texte zur Auswahl geschrieben.',
    ],
  },
  {
    id: 'brand',
    title: 'Brand',
    items: [
      'Man erkennt Natty Simo (Persönlichkeit, Sprache, Haltung, Story).',
      'Könnte nicht von jedem anderen Fitness-Creator kommen (sonst BRAND WEAK).',
      'Schreibweise: Natty Simo (Person), NATYSIMO (Clothing).',
    ],
  },
  {
    id: 'monetization',
    title: 'Community und Monetarisierung',
    items: [
      'Baut Community oder DM-Leads auf (oder ist bewusst REACH CONTENT).',
      'Unterstützt später etwas: Hybrid-Programm, NATYSIMO, Kooperationen, Produkte.',
    ],
  },
  {
    id: 'risk',
    title: 'Schutz und Risiken',
    items: [
      ...PROTECTION_RULES.map((r) => `${r.charAt(0).toUpperCase()}${r.slice(1)}.`),
      'Keine möglichen Missverständnisse, keine unnötigen Claims.',
    ],
  },
  {
    id: 'not-now',
    title: 'NICHT-JETZT-Check',
    items: [
      'Die Idee unterstützt Content/Reels, Community oder Analyse.',
      'Keine Idee aus der NICHT-JETZT-Liste versteckt sich darin.',
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

export type Rating = 'STARK' | 'OK' | 'SCHWACH' | 'ÄNDERN';
export const RATINGS: Rating[] = ['STARK', 'OK', 'SCHWACH', 'ÄNDERN'];

/** No overall 10/10 — every category is rated on its own. */
export const SCORE_CATEGORIES: { id: ScoreId; label: string }[] = [
  { id: 'hook', label: 'Hook' },
  { id: 'retention', label: 'Retention' },
  { id: 'story', label: 'Story' },
  { id: 'language', label: 'Sprache' },
  { id: 'value', label: 'Value' },
  { id: 'emotion', label: 'Emotion' },
  { id: 'visual', label: 'Visual' },
  { id: 'audio', label: 'Audio' },
  { id: 'cta', label: 'CTA' },
  { id: 'community', label: 'Community' },
  { id: 'brand', label: 'Brand Fit' },
  { id: 'monetization', label: 'Monetarisierung' },
];

export const POSTING_CHECKLIST = [
  'Hook geprüft',
  'erstes Wort geprüft',
  'jedes Wort geprüft',
  'Darija geprüft',
  'Deutsch geprüft',
  'Grammatik geprüft',
  'Untertitel geprüft',
  'Timing geprüft',
  'Dead Seconds entfernt',
  'Audio geprüft',
  'Musik geprüft',
  'Visuals geprüft',
  'CTA geprüft',
  'Keyword geprüft',
  'DM-Funnel geprüft',
  'Caption geprüft',
  'Cover geprüft',
  'Brand-Fit geprüft',
  'Community-Ziel geprüft',
  'Monetarisierungspotenzial geprüft',
  'keine unnötigen Claims',
  'keine unnötige Provokation',
  '„NICHT JETZT“-Check bestanden',
];

/** The order every review answer follows. */
export const REVIEW_ANSWER_FORMAT = [
  'Content-Ziel',
  'Hook (Wort-für-Wort-Analyse)',
  'Script (jedes problematische Wort markiert)',
  'Retention (wo verliert der Zuschauer Interesse?)',
  'Visual (was passiert wann auf dem Bildschirm?)',
  'Audio (Stimme, Musik, Sound)',
  'CTA (ist die Handlung klar?)',
  'DM-Funnel (was passiert nach dem CTA?)',
  'Brand (passt es zu Natty Simo?)',
  'Monetarisierung (welche spätere Einnahme unterstützt es?)',
  'Must Fix',
  'Final Version (zum Filmen/Posten)',
  'Posting Checklist',
];

export const REVIEW_RULE =
  'Nicht sofort neu schreiben. Erst analysieren, Fehler finden, Stärken finden, Verbesserungen erklären, erst danach die Final Version. Die Idee nie stillschweigend verändern: Grundlegende Änderungen beginnen mit „Ich würde die Richtung ändern, weil …“.';

export const GOLDEN_RULE = {
  chain: ['Views', 'Followers', 'DMs', 'Community', 'Vertrauen', 'Kunden', 'Produkte'],
  text: 'Nicht mehr Content um jeden Preis. Das Ziel ist nicht nur viral zu gehen, sondern eine starke Personal Brand, die langfristig Geld verdient.',
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

/** The CTA a slot uses by default (first allowed one). */
export function defaultCtaForSlot(slot: number): Cta | null {
  return REEL_SLOTS.find((r) => r.slot === slot)?.ctas[0] ?? null;
}

/**
 * Whether a reel may be posted, and what still blocks it. The rules come
 * straight from the system: no reel without a real CTA that fits its slot,
 * no category rated ÄNDERN, every Must Fix done, the protection rules and
 * the full posting checklist ticked — and a Deutsch reel needs Natty context.
 */
export function postingReadiness(review: ReelReview): { ready: boolean; blockers: string[] } {
  const blockers: string[] = [];
  const slot = REEL_SLOTS.find((r) => r.slot === review.slot);

  if (!review.title.trim()) blockers.push('Titel oder Idee fehlt.');
  if (!slot) blockers.push('Slot fehlt.');
  if (!review.cta) blockers.push('Kein CTA: PLAN, DEUTSCH oder SQUAD wählen.');
  else if (slot && !slot.ctas.includes(review.cta))
    blockers.push(`CTA ${review.cta} passt nicht zu Slot ${slot.slot} (${slot.ctas.join(' / ')}).`);

  if (slot?.kind === 'deutsch') {
    const deutsch = QUALITY_CHECK.find((g) => g.id === 'deutsch')!;
    const contextIndex = deutsch.items.findIndex((i) =>
      i.startsWith('Relevanter Natty-Simo-Kontext'),
    );
    if (!review.checks.includes(checkKey('deutsch', contextIndex)))
      blockers.push('Deutsch-Reel ohne bestätigten Natty-Simo-Kontext.');
  }

  const risk = QUALITY_CHECK.find((g) => g.id === 'risk')!;
  const openRisks = risk.items.filter((_, i) => !review.checks.includes(checkKey('risk', i)));
  if (openRisks.length > 0) blockers.push(`Schutz-Check offen (${openRisks.length}).`);

  const toChange = SCORE_CATEGORIES.filter((c) => review.scores[c.id] === 'ÄNDERN');
  if (toChange.length > 0) blockers.push(`ÄNDERN bei: ${toChange.map((c) => c.label).join(', ')}.`);

  const openMustFix = review.mustFix
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l !== '' && !/^\[x\]/i.test(l));
  if (openMustFix.length > 0)
    blockers.push(`Must Fix offen (${openMustFix.length}). Erledigte Zeilen mit [x] beginnen.`);

  const openPosting = POSTING_CHECKLIST.length - new Set(review.posting).size;
  if (openPosting > 0) blockers.push(`Posting-Checkliste: ${openPosting} offen.`);

  return { ready: blockers.length === 0, blockers };
}

/** The full review prompt, to paste into Claude together with a script or transcript. */
export function buildReviewPrompt(): string {
  const lines: string[] = [];
  lines.push('Natty Simo – Content Quality Control');
  lines.push('');
  lines.push(
    'Du bist mein Content Manager, Creative Director, Script Editor, Hook Specialist, Retention Analyst und Brand Guardian für Natty Simo. Nicht loben, streng prüfen. Keine Schönrederei.',
  );
  lines.push('');
  lines.push(`Urteile: ${VERDICTS.map((v) => `${v.verdict} (${v.when})`).join(', ')}.`);
  lines.push(
    `Script-Markierungen: ${SCRIPT_MARKS.map((m) => `${m.mark} = ${m.meaning}`).join(', ')}.`,
  );
  lines.push('');
  lines.push('BRAND');
  lines.push(`${IDENTITY.summary} Claim: ${IDENTITY.claim}`);
  lines.push(`Kette: ${IDENTITY.chain.join(' → ')}`);
  lines.push(`Hierarchie: ${IDENTITY.hierarchy.map((h, i) => `${i + 1}. ${h}`).join(' ')}`);
  lines.push(
    'Schreibweise: Natty Simo = Person/Creator. NATYSIMO = Clothing Brand. Keine anderen Schreibweisen.',
  );
  lines.push(IDENTITY.deutschNote);
  lines.push(`Story: ${IDENTITY.storyChain.join(' → ')} → … (Rest offen, nichts erfinden)`);
  lines.push('');
  lines.push('ZIELGRUPPE');
  lines.push(AUDIENCE.summary);
  for (const p of AUDIENCE.points) lines.push(`- ${p.term}: ${p.text}`);
  lines.push(`${AUDIENCE.protectionIntro} ${PROTECTION_RULES.join(', ')}.`);
  lines.push('');
  lines.push('REEL-SLOTS');
  for (const r of REEL_SLOTS)
    lines.push(
      `${r.slot}${r.optional ? ' (optional)' : ''}. ${r.topic} → CTA ${r.ctas.join(' oder ')}`,
    );
  lines.push(`CTA-Keywords: ${CTAS.join(', ')}. Nicht „Like und Follow“.`);
  lines.push('');
  lines.push('VOR DER BEARBEITUNG BEANTWORTEN');
  for (const q of PRE_QUESTIONS) lines.push(`${q.id}. ${q.question} ${q.rule}`);
  lines.push('');
  lines.push('PRÜFEN');
  for (const g of QUALITY_CHECK) {
    lines.push(`${g.title.toUpperCase()}${g.note ? ` (${g.note})` : ''}`);
    for (const i of g.items) lines.push(`- ${i}`);
  }
  lines.push('');
  lines.push(`Markiere ${CONTENT_TYPES.map((c) => `„${c.label}“ (${c.text})`).join(' bzw. ')}`);
  lines.push(
    `FINALER SCORE, kein 10/10: ${SCORE_CATEGORIES.map((c) => c.label).join(', ')} – jeweils ${RATINGS.join(' / ')}. Danach MUST FIX, SHOULD FIX, OPTIONAL, KEEP.`,
  );
  lines.push('');
  lines.push(`WICHTIG: ${REVIEW_RULE}`);
  lines.push('');
  lines.push('ANTWORTFORMAT (exakt in dieser Reihenfolge)');
  REVIEW_ANSWER_FORMAT.forEach((s, i) => lines.push(`${i + 1}. ${s}`));
  lines.push(
    `Final Script mit ${FINAL_SCRIPT_MARKS.join(' ')}. Dazu 3 alternative Hooks und 3 Cover-Texte.`,
  );
  lines.push('');
  lines.push('POSTING CHECKLIST');
  for (const p of POSTING_CHECKLIST) lines.push(`☐ ${p}`);
  lines.push('');
  lines.push(`GOLDENE REGEL: ${GOLDEN_RULE.chain.join(' → ')}. ${GOLDEN_RULE.text}`);
  lines.push(IDENTITY.claim);
  lines.push('');
  lines.push('HIER IST MEIN CONTENT:');
  return lines.join('\n');
}
