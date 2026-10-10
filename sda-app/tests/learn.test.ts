import { describe, expect, it } from 'vitest';
import {
  DEFAULT_FORMULA,
  isCorrect,
  levelProgress,
  miniTest,
  moduleExercises,
  moduleProgress,
  normalizeFormula,
  totalProgress,
  unlockedLevels,
  type LearnerData,
} from '../lib/learn';
import { loadLegacy } from '../scripts/legacy-runtime';

const empty = (): LearnerData => ({
  attendance: [],
  solved: new Set(),
  bestTest: new Map(),
  passedLevels: new Set(),
});

describe('Übungen und Mini-Test aus content/', () => {
  it('A1-Modul hat 16 Übungen (4 Stunden × 4), B1 noch keine', () => {
    expect(moduleExercises('A1.1')).toHaveLength(16);
    expect(moduleExercises('A2.8')).toHaveLength(16);
    expect(moduleExercises('B1.1')).toHaveLength(0);
  });

  it('Mini-Test enthält dieselben Fragen wie legacy (testScript)', () => {
    const rt = loadLegacy();
    for (const m of ['A1.1', 'A2.5']) {
      const [lv, wi] = m.split('.');
      const legacy = rt.run<{ q: string; a: string }[]>(
        `(function(){var lv=lvByK(${JSON.stringify(lv)}),qs=[];for(var di=0;di<4;di++){var sc=scriptFor(lv,${Number(wi) - 1},di);if(sc)sc.u.slice(0,2).forEach(function(u){qs.push(u);});}return qs;})()`,
      );
      expect(miniTest(m).map((e) => ({ q: e.frage, a: e.loesung }))).toEqual(legacy);
    }
    expect(miniTest('B2.3')).toHaveLength(0);
  });

  it('Antworten prüfen: tolerant bei Groß/klein, Leerzeichen, Satzzeichen am Ende', () => {
    expect(isCorrect('  woher kommst du? ', 'Woher kommst du?')).toBe(true);
    expect(isCorrect('a - m - a - l', 'A-M-A-L')).toBe(true);
    expect(isCorrect('„komme“', 'komme')).toBe(true);
    expect(isCorrect('kommst', 'komme')).toBe(false);
    expect(isCorrect('', '')).toBe(false);
  });
});

describe('Fortschritt (PROPOSAL)', () => {
  it('ohne Daten 0 %', () => {
    expect(moduleProgress('A1.1', empty(), DEFAULT_FORMULA).percent).toBe(0);
    expect(totalProgress(empty(), DEFAULT_FORMULA)).toBe(0);
  });

  it('gleiche Gewichte: Anwesenheit, Übungen, Mini-Test', () => {
    const d = empty();
    d.attendance = [
      { lessonId: 'A1.1.Mo', present: true },
      { lessonId: 'A1.1.Di', present: false },
    ];
    for (const e of moduleExercises('A1.1').slice(0, 8)) d.solved.add(e.id);
    d.bestTest.set('A1.1', 75);
    const p = moduleProgress('A1.1', d, DEFAULT_FORMULA);
    expect(p).toMatchObject({
      attendance: 50,
      exercises: 50,
      test: 75,
      percent: 58,
      passed: false,
    });
  });

  it('Gewichte und Bestehensgrenze aus den Einstellungen', () => {
    const d = empty();
    d.bestTest.set('A1.1', 80);
    const f = normalizeFormula({ wAttendance: 0, wExercises: 0, wTest: 1, passPercent: 70 });
    expect(moduleProgress('A1.1', d, f)).toMatchObject({ percent: 80, passed: true });
  });

  it('B1 ohne Übungen: nur Anwesenheit zählt; bestandene Prüfung = Level 100 %', () => {
    const d = empty();
    d.attendance = [{ lessonId: 'B1.1.Mo', present: true }];
    expect(moduleProgress('B1.1', d, DEFAULT_FORMULA)).toMatchObject({
      attendance: 100,
      exercises: null,
      test: null,
      percent: 100,
    });
    d.passedLevels.add('A1');
    expect(levelProgress('A1', d, DEFAULT_FORMULA).percent).toBe(100);
    expect(totalProgress(d, DEFAULT_FORMULA)).toBe(Math.round((100 + 0 + 10 + 0) / 4));
  });

  it('freigeschaltete Level', () => {
    expect(unlockedLevels('A2')).toEqual(['A1', 'A2']);
    expect(normalizeFormula({ wTest: -3, passPercent: 120 })).toEqual(DEFAULT_FORMULA);
  });
});
