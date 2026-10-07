/**
 * Wandelt die Legacy-Daten in die typisierten Inhalte für content/ um.
 * Reine Funktion: wird von scripts/extract-content.ts (schreibt Dateien) und von den Tests
 * (prüfen, dass content/ mit legacy/index.html übereinstimmt) verwendet.
 */
import type {
  Activity,
  Area,
  ReadoutBlock,
  Readouts,
  ReadoutSection,
  Bilingual,
  ChecklistGroup,
  Curriculum,
  Day,
  EmergencyCase,
  GermanyGroup,
  Label,
  Lesson,
  LessonScript,
  LessonSystemStep,
  LevelKey,
  Meta,
  Objectives,
  OpenDecision,
  PhaseKey,
  Platform,
  ProbeSection,
  RoleKey,
  SpecialChecklists,
  SpeakingDialogue,
  Standard,
  Statement,
  Template,
} from '../content/types';
import { loadLegacy, renderLegacyPage, type LegacyRuntime } from './legacy-runtime';

// ------------------------------------------------------------------ Legacy-Rohformen

interface RawLevel {
  k: LevelKey;
  name: string;
  goal: string;
  weeks: { t: string; g: string[]; s: string }[];
}
interface RawItem {
  r: RoleKey;
  t: string;
  de: string;
  ar: string;
  id: string;
}
interface RawGroup {
  ph?: PhaseKey;
  name?: [string, string];
  items: RawItem[];
}
interface RawLesson {
  id: string;
  areas?: Area[];
  type: Lesson['type'];
  title: string;
  dur: string;
  lv?: LevelKey;
  wi?: number;
  day?: Day;
  head?: string;
  groups: RawGroup[];
}

const DAYS: Day[] = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];

/** Packed-String-Trenner aus legacy */
const split = (s: string | undefined, sep: string): string[] =>
  (s ?? '').split(sep).filter((x) => x !== '');

/** "Titel|Kernpunkte;…|Beispiele;…|Wortschatz" (legacy: pt) */
function parseTopic(s: string) {
  const p = s.split('|');
  return {
    title: p[0] ?? '',
    kern: split(p[1], ';'),
    beispiele: split(p[2], ';').filter((x) => x !== '–'),
    wortschatz: p[3] ?? '',
  };
}

/** "Thema|Situation|Redemittel;…" (legacy: ps) */
function parseSpeaking(s: string) {
  const p = s.split('|');
  return { thema: p[0] ?? '', situation: p[1] ?? '', redemittel: (p[2] ?? '').split(';') };
}

const bi = (pair: [string, string] | undefined): Bilingual => ({
  de: pair?.[0] ?? '',
  ar: pair?.[1] ?? '',
});

function convertGroups(groups: RawGroup[]): ChecklistGroup[] {
  return groups.map((g) => ({
    ...(g.ph ? { phase: g.ph } : {}),
    ...(g.name ? { name: bi(g.name) } : {}),
    items: g.items.map((x) => ({ id: x.id, role: x.r, zeit: x.t, text: { de: x.de, ar: x.ar } })),
  }));
}

function convertLesson(L: RawLesson): Lesson {
  return {
    id: L.id,
    type: L.type,
    title: L.title,
    dauer: L.dur,
    ...(L.lv ? { level: L.lv } : {}),
    ...(L.lv && L.wi !== undefined ? { moduleId: `${L.lv}.${L.wi + 1}` } : {}),
    ...(L.day ? { day: L.day } : {}),
    ...(L.head ? { lead: L.head } : {}),
    areas: L.areas ?? [],
    groups: convertGroups(L.groups),
  };
}

// ------------------------------------------------------------------ Kennzeichnungen aus dem Seiten-HTML

const LABEL_CLASS: Record<string, Label> = {
  'st-ex': 'EXISTING',
  'st-im': 'IMPROVEMENT',
  'st-pr': 'PROPOSAL',
  'st-od': 'OFFENE ENTSCHEIDUNG',
};
const BLOCK_TAGS = new Set([
  'li',
  'p',
  'h1',
  'h2',
  'h3',
  'dt',
  'dd',
  'td',
  'th',
  'summary',
  'label',
]);
/** Öffnet einer dieser Container, endet die aktuelle Aussage (z. B. Kennzeichnung vor einer Liste). */
const CONTAINER_TAGS = new Set(['ul', 'ol', 'div', 'table', 'section', 'dl', 'details']);
const VOID_TAGS = new Set([
  'br',
  'img',
  'input',
  'hr',
  'meta',
  'link',
  'source',
  'path',
  'circle',
  'rect',
]);

