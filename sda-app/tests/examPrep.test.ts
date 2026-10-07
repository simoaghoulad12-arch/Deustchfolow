import { describe, expect, it } from 'vitest';
import type { ExamRegistrationRow, ModelTestResultRow } from '../lib/data/types';
import { examLessons, passedFromRegistrations, readiness } from '../lib/examPrep';

const r = (
  part: string,
  score: number,
  max: number,
  date = '2026-03-01',
  level = 'B1',
): ModelTestResultRow =>
  ({ part, score, max_score: max, date, level, created_at: date }) as ModelTestResultRow;

describe('Prüfungsvorbereitung', () => {
  it('Prüfungsstunden aus dem Kurs (z. B. Modelltests in B2)', () => {
    const b2 = examLessons('B2').map((l) => l.title);
    expect(b2.some((t) => t.includes('Modelltest Hören'))).toBe(true);
    expect(b2.some((t) => t.includes('Modelltest Schreiben'))).toBe(true);
  });

  it('ohne Modelltest: keine Bewertung, keine Empfehlung', () => {
    expect(readiness('B1', [])).toMatchObject({ lastDate: null, weakest: null, repeat: [] });
  });

  it('letztes Ergebnis pro Teil, schwächster Teil und Stunden zum Wiederholen', () => {
    const x = readiness('B1', [
      r('Lesen', 10, 30, '2026-02-01'),
      r('Lesen', 24, 30, '2026-03-01'),
      r('Hören', 15, 30),
      r('Schreiben', 20, 25),
      r('Sprechen', 20, 25),
      r('Hören', 1, 30, '2026-03-01', 'A2'), // anderes Level zählt nicht
    ]);
    expect(x.lastDate).toBe('2026-03-01');
    expect(x.parts.map((p) => p.percent)).toEqual([80, 50, 80, 80]);
    expect(x.weakest).toBe('Hören');
    expect(x.repeat.length).toBeGreaterThan(0);
    expect(x.repeat.every((l) => l.level === 'B1' && l.areas.includes('Hören'))).toBe(true);
  });

  it('bestanden setzt das Level auf 100 % und schaltet das nächste frei; B2 hat kein nächstes', () => {
    const reg = (level: string, result: string) => ({ level, result }) as ExamRegistrationRow;
    const p = passedFromRegistrations([
      reg('A2', 'bestanden'),
      reg('B1', 'nicht bestanden'),
      reg('B2', 'bestanden'),
    ]);
    expect([...p.passed].sort()).toEqual(['A2', 'B2']);
    expect(p.next).toEqual(['B1']);
  });
});

describe('Formularfelder', () => {
  it('Modelltest: Feldnamen sind ASCII (Umlaute in Namen kommen beim Absenden nicht sicher an)', async () => {
    const { parseModelTest } = await import('../lib/validation');
    const f = new FormData();
    f.set('student_id', '00000000-0000-4000-8000-000000000001');
    f.set('level', 'B1');
    f.set('score-hoeren', '12,5');
    f.set('max-hoeren', '30');
    const r = parseModelTest(f, '2026-03-01');
    expect(r.ok && r.data.parts).toEqual([{ part: 'Hören', score: 12.5, max_score: 30 }]);
  });

  it('alle Formularfelder der App haben ASCII-Namen', async () => {
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const path = await import('node:path');
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = path.join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.tsx')) files.push(p);
      }
    };
    walk(path.join(__dirname, '..', 'app'));
    walk(path.join(__dirname, '..', 'components'));
    for (const file of files) {
      for (const m of readFileSync(file, 'utf8').matchAll(/\bname="([^"]+)"/g)) {
        expect(/^[\x20-\x7e]+$/.test(m[1]!), `${file}: name="${m[1]}"`).toBe(true);
      }
    }
  });
});
