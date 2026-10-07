import { describe, expect, it } from 'vitest';
import { allLessons } from '../content';
import {
  attendance,
  docPrefill,
  homeworkStats,
  lessonAt,
  mondayOf,
  nextLessonAfter,
  todayISO,
} from '../lib/school';
import { parseDoc, parseError, parseGroup, parseHomework, parseStudent } from '../lib/validation';
import type { HomeworkRow, LessonDocRow } from '../lib/data/types';
import { loadLegacy } from '../scripts/legacy-runtime';

const legacy = loadLegacy();
const form = (o: Record<string, string | string[]>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) for (const x of [v].flat()) f.append(k, x);
  return f;
};

describe('Welche Stunde ist heute? (legacy: lessonAt)', () => {
  const cases: [string, string, string][] = [
    ['A1', '2026-01-07', '2026-01-05'], // Start Mittwoch → Woche ab Montag
    ['A1', '2026-01-05', '2026-01-08'],
    ['A2', '2026-01-05', '2026-02-01'],
    ['B1', '2026-01-05', '2026-03-15'],
    ['B2', '2026-01-05', '2026-03-16'], // nach 10 Wochen
    ['A1', '2026-02-02', '2026-01-30'], // vor dem Start
  ];
  for (const [level, start, date] of cases) {
    it(`${level}, Start ${start}, Datum ${date}`, () => {
      const [y, m, d] = date.split('-').map(Number);
      const l = legacy.run<{ state: string; L?: { id: string } }>(
        `(function(){state.start={};state.start[${JSON.stringify(level)}]=${JSON.stringify(start)};var r=lessonAt(lvByK(${JSON.stringify(level)}),new Date(${y},${m! - 1},${d}));return r&&{state:r.state,L:r.L&&{id:r.L.id}};})()`,
      );
      const ours = lessonAt(level as 'A1', start, date);
      expect(ours.state).toBe(l.state);
      if (ours.state === 'ok') expect(ours.lesson.id).toBe(l.L?.id);
    });
  }

  it('Montag der Woche', () => {
    expect(mondayOf('2026-01-11')).toBe('2026-01-05');
    expect(mondayOf('2026-01-05')).toBe('2026-01-05');
  });

  it('heute in Europe/Berlin', () => {
    expect(todayISO(new Date('2026-01-05T23:30:00Z'))).toBe('2026-01-06');
  });
});

describe('Stunde dokumentieren: Vorausfüllung (legacy: docPrefill)', () => {
  for (const id of ['A1.1.Mo', 'A1.3.Do', 'A2.4.Fr', 'B1.2.Sa', 'B2.10.Do', 'A1.8.Sa']) {
    it(id, () => {
      const l = legacy.run<{ covered: string; can: string; hw: string; next: string }>(
        `(function(){state.notes={};return docPrefill(${JSON.stringify(id)});})()`,
      );
      const ours = docPrefill(id);
      expect(ours.covered).toBe(l.covered);
      expect(ours.canDo).toBe(l.can);
      expect(ours.homework).toBe(l.hw);
      expect(ours.nextLesson).toBe(l.next);
    });
  }

  it('nächste Stunde überspringt den Mini-Test am Sonntag', () => {
    expect(nextLessonAfter('A1.1.Sa')?.id).toBe('A1.2.Mo');
    expect(nextLessonAfter('A1.8.Sa')).toBeUndefined();
    expect(allLessons().length).toBeGreaterThan(0);
  });
});

describe('Kennzahlen', () => {
  const doc = (present: string[], absent: string[]): LessonDocRow =>
    ({ present, absent, date: '2026-01-05', created_at: '' }) as unknown as LessonDocRow;
  it('Anwesenheit', () => {
    expect(attendance('a', [doc(['a'], ['b']), doc([], ['a']), doc(['a'], [])])).toEqual({
      present: 2,
      absent: 1,
      rate: 67,
    });
    expect(attendance('x', [doc(['a'], [])]).rate).toBeNull();
  });
  it('Hausaufgaben', () => {
    const hw = (status: string) => ({ status }) as HomeworkRow;
    expect(homeworkStats([hw('Offen'), hw('Offen'), hw('Korrigiert')])).toEqual({
      total: 3,
      Offen: 2,
      Abgegeben: 0,
      Korrigiert: 1,
    });
  });
});

describe('Formulare', () => {
  const uuid = '00000000-0000-4000-8000-000000000001';
  it('Gruppe', () => {
    expect(parseGroup(form({ name: 'A1 Abend', level: 'A1', start_date: '2026-01-05' }))).toEqual({
      ok: true,
      data: { name: 'A1 Abend', level: 'A1', start_date: '2026-01-05' },
    });
    expect(parseGroup(form({ name: '', level: 'A1' })).ok).toBe(false);
    expect(parseGroup(form({ name: 'x', level: 'C1' })).ok).toBe(false);
  });
  it('Schüler mit Fertigkeiten 1–5', () => {
    const r = parseStudent(
      form({ name: 'Test', level: 'A2', current_module: 'A2.3', skill_speaking: '4' }),
    );
    expect(r.ok && r.data.skill_speaking).toBe(4);
    expect(r.ok && r.data.skill_grammar).toBeNull();
    expect(parseStudent(form({ name: 'Test', level: 'A2', skill_speaking: '6' })).ok).toBe(false);
    expect(parseStudent(form({ name: 'Test', level: 'A2', current_module: 'A1.3' })).ok).toBe(
      false,
    );
  });
  it('Fehler', () => {
    const r = parseError(
      form({ student_id: uuid, error: 'Ich habe gegeht', category: 'Grammatik' }),
      '2026-01-05',
    );
    expect(r).toEqual({
      ok: true,
      data: {
        student_id: uuid,
        date: '2026-01-05',
        error: 'Ich habe gegeht',
        correction: '',
        category: 'Grammatik',
        status: 'offen',
      },
    });
    expect(
      parseError(form({ student_id: uuid, error: 'x', category: 'Mathe' }), '2026-01-05').ok,
    ).toBe(false);
  });
  it('Hausaufgabe für einen Schüler oder eine ganze Gruppe', () => {
    const one = parseHomework(form({ student_id: uuid, task: '5 Sätze' }));
    expect(one.ok && one.data.target).toEqual({ student: uuid });
    const all = parseHomework(form({ student_id: `group:${uuid}`, task: '5 Sätze' }));
    expect(all.ok && all.data.target).toEqual({ group: uuid });
    expect(parseHomework(form({ student_id: uuid, task: '' })).ok).toBe(false);
  });
  it('Dokumentation', () => {
    const r = parseDoc(
      form({
        group_id: uuid,
        lesson_id: 'A1.1.Mo',
        present: [uuid, 'kaputt'],
        homework_for_present: 'on',
      }),
      '2026-01-05',
    );
    expect(r.ok && r.data.present).toEqual([uuid]);
    expect(r.ok && r.data.homeworkForPresent).toBe(true);
    expect(parseDoc(form({ group_id: uuid, lesson_id: 'X' }), '2026-01-05').ok).toBe(false);
  });
});