const decode = (s: string) =>
  s
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

interface Block {
  tag: string;
  isBlock: boolean;
  /** true, sobald eine verschachtelte Liste/Box beginnt: danach gehört Text nicht mehr zur Kennzeichnung */
  frozen: boolean;
  /** Text vor der ersten Kennzeichnung */
  prefix: string;
  /** je Kennzeichnung der folgende Text */
  segments: { label: Label; text: string }[];
}

/**
 * Findet alle <span class="st st-xx">…</span> im HTML und ordnet jeder Kennzeichnung den
 * Text des umgebenden Blocks (li, p, h2, …) zu. Steht die Kennzeichnung am Ende (z. B. hinter
 * einem Kartentitel), gilt sie für den Text davor.
 */
function append(stack: Block[], t: string) {
  for (const b of stack) {
    const last = b.segments[b.segments.length - 1];
    if (last) {
      if (!b.frozen) last.text += t;
    } else b.prefix += t;
  }
}

export function labelledStatements(html: string, page: string): Statement[] {
  const out: Statement[] = [];
  const stack: Block[] = [];
  let section = '';
  let pendingLabel: Label | null = null;
  let inLabelSpan = false;
  const re = /<(\/?)([a-zA-Z0-9]+)([^>]*)>|([^<]+)/g;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, closing, rawTag, attrs, text] = m;
    if (text !== undefined) {
      if (inLabelSpan) continue; // Text des Labels selbst nicht übernehmen
      append(stack, decode(text));
      continue;
    }
    const tag = (rawTag ?? '').toLowerCase();
    if (!closing) {
      const cls = /class="([^"]*)"/.exec(attrs ?? '')?.[1] ?? '';
      const labelClass = cls.split(/\s+/).find((c) => c in LABEL_CLASS);
      if (tag === 'span' && labelClass) {
        pendingLabel = LABEL_CLASS[labelClass] ?? null;
        inLabelSpan = true;
        stack.push({ tag, isBlock: false, frozen: false, prefix: '', segments: [] });
        continue;
      }
      if (VOID_TAGS.has(tag) || /\/\s*$/.test(attrs ?? '')) {
        if (tag === 'br') append(stack, ' ');
        continue;
      }
      if (CONTAINER_TAGS.has(tag)) for (const b of stack) b.frozen = true;
      stack.push({
        tag,
        isBlock: BLOCK_TAGS.has(tag) || tag === 'div',
        frozen: false,
        prefix: '',
        segments: [],
      });
      continue;
    }
    // schließendes Tag
    let idx = stack.length - 1;
    while (idx >= 0 && stack[idx]?.tag !== tag) idx--;
    if (idx < 0) continue;
    const closed = stack.splice(idx);
    const block = closed[0];
    if (!block) continue;
    if (inLabelSpan && block.tag === 'span') {
      inLabelSpan = false;
      // Kennzeichnung dem innersten offenen Block zuordnen
      const target = [...stack].reverse().find((b) => b.isBlock) ?? stack[stack.length - 1];
      if (target && pendingLabel) {
        target.segments.push({ label: pendingLabel, text: '' });
        target.frozen = false;
      }
      pendingLabel = null;
      continue;
    }
    if (block.isBlock) append(stack, ' ');
    if (block.tag === 'h2' || block.tag === 'h1') {
      const title = norm(block.prefix + block.segments.map((s) => s.text).join(' '));
      if (block.tag === 'h2' || !section) section = title;
    }
    for (const seg of block.segments) {
      const own = norm(seg.text.replace(/^[\s:–-]+/, ''));
      const text = own || norm(block.prefix);
      out.push({ page, section, label: seg.label, text });
    }
  }
  return out;
}

/** Seiten von legacy (V2), die gekennzeichnete Aussagen enthalten. */
export const LEGACY_PAGES = [
  'dash',
  'std',
  'cur',
  'lo',
  'lsys',
  'play',
  'prog',
  'err',
  'hw',
  'de',
  'onb',
  'doc',
  'qc',
  'mat',
  'dec',
  'ops',
] as const;

/**
 * Seiten-HTML als lesbarer Text: ein Block pro Zeile, Kennzeichnungen als [LABEL].
 * Bewahrt auch Erklärtexte der Seiten, die keine eigene Kennzeichnung haben.
 */
