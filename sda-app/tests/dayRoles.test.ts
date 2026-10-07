import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { allLessons, content } from '../content';
import {
  dayRole,
  DAYS,
  DEFAULT_DAY_ROLES,
  normalizeDayRoles,
  stepsFor,
  type Person,
} from '../lib/dayRoles';
import { lessonProgress, lessonSpan, minuteRange, statusOf } from '../lib/progress';
import { loadLegacy } from '../scripts/legacy-runtime';

const legacy = loadLegacy();
const LEGACY_ME: Record<Person, string> = { L1: 'L1', L2: 'L2', N: 'N', ALL: 'ALL' };

describe('Rollen pro Wochentag', () => {
  it('Vorschlag entspricht legacy (dayRole) für jede Person und jeden Tag', () => {
    for (const person of ['L1', 'L2', 'N', 'ALL'] as Person[]) {
      for (const day of DAYS) {
        const legacyRole = legacy.run<string | null>(
          `(function(){state.me=${JSON.stringify(LEGACY_ME[person])};state.showAll=false;return dayRole({day:${JSON.stringify(day)}});})()`,
        );
        expect(dayRole(person, day, DEFAULT_DAY_ROLES), `${person} ${day}`).toBe(legacyRole);
      }
    }
  });

  it('sichtbare Aufgaben je Stunde entsprechen legacy (steps) – Stichprobe über alle Tage', () => {
    const sample = allLessons().filter((l) => l.level === 'A2' && l.moduleId === 'A2.3');
    for (const person of ['L1', 'L2', 'N', 'ALL'] as Person[]) {
      for (const lesson of sample) {
        const ids = stepsFor(
          lesson,
          dayRole(person, lesson.day, DEFAULT_DAY_ROLES),
          content.meta.phases,
        ).map((s) => s.item.id);
        const legacyIds = legacy.run<string[]>(
          `(function(){state.me=${JSON.stringify(LEGACY_ME[person])};state.showAll=false;return steps(findLesson(${JSON.stringify(lesson.id)})).map(function(o){return o.x.id;});})()`,
        );
        expect(ids, `${person} ${lesson.id}`).toEqual(legacyIds);
      }
    }
  });

  it('gespeicherter Plan wird geprüft und ergänzt', () => {
    const r = normalizeDayRoles({ Mo: { L1: 'A', L2: 'H' }, Di: { L1: 'X' } });
    expect(r.Mo).toEqual({ L1: 'A', L2: 'H' });
    expect(r.Di).toEqual(DEFAULT_DAY_ROLES.Di);
    expect(normalizeDayRoles(null)).toEqual(DEFAULT_DAY_ROLES);
  });

  it('Migration enthält denselben Vorschlag', () => {
    const sql = readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '20261007130000_phase4_day_roles.sql'),
      'utf8',
    );
    const json = /'(\{.*\})'/.exec(sql)?.[1];
    expect(JSON.parse(json ?? 'null')).toEqual(DEFAULT_DAY_ROLES);
  });
});

describe('Fortschritt und Timer', () => {
  it('Status wie legacy: Offen, In Arbeit, Abgeschlossen', () => {
    const lesson = allLessons().find((l) => l.id === 'A1.1.Mo')!;
    const ids = stepsFor(lesson, null, content.meta.phases).map((s) => s.item.id);
    expect(statusOf(lessonProgress(lesson, 'ALL', DEFAULT_DAY_ROLES, new Set()))).toBe('Offen');
    expect(
      statusOf(lessonProgress(lesson, 'ALL', DEFAULT_DAY_ROLES, new Set(ids.slice(0, 2)))),
    ).toBe('In Arbeit');
    expect(statusOf(lessonProgress(lesson, 'ALL', DEFAULT_DAY_ROLES, new Set(ids)))).toBe(
      'Abgeschlossen',
    );
  });

  it('Minutenbereiche und Stundenlänge', () => {
    expect(minuteRange('20–55')).toEqual([20, 55]);
    expect(minuteRange('T–1 Tag')).toBeNull();
    expect(lessonSpan(allLessons().find((l) => l.id === 'A1.1.Mo')!)).toBe(120);
    expect(lessonSpan(allLessons().find((l) => l.id === 'A1.1.Fr')!)).toBe(60);
  });
});
