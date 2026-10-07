import { allLessons, content, findLesson } from '@/content';
import { LEVEL_KEYS, type Area, type LevelKey } from '@/content/types';
import type { LessonDocRow, StudentRow } from './data/types';

export type HitKind =
  'Modul' | 'Stunde' | 'Lernziel' | 'Aktivität' | 'Vorlage' | 'Schüler' | 'Dokumentation';

export interface SearchHit {
  kind: HitKind;
  title: string;
  detail: string;
  href: string;
}

export interface SearchFilter {
  level?: LevelKey | null;
  area?: Area | null;
}

const norm = (s: string) => s.toLocaleLowerCase('de').normalize('NFKD').replace(/[̀-ͯ]/g, '');

/** legacy: inRange – „A1–B2“ enthält „B1“ */
export function levelInRange(range: string, level: LevelKey): boolean {
  const [a, b] = range.split('–');
  const i = LEVEL_KEYS.indexOf(level);
  const from = LEVEL_KEYS.indexOf(a as LevelKey);
  const to = b ? LEVEL_KEYS.indexOf(b as LevelKey) : from;
  return from >= 0 && i >= from && i <= to;
}

/**
 * Schnelle Suche über Stunden, Module, Lernziele, Aktivitäten, Vorlagen, Schüler und Dokumentationen,
 * mit Filter nach Level und Bereich. Alle Wörter müssen vorkommen (Groß/klein und Akzente egal).
 */
export function search(
  query: string,
  filter: SearchFilter = {},
  data: { students: StudentRow[]; docs: LessonDocRow[] } = { students: [], docs: [] },
  limit = 60,
): SearchHit[] {
  const words = norm(query)
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  const { level, area } = filter;
  const hits: SearchHit[] = [];
  const add = (hit: SearchHit, ...fields: string[]) => {
    const text = norm(fields.join(' '));
    if (words.every((w) => text.includes(w))) hits.push(hit);
  };
  const lessonsOfModule = (id: string) => allLessons().filter((l) => l.moduleId === id);

  for (const lv of content.curriculum.levels) {
    if (level && lv.key !== level) continue;
    for (const m of lv.modules) {
      if (!area || lessonsOfModule(m.id).some((l) => l.areas.includes(area))) {
        add(
          {
            kind: 'Modul',
            title: `${m.id} · ${m.title}`,
            detail: lv.name,
            href: `/curriculum?level=${lv.key}#${m.id}`,
          },
          m.id,
          m.title,
        );
        if (!area) {
          for (const o of content.objectives[m.id] ?? []) {
            add(
              {
                kind: 'Lernziel',
                title: o,
                detail: `${m.id} · ${m.title}`,
                href: `/lernziele?level=${lv.key}#${m.id}`,
              },
              o,
            );
          }
        }
      }
      for (const g of m.grammar) {
        if (area && !findLesson(g.lessonId)?.areas.includes(area)) continue;
        add(
          {
            kind: 'Stunde',
            title: g.title,
            detail: `${g.lessonId} · ${m.title}`,
            href: `/stunde/${g.lessonId}`,
          },
          g.lessonId,
          g.title,
          g.kern.join(' '),
          g.wortschatz,
        );
      }
    }
  }
  for (const l of allLessons().filter((x) => x.type === 's' || x.type === 't')) {
    if ((level && l.level !== level) || (area && !l.areas.includes(area))) continue;
    add({ kind: 'Stunde', title: l.title, detail: l.id, href: `/stunde/${l.id}` }, l.id, l.title);
  }
  if (!area) {
    for (const a of content.activities) {
      if (level && !levelInRange(a.niveau, level)) continue;
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
    if (!level) {
      for (const tpl of content.templates) {
        add(
          { kind: 'Vorlage', title: tpl.titel, detail: 'WhatsApp', href: '/betrieb#vorlagen' },
          tpl.titel,
          tpl.text,
        );
      }
    }
    for (const s of data.students) {
      if (level && s.level !== level) continue;
      add(
        { kind: 'Schüler', title: s.name, detail: s.level, href: `/fortschritt/${s.id}` },
        s.name,
        s.strengths,
        s.weaknesses,
        s.next_goals,
      );
    }
  }
  for (const d of data.docs) {
    const l = findLesson(d.lesson_id);
    if ((level && l?.level !== level) || (area && !l?.areas.includes(area))) continue;
    add(
      {
        kind: 'Dokumentation',
        title: `${d.date} · ${l?.title ?? d.lesson_id}`,
        detail: d.covered.slice(0, 120),
        href: `/dokumentation/${d.id}`,
      },
      l?.title ?? '',
      d.covered,
      d.can_do,
      d.errors,
      d.homework,
      d.problems,
    );
  }
  return hits.slice(0, limit);
}