export function pageText(html: string): string[] {
  const text = html
    .replace(
      /<span class="st (st-ex|st-im|st-pr|st-od)">[^<]*<\/span>/g,
      (_m, c: string) => ` [${LABEL_CLASS[c]}] `,
    )
    .replace(/<(script|style|svg)[\s\S]*?<\/\1>/g, '')
    .replace(
      /<(br|\/?(?:p|li|h1|h2|h3|div|section|tr|td|th|dt|dd|ul|ol|details|summary|label|button|a|option))\b[^>]*>/g,
      '\n',
    )
    .replace(/<[^>]+>/g, '');
  return decode(text).split('\n').map(norm).filter(Boolean);
}

const PAGE_FUNCS =
  '({dash:pageDash,std:pageStd,cur:pageCur,lo:pageLO,lsys:pageLsys,play:pagePlay,prog:pageProg,err:pageErr,' +
  'hw:pageHw,de:pageDE,onb:pageOnb,doc:pageDoc,qc:pageQC,mat:pageMat,dec:pageDec,ops:pageOps})';

function renderPages(rt: LegacyRuntime): Record<string, string> {
  const setup = 'state.me="ALL";state.lang="de";state.cur=null;state.form=null';
  const html: Record<string, string> = {};
  for (const page of LEGACY_PAGES) {
    html[page] = renderLegacyPage(
      rt,
      `${setup};state.page=${JSON.stringify(page)}`,
      `${PAGE_FUNCS}[${JSON.stringify(page)}]()`,
    );
  }
  // Stunden-Ansicht (Rahmen für jede Stunde gleich): mit der ersten Stunde rendern
  html.lesson = renderLegacyPage(rt, `${setup};state.cur="A1.1.Mo"`, 'pageLessonV2()');
  return html;
}

// ------------------------------------------------------------------ Vorlese-Skripte

const strip = (h: string) => norm(decode(h.replace(/<[^>]+>/g, ' ')));

/**
 * Zerlegt das Skript-HTML aus legacy (scriptHTML) in Abschnitte und Bausteine.
 * Das HTML ist flach: h3.sch, p.say, div.dj, ol.ex, div.facts, label.note (Lehrbuch-Feld, entfällt).
 */
export function parseReadout(html: string): ReadoutSection[] {
  const sections: ReadoutSection[] = [];
  const re = /<(h3|p|div|ol|label)\b([^>]*)>([\s\S]*?)<\/\1>/g;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    const [, tag, attrs = '', inner = ''] = m;
    const cls = /class="([^"]*)"/.exec(attrs)?.[1] ?? '';
    if (tag === 'label') continue;
    if (tag === 'h3' && cls.includes('sch')) {
      const zeit = strip(/<span class="tm">([\s\S]*?)<\/span>/.exec(inner)?.[1] ?? '');
      const titel = strip(inner.replace(/<span class="tm">[\s\S]*?<\/span>/, ''));
      sections.push({ zeit, titel: { de: titel, ar: '' }, blocks: [] });
      continue;
    }
    let block: ReadoutBlock | null = null;
    if (tag === 'p' && cls.includes('say')) block = { type: 'say', text: decode(inner) };
    else if (tag === 'div' && cls.includes('dj'))
      block = { type: 'darija', text: strip(inner.replace(/<b>[\s\S]*?<\/b>/, '')) };
    else if (tag === 'ol' && cls.includes('ex')) {
      const items = [
        ...inner.matchAll(
          /<li>([\s\S]*?)<details class="sol"><summary>[\s\S]*?<\/summary><div>([\s\S]*?)<\/div><\/details><\/li>/g,
        ),
      ].map((x) => ({ frage: decode(x[1] ?? ''), loesung: decode(x[2] ?? '') }));
      block = { type: 'exercises', items };
    } else if (tag === 'div' && cls.includes('facts')) {
      const groups: { title: string; items: string[] }[] = [];
      for (const line of inner.split(/<br\s*\/?>/)) {
        const title = /<b>([\s\S]*?)<\/b>/.exec(line)?.[1];
        if (title !== undefined) groups.push({ title: strip(title).replace(/:$/, ''), items: [] });
        const rest = strip(line.replace(/<b>[\s\S]*?<\/b>/, ''));
        if (rest) groups[groups.length - 1]?.items.push(rest.replace(/^•\s*/, ''));
      }
      block = { type: 'facts', groups };
    }
    if (!block) throw new Error(`Unbekannter Skript-Baustein: <${tag} class="${cls}">`);
    const current = sections[sections.length - 1];
    if (!current) throw new Error('Skript-Baustein vor dem ersten Abschnitt');
    current.blocks.push(block);
  }
  return sections;
}

