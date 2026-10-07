/**
 * Zugriffsregeln für Schüler (Phase 8): nur eigene Daten, keine internen Team-Inhalte.
 * Testdaten sind frei erfunden und existieren nur in dieser Test-Datenbank.
 */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { addMember, asUser, createTestDb } from './helpers';

const ADMIN = '00000000-0000-4000-8000-0000000000a1';
const TEACHER = '00000000-0000-4000-8000-0000000000a2';
const PUPIL_A = '00000000-0000-4000-8000-0000000000b1'; // Login von Schüler A
const PUPIL_B = '00000000-0000-4000-8000-0000000000b2'; // Login von Schüler B
const GROUP_A = '10000000-0000-4000-8000-0000000000a0';
const GROUP_B = '10000000-0000-4000-8000-0000000000b0';
const STUDENT_A = '20000000-0000-4000-8000-0000000000a0';
const STUDENT_B = '20000000-0000-4000-8000-0000000000b0';
const HW_A = '30000000-0000-4000-8000-0000000000a0';
const HW_B = '30000000-0000-4000-8000-0000000000b0';

let db: PGlite;
const rows = async <T>(user: string, sql: string) =>
  asUser(db, user, async () => (await db.query<T>(sql)).rows);
const count = async (user: string, table: string) =>
  asUser(db, user, async () =>
    Number(
      (await db.query<{ n: number }>(`select count(*)::int n from public.${table}`)).rows[0]?.n,
    ),
  );

beforeAll(async () => {
  db = await createTestDb();
  await addMember(db, ADMIN, 'admin');
  await addMember(db, TEACHER, 'teacher');
  await addMember(db, PUPIL_A, 'student');
  await addMember(db, PUPIL_B, 'student');
  await db.exec(`
    insert into public.groups (id, name, level) values ('${GROUP_A}', 'Gruppe A', 'A1'), ('${GROUP_B}', 'Gruppe B', 'A1');
    insert into public.group_staff values ('${GROUP_A}', '${TEACHER}');
    insert into public.students (id, name, level, group_id, profile_id) values
      ('${STUDENT_A}', 'Schüler A', 'A1', '${GROUP_A}', '${PUPIL_A}'),
      ('${STUDENT_B}', 'Schüler B', 'A1', '${GROUP_B}', '${PUPIL_B}');
    insert into public.errors (student_id, error, category) values ('${STUDENT_A}', 'a', 'Grammatik'), ('${STUDENT_B}', 'b', 'Grammatik');
    insert into public.homework (id, student_id, task) values ('${HW_A}', '${STUDENT_A}', 'a'), ('${HW_B}', '${STUDENT_B}', 'b');
    insert into public.lesson_docs (date, group_id, lesson_id, present, absent, problems, created_by) values
      ('2026-01-05', '${GROUP_A}', 'A1.1.Mo', '{${STUDENT_A}}', '{}', 'internes Problem', '${ADMIN}'),
      ('2026-01-06', '${GROUP_A}', 'A1.1.Di', '{}', '{${STUDENT_A}}', '', '${ADMIN}'),
      ('2026-01-05', '${GROUP_B}', 'A1.1.Mo', '{${STUDENT_B}}', '{}', '', '${ADMIN}');
    insert into public.material_notes (lesson_id, note) values ('A1.1.Mo', 'intern');
    insert into public.checklist_progress (user_id, item_id) values ('${TEACHER}', 'A1.1.Mo#0');
    insert into public.app_settings (key, value) values ('progress_formula', '{"wAttendance":1}');
    -- Ergebnisse schreibt der Server (hier als Datenbank-Besitzer)
    insert into public.exercise_attempts (student_id, exercise_id, answer, correct) values ('${STUDENT_A}', 'A1.1.Di#0', 'x', true), ('${STUDENT_B}', 'A1.1.Di#0', 'y', false);
    insert into public.test_results (student_id, module_id, score, max_score) values ('${STUDENT_A}', 'A1.1', 6, 8), ('${STUDENT_B}', 'A1.1', 3, 8);
  `);
}, 60_000);

