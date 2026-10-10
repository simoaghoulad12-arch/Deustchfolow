/** Zugriffsregeln Prüfungen (Phase 9). Testdaten frei erfunden. */
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { addMember, asUser, createTestDb } from './helpers';

const TEACHER = '00000000-0000-4000-8000-0000000000c1';
const PUPIL_A = '00000000-0000-4000-8000-0000000000c2';
const PUPIL_B = '00000000-0000-4000-8000-0000000000c3';
const GROUP_A = '10000000-0000-4000-8000-0000000000c0';
const GROUP_B = '10000000-0000-4000-8000-0000000000c9';
const STUDENT_A = '20000000-0000-4000-8000-0000000000c0';
const STUDENT_B = '20000000-0000-4000-8000-0000000000c9';

let db: PGlite;
const q = <T>(user: string, sql: string) =>
  asUser(db, user, async () => (await db.query<T>(sql)).rows);

beforeAll(async () => {
  db = await createTestDb();
  await addMember(db, TEACHER, 'teacher');
  await addMember(db, PUPIL_A, 'student');
  await addMember(db, PUPIL_B, 'student');
  await db.exec(`
    insert into public.groups (id, name, level) values ('${GROUP_A}', 'A', 'B1'), ('${GROUP_B}', 'B', 'B1');
    insert into public.group_staff values ('${GROUP_A}', '${TEACHER}');
    insert into public.students (id, name, level, group_id, profile_id) values
      ('${STUDENT_A}', 'A', 'B1', '${GROUP_A}', '${PUPIL_A}'), ('${STUDENT_B}', 'B', 'B1', '${GROUP_B}', '${PUPIL_B}');
    insert into public.exam_registrations (student_id, level, provider, result) values ('${STUDENT_B}', 'B1', 'x', 'bestanden');
  `);
}, 60_000);

describe('Prüfungen', () => {
  it('Lehrkraft trägt Modelltest und Anmeldung für eigene Gruppe ein, nicht für fremde', async () => {
    await q(
      TEACHER,
      `insert into public.model_test_results (student_id, level, part, score, max_score) values ('${STUDENT_A}', 'B1', 'Lesen', 18, 30)`,
    );
    await q(
      TEACHER,
      `insert into public.exam_registrations (student_id, level, provider, result) values ('${STUDENT_A}', 'B1', 'Anbieter', 'offen')`,
    );
    await expect(
      q(
        TEACHER,
        `insert into public.exam_registrations (student_id, level) values ('${STUDENT_B}', 'B1')`,
      ),
    ).rejects.toThrow(/row-level security/);
    expect(await q(TEACHER, 'select level from public.exam_registrations')).toEqual([
      { level: 'B1' },
    ]);
  });

  it('Schüler sieht nur eigene Ergebnisse und Anmeldungen und kann nichts eintragen', async () => {
    expect(
      await q<{ part: string }>(PUPIL_A, 'select part from public.model_test_results'),
    ).toEqual([{ part: 'Lesen' }]);
    expect(
      await q<{ result: string }>(PUPIL_A, 'select result from public.exam_registrations'),
    ).toEqual([{ result: 'offen' }]);
    expect(
      await q<{ result: string }>(PUPIL_B, 'select result from public.exam_registrations'),
    ).toEqual([{ result: 'bestanden' }]);
    await expect(
      q(
        PUPIL_A,
        `insert into public.exam_registrations (student_id, level, result) values ('${STUDENT_A}', 'B1', 'bestanden')`,
      ),
    ).rejects.toThrow(/row-level security/);
    const upd = await asUser(db, PUPIL_A, () =>
      db.query(`update public.exam_registrations set result = 'bestanden'`),
    );
    expect(upd.affectedRows).toBe(0);
  });

  it('Punkte dürfen das Maximum nicht überschreiten', async () => {
    await expect(
      q(
        TEACHER,
        `insert into public.model_test_results (student_id, level, part, score, max_score) values ('${STUDENT_A}', 'B1', 'Hören', 31, 30)`,
      ),
    ).rejects.toThrow(/check constraint/);
  });
});