// ------------------------------------------------------------------ Gesamtextraktion

export interface ExtractedContent {
  curriculum: Curriculum;
  objectives: Objectives;
  scripts: LessonScript[];
  speaking: SpeakingDialogue[];
  probe: ProbeSection[];
  platforms: Platform[];
  standards: Standard[];
  activities: Activity[];
  templates: Template[];
  emergency: EmergencyCase[];
  germany: GermanyGroup[];
  lessons: Lesson[];
  readouts: Readouts;
  checklists: SpecialChecklists;
  decisions: OpenDecision[];
  statements: Statement[];
  lessonSystem: LessonSystemStep[];
  pages: Record<string, string[]>;
  meta: Meta;
}

export function extractContent(rt: LegacyRuntime = loadLegacy()): ExtractedContent {
  const LV = rt.get<RawLevel[]>('LV');

  const curriculum: Curriculum = {
    levels: LV.map((lv) => ({
      key: lv.k,
      name: lv.name,
      goal: lv.goal,
      modules: lv.weeks.map((w, wi) => ({
        id: `${lv.k}.${wi + 1}`,
        level: lv.k,
        number: wi + 1,
        title: w.t,
        grammar: w.g.map((g, di) => {
          const day = DAYS[di] as Day;
          return { lessonId: `${lv.k}.${wi + 1}.${day}`, day, ...parseTopic(g) };
        }),
        speaking: parseSpeaking(w.s),
      })),
    })),
  };

  const LO = rt.get<Record<LevelKey, string[]>>('LO');
  const objectives: Objectives = {};
  for (const lv of LV) {
    (LO[lv.k] ?? []).forEach((s, wi) => {
      objectives[`${lv.k}.${wi + 1}`] = split(s, '¦');
    });
  }

  const SC = rt.get<Partial<Record<LevelKey, string[][]>>>('SC');
  const scripts: LessonScript[] = [];
  for (const [k, weeks] of Object.entries(SC) as [LevelKey, string[][]][]) {
    weeks.forEach((days, wi) =>
      days.forEach((s, di) => {
        const f = s.split('§');
        scripts.push({
          lessonId: `${k}.${wi + 1}.${DAYS[di]}`,
          lines: (f[0] ?? '').split('¶'),
          darija: f[1] ?? '',
          exercises: split(f[2], '¦').map((p) => {
            const a = p.split('›');
            return { frage: a[0] ?? '', loesung: a[1] ?? '' };
          }),
          hausaufgabe: f[3] ?? '',
        });
      }),
    );
  }

  const SPK = rt.get<Partial<Record<LevelKey, string[]>>>('SPK');
  const speaking: SpeakingDialogue[] = [];
  for (const [k, weeks] of Object.entries(SPK) as [LevelKey, string[]][]) {
    weeks.forEach((s, wi) => {
      const f = s.split('§');
      speaking.push({
        moduleId: `${k}.${wi + 1}`,
        dialog: (f[0] ?? '').split('¶'),
        karten: split(f[1], '¦'),
      });
    });
  }

  const probe = rt
    .get<string[][]>('PROBE')
    .map(([zeit = '', titel = '', lines = '', darija = '']) => ({
      zeit,
      titel,
      lines: lines.split('¶'),
      darija,
    }));

  const platforms = rt
    .get<string[][]>('PLAT')
    .map(([zweck = '', empfehlung = '', warum = '', ar = '', alternative = '', hinweis = '']) => ({
      zweck,
      empfehlung,
      warum,
      ar,
      alternative,
      hinweis,
    }));

  const standards = rt.get<string[][]>('STDS').map(([titel = '', ar = '', punkte = '']) => ({
    titel,
    ar,
    punkte: split(punkte, '¦'),
  }));

  const activities = rt.get<string[]>('ACT').map((s) => {
    const [name = '', niveau = '', dauer = '', tool = '', ablauf = '', ziel = '', ar = ''] =
      s.split('|');
    return { name, niveau, dauer, tool, ablauf: split(ablauf, '¦'), ziel, ar };
  });

  const templates = rt.get<string[][]>('TPL').map(([titel = '', text = '']) => ({ titel, text }));
  const emergency = rt
    .get<string[][]>('FALL')
    .map(([fall = '', massnahme = '']) => ({ fall, massnahme }));
  const germany = rt
    .get<string[][]>('DEGROUPS')
    .map(([thema = '', ids = '']) => ({ thema, lessonIds: split(ids, '|') }));

  // Alle Stunden in der Reihenfolge der App: Level-Start, dann pro Woche Mo–So.
  const lessons = rt
    .run<RawLesson[]>(
      `LV.reduce(function(a,lv){a.push(getStart(lv));lv.weeks.forEach(function(w,wi){DAYS.forEach(function(d){a.push(getLesson(lv,wi,d));});});return a;},[]).map(function(L){var o=Object.assign({},L);o.areas=areasOf(L);return o;})`,
    )
    .map(convertLesson);

  const special = rt.run<{
    gp: RawLesson;
    ps: RawLesson;
    setup: RawLesson;
    onb: RawLesson;
    dec: RawLesson;
  }>(
    `{gp:probeLessons().gp,ps:probeLessons().ps,setup:setupLesson(),onb:onbLesson(),dec:openLesson()}`,
  );
  const checklists: SpecialChecklists = {
    generalprobe: convertLesson(special.gp),
    probestunde: convertLesson(special.ps),
    einrichtung: convertLesson(special.setup),
    onboarding: convertLesson(special.onb),
    entscheidungen: convertLesson(special.dec),
  };

  const decisions: OpenDecision[] = checklists.entscheidungen.groups.flatMap((g) =>
    g.items.map((x) => ({ id: x.id, label: 'OFFENE ENTSCHEIDUNG' as const, text: x.text })),
  );

  const ROLE = rt.get<Record<RoleKey, [string, string]>>('ROLE');
  const PH = rt.get<Record<PhaseKey, [string, string]>>('PH');
  const DAYN = rt.get<Record<Day, string>>('DAYN');
  const DAYA = rt.get<Record<Day, string>>('DAYA');
  const NAV = rt.get<[string, [string, string, string][]][]>('NAV');
  const mapObj = <K extends string, V, R>(o: Record<K, V>, f: (v: V, k: K) => R) =>
    Object.fromEntries(Object.entries(o).map(([k, v]) => [k, f(v as V, k as K)])) as Record<K, R>;
  const meta: Meta = {
    roles: mapObj(ROLE, (v) => bi(v)),
    phases: mapObj(PH, (v) => bi(v)),
    days: mapObj(DAYN, (v, k) => ({ de: v, ar: DAYA[k] ?? '' })),
    nav: NAV.map(([group, items]) => ({
      group,
      items: items.map(([key, de, ar]) => ({ key, label: { de, ar } })),
    })),
  };

  // Die 9 Schritte stehen in legacy nur lokal in pageLsys (var S9) – aus dem Quelltext lesen.
  const S9 = rt.run<[string, string, string, string, string[]][]>(
    `(0,eval)(pageLsys.toString().match(/var S9=(\\[[\\s\\S]*?\\]\\]);/)[1])`,
  );
  const STL = rt.get<Record<string, [Label, string]>>('STL');
  const lessonSystem: LessonSystemStep[] = S9.map(
    ([schritt, beschreibung, grammatik, sprechen, labels], i) => ({
      nr: i + 1,
      schritt,
      beschreibung,
      minutenGrammatik: grammatik,
      minutenSprechen: sprechen,
      labels: labels.map((k) => STL[k]?.[0] as Label),
    }),
  );

  const html = renderPages(rt);

  // Vorlese-Skripte: legacy erzeugt sie aus Daten + festen Sätzen. Deutsch und Arabisch rendern,
  // Arabisch liefert nur die Abschnittstitel (Unterrichtsinhalt bleibt Deutsch).
  const scriptIds = lessons.filter((l) => l.type !== 'x').map((l) => l.id);
  scriptIds.push('probe.ps');
  const readouts: Readouts = {};
  for (const id of scriptIds) {
    const render = (lang: string) =>
      renderLegacyPage(
        rt,
        `state.lang=${JSON.stringify(lang)}`,
        `scriptHTML(findLesson(${JSON.stringify(id)}))`,
      );
    const de = parseReadout(render('de'));
    const ar = parseReadout(render('ar'));
    readouts[id] = de.map((sec, i) => ({
      ...sec,
      titel: { de: sec.titel.de, ar: ar[i]?.titel.de ?? '' },
    }));
  }

  return {
    curriculum,
    objectives,
    scripts,
    speaking,
    probe,
    platforms,
    standards,
    activities,
    templates,
    emergency,
    germany,
    lessons,
    readouts,
    checklists,
    decisions,
    statements: Object.entries(html).flatMap(([page, h]) => labelledStatements(h, page)),
    lessonSystem,
    pages: Object.fromEntries(Object.entries(html).map(([page, h]) => [page, pageText(h)])),
    meta,
  };
}