describe('Schüler sieht nur eigene Daten', () => {
  it('eigener Schüler-Datensatz, eigene Fehler und Hausaufgaben', async () => {
    expect(
      (await rows<{ id: string }>(PUPIL_A, 'select id from public.students')).map((r) => r.id),
    ).toEqual([STUDENT_A]);
    expect(await rows<{ error: string }>(PUPIL_A, 'select error from public.errors')).toEqual([
      { error: 'a' },
    ]);
    expect(await rows<{ task: string }>(PUPIL_A, 'select task from public.homework')).toEqual([
      { task: 'a' },
    ]);
    expect(
      await rows<{ module_id: string; score: number }>(
        PUPIL_A,
        'select module_id, score from public.test_results',
      ),
    ).toEqual([{ module_id: 'A1.1', score: 6 }]);
    expect(await count(PUPIL_A, 'exercise_attempts')).toBe(1);
  });

  it('keine internen Team-Inhalte: Dokumentation, Notizen, Häkchen, Entscheidungen, Gruppen, Team', async () => {
    for (const t of [
      'lesson_docs',
      'material_notes',
      'checklist_progress',
      'decisions',
      'groups',
      'group_staff',
    ]) {
      expect(await count(PUPIL_A, t), t).toBe(0);
    }
    // nur das eigene Profil
    expect(
      (await rows<{ id: string }>(PUPIL_A, 'select id from public.profiles')).map((r) => r.id),
    ).toEqual([PUPIL_A]);
    // Einstellungen: nur die Fortschritts-Formel
    expect(
      (await rows<{ key: string }>(PUPIL_A, 'select key from public.app_settings')).map(
        (r) => r.key,
      ),
    ).toEqual(['progress_formula']);
  });

  it('kann nichts anlegen oder ändern – Ergebnisse schreibt nur der Server', async () => {
    for (const sql of [
      `insert into public.exercise_attempts (student_id, exercise_id, answer, correct) values ('${STUDENT_A}', 'x', 'x', true)`,
      `insert into public.test_results (student_id, module_id, score, max_score) values ('${STUDENT_A}', 'A1.1', 8, 8)`,
      `insert into public.submissions (homework_id, student_id, text) values ('${HW_A}', '${STUDENT_A}', 'x')`,
      `insert into public.errors (student_id, error, category) values ('${STUDENT_A}', 'x', 'Grammatik')`,
    ]) {
      await expect(
        asUser(db, PUPIL_A, () => db.query(sql)),
        sql,
      ).rejects.toThrow(/row-level security/);
    }
    const upd = await asUser(db, PUPIL_A, () =>
      db.query(`update public.homework set status = 'Korrigiert' where id = '${HW_A}'`),
    );
    expect(upd.affectedRows).toBe(0);
    const stu = await asUser(db, PUPIL_A, () =>
      db.query(`update public.students set skill_speaking = 5 where id = '${STUDENT_A}'`),
    );
    expect(stu.affectedRows).toBe(0);
  });

  it('Hausaufgabe abgeben: nur eigene, Status wird „Abgegeben“', async () => {
    await asUser(db, PUPIL_A, () =>
      db.query(`select public.submit_homework('${HW_A}', 'Meine fünf Sätze')`),
    );
    const r = await db.query<{ status: string }>(
      `select status from public.homework where id = '${HW_A}'`,
    );
    expect(r.rows[0]?.status).toBe('Abgegeben');
    expect(await count(PUPIL_A, 'submissions')).toBe(1);
    await expect(
      asUser(db, PUPIL_A, () => db.query(`select public.submit_homework('${HW_B}', 'fremd')`)),
    ).rejects.toThrow(/keine eigene Hausaufgabe/);
    expect(await count(PUPIL_B, 'submissions')).toBe(0);
  });

  it('eigene Anwesenheit ohne Einblick in die Dokumentation', async () => {
    const r = await rows<{ lesson_id: string; present: boolean }>(
      PUPIL_A,
      'select lesson_id, present from public.my_attendance() order by date',
    );
    expect(r).toEqual([
      { lesson_id: 'A1.1.Mo', present: true },
      { lesson_id: 'A1.1.Di', present: false },
    ]);
    // Team-Mitglieder bekommen über die Funktion nichts
    expect(await rows(TEACHER, 'select * from public.my_attendance()')).toEqual([]);
  });

  it('Schüler B sieht nichts von Schüler A', async () => {
    expect(
      (await rows<{ id: string }>(PUPIL_B, 'select id from public.students')).map((r) => r.id),
    ).toEqual([STUDENT_B]);
    expect(await rows<{ error: string }>(PUPIL_B, 'select error from public.errors')).toEqual([
      { error: 'b' },
    ]);
    expect(await rows<{ score: number }>(PUPIL_B, 'select score from public.test_results')).toEqual(
      [{ score: 3 }],
    );
  });
});

describe('Team und Schüler-Logins', () => {
  it('Schüler zählen nicht zum Team', async () => {
    const r = await rows<{ staff: boolean; student: boolean }>(
      PUPIL_A,
      'select public.is_staff() staff, public.is_student() student',
    );
    expect(r[0]).toEqual({ staff: false, student: true });
  });

  it('Lehrkraft sieht Ergebnisse und Abgaben nur ihrer Gruppen, aber keine Schüler-Profile', async () => {
    expect(await rows<{ score: number }>(TEACHER, 'select score from public.test_results')).toEqual(
      [{ score: 6 }],
    );
    expect(await count(TEACHER, 'submissions')).toBe(1);
    const profiles = (
      await rows<{ id: string }>(TEACHER, 'select id from public.profiles order by id')
    ).map((r) => r.id);
    expect(profiles).toEqual([ADMIN, TEACHER].sort());
  });
});
