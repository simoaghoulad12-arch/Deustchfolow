import { describe, expect, it } from 'vitest';
import type { LessonDocRow, StudentRow } from '../lib/data/types';
import { levelInRange, search } from '../lib/search';
import { qualitySummary, studentQuality } from '../lib/quality';
import type { SchoolData } from '../lib/data/queries';

describe('Suche', () => {
  it('findet Stunden, Module und Lernziele, Groß/klein und Akzente egal', () => {
    const hits = search('perfekt');
    expect(hits.some((h) => h.kind === 'Stunde')).toBe(true);
    expect(search('PERFEKT').length).toBe(hits.length);
    expect(search('behorde').length).toBeGreaterThan(0); // „Behörde“
  });

  it('Filter nach Level und Bereich', () => {
    const b1 = search('Brief', { level: 'B1' });
    expect(b1.length).toBeGreaterThan(0);
    expect(b1.every((h) => !h.detail.startsWith('A1') && !h.href.includes('A1.'))).toBe(true);
    const de = search('Arzt', { area: 'Deutschland' });
    expect(de.length).toBeGreaterThan(0);
    expect(
      de.every((h) => h.kind === 'Stunde' || h.kind === 'Modul' || h.kind === 'Dokumentation'),
    ).toBe(true);
  });

  it('findet Schüler und Dokumentationen', () => {
    const students = [
      {
        id: 's1',
        name: 'Amal Test',
        level: 'A1',
        strengths: '',
        weaknesses: 'Artikel',
        next_goals: '',
      },
    ] as StudentRow[];
    const docs = [
      {
        id: 'd1',
        date: '2026-01-05',
        lesson_id: 'A1.1.Mo',
        covered: 'Alphabet geübt',
        can_do: '',
        errors: '',
        homework: '',
        problems: 'Ton weg',
      },
    ] as LessonDocRow[];
    expect(search('amal', {}, { students, docs })[0]?.kind).toBe('Schüler');
    expect(search('ton weg', {}, { students, docs })[0]?.kind).toBe('Dokumentation');
    expect(search('amal', { level: 'B1' }, { students, docs })).toHaveLength(0);
  });

  it('Niveau-Bereiche der Aktivitäten (legacy: inRange)', () => {
    expect(levelInRange('A1–B2', 'B1')).toBe(true);
    expect(levelInRange('A2', 'A1')).toBe(false);
    expect(levelInRange('B1–B2', 'A2')).toBe(false);
  });
});

describe('Quality Control', () => {
  const data = {
    students: [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ],
    docs: [
      { date: '2026-01-05', present: ['a'], absent: ['b'], created_at: '' },
      { date: '2026-01-06', present: ['a', 'b'], absent: [], created_at: '' },
    ],
    homework: [
      { student_id: 'a', status: 'Korrigiert' },
      { student_id: 'b', status: 'Offen' },
    ],
    errors: [{ student_id: 'b', status: 'offen' }],
    groups: [],
    profiles: [],
  } as unknown as SchoolData;
  const none = { attendanceMin: null, homeworkDoneMin: null, daysWithoutDocMax: null };

  it('Kennzahlen', () => {
    expect(qualitySummary(data, '2026-01-07')).toMatchObject({
      students: 2,
      avgAttendance: 75,
      homeworkDone: 50,
      errorsOpen: 1,
      docs: 2,
      docsLast7: 2,
    });
  });

  it('ohne festgelegte Schwellen keine Warnungen', () => {
    expect(studentQuality(data, '2026-01-07', none).every((q) => q.warnings.length === 0)).toBe(
      true,
    );
  });

  it('mit Schwellen: Warnungen nur für Betroffene', () => {
    const q = studentQuality(data, '2026-01-20', {
      attendanceMin: 60,
      homeworkDoneMin: 50,
      daysWithoutDocMax: 10,
    });
    const b = q.find((x) => x.student.id === 'b')!;
    expect(b.warnings).toEqual([
      'Anwesenheit unter 60 %',
      'Hausaufgaben unter 50 %',
      'seit 14 Tagen ohne Dokumentation',
    ]);
    expect(q.find((x) => x.student.id === 'a')!.warnings).toEqual([
      'seit 14 Tagen ohne Dokumentation',
    ]);
  });
});
