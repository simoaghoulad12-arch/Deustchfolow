import meta from '@/content/meta.json';
import type { Bilingual } from '@/content/types';

/** Adresse jeder Seite. Schlüssel wie in legacy/index.html (NAV). */
export const ROUTES = {
  dash: '/',
  play: '/playbook',
  search: '/suche',
  cur: '/curriculum',
  lo: '/lernziele',
  lsys: '/lesson-system',
  de: '/deutschland',
  mat: '/materialien',
  doc: '/dokumentation',
  prog: '/fortschritt',
  err: '/fehler',
  hw: '/hausaufgaben',
  qc: '/qualitaet',
  std: '/standard',
  onb: '/onboarding',
  ops: '/betrieb',
  dec: '/entscheidungen',
  set: '/einstellungen',
} as const;

export type PageKey = keyof typeof ROUTES;

/** Gruppennamen aus legacy; Arabisch neu für die Oberfläche ergänzt. */
const GROUP_AR: Record<string, string> = {
  Übersicht: 'نظرة عامة',
  Lehren: 'التدريس',
  'Dokumentieren & Messen': 'التوثيق والقياس',
  Akademie: 'الأكاديمية',
};

export interface NavItem {
  key: PageKey;
  href: string;
  label: Bilingual;
}

export interface NavGroup {
  label: Bilingual;
  items: NavItem[];
}

const isPageKey = (k: string): k is PageKey => k in ROUTES;

/** Navigation wie in legacy (V2): Gruppen und Beschriftungen DE + Darija. */
export const NAV: NavGroup[] = meta.nav.map((g) => ({
  label: { de: g.group, ar: GROUP_AR[g.group] ?? g.group },
  items: g.items
    .filter((i) => isPageKey(i.key))
    .map((i) => ({
      key: i.key as PageKey,
      href: ROUTES[i.key as PageKey],
      label: i.label,
    })),
}));

export const NAV_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);

export function navItem(key: PageKey): NavItem {
  const item = NAV_ITEMS.find((i) => i.key === key);
  if (!item) throw new Error(`Unbekannte Seite: ${key}`);
  return item;
}

/** Untere Leiste auf dem Handy, wie in legacy: Dashboard, Heute, Curriculum, Doku, Menü. */
export const BOTTOM_NAV: { key: PageKey; label: Bilingual }[] = [
  { key: 'dash', label: { de: 'Dashboard', ar: 'الرئيسية' } },
  { key: 'play', label: { de: 'Heute', ar: 'اليوم' } },
  { key: 'cur', label: { de: 'Curriculum', ar: 'المنهج' } },
  { key: 'doc', label: { de: 'Doku', ar: 'التوثيق' } },
];

/** Aktive Seite zu einem Pfad (längster passender Präfix). */
export function activeKey(pathname: string): PageKey | null {
  let best: PageKey | null = null;
  for (const item of NAV_ITEMS) {
    const match =
      item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(item.href + '/');
    if (match && (!best || item.href.length > ROUTES[best].length)) best = item.key;
  }
  if (!best && pathname.startsWith('/admin')) best = 'set';
  return best;
}
