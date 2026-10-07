import { allLessons, content } from '@/content';

export interface SearchHit {
  kind: 'Modul' | 'Stunde' | 'Lernziel' | 'Aktivität' | 'Vorlage';
  title: string;
  detail: string;
  href: string;
}

const norm = (s: string) => s.toLocaleLowerCase('de').normalize('NFKD').replace(/[̀-ͯ]/g, '');

/**
 * Einfache Volltextsuche über die Inhalte aus content/ (Phase 3).
 * Phase 6 ergänzt Schüler und Dokumentationen sowie Filter nach Level und Bereich.
 */
export function searchContent(query: string, limit = 50): SearchHit[] {
  const words = norm(query)
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  const hits: SearchHit[] = [];
  const add = (hit: SearchHit, ...fields: string[]) => {
    const text = norm(fields.join(' '));
    if (words.every((w) => text.includes(w))) hits.push(hit);
  };

  for (const level of content.curriculum.levels) {
    for (const m of level.modules) {
      add(
        {
          kind: 'Modul',
          title: `${m.id} · ${m.title}`,
          detail: level.name,
          href: `/curriculum#${m.id}`,
        },
        m.id,
        m.title,
      );
      for (const g of m.grammar) {
        add(
          {
            kind: 'Stunde',
            title: g.title,
            detail: `${g.lessonId} · ${m.title}`,
            href: `/curriculum#${g.lessonId}`,
          },
          g.lessonId,
          g.title,
          g.kern.join(' '),
          g.wortschatz,
        );
      }
      for (const o of content.objectives[m.id] ?? []) {
        add(
          {
            kind: 'Lernziel',
            title: o,
            detail: `${m.id} · ${m.title}`,
            href: `/lernziele#${m.id}`,
          },
          o,
        );
      }
    }
  }
  for (const l of allLessons().filter((x) => x.type === 's')) {
    add(
      { kind: 'Stunde', title: l.title, detail: l.id, href: `/curriculum#${l.id}` },
      l.id,
      l.title,
    );
  }
  for (const a of content.activities) {
    add(
      {
        kind: 'Aktivität',
        title: a.name,
        detail: `${a.niveau} · ${a.dauer}`,
        href: '/betrieb#aktivitaeten',
      },
      a.name,
      a.ziel,
      a.ablauf.join(' '),
    );
  }
  for (const tpl of content.templates) {
    add(
      { kind: 'Vorlage', title: tpl.titel, detail: 'WhatsApp', href: '/betrieb#vorlagen' },
      tpl.titel,
      tpl.text,
    );
  }
  return hits.slice(0, limit);
}
