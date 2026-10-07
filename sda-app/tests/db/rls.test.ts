/**
 * Zugriffsregeln (Row Level Security) – Phase 2.
 * Testdaten sind frei erfunden und existieren nur in dieser Test-Datenbank.
 */
import { readFileSync } from 'node:fs';
import type { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';
import { DECISIONS_MIGRATION, decisionsSql } from '../../scripts/gen-decisions-sql';
import { addMember, asUser, createTestDb } from './helpers';

const ADMIN = '00000000-0000-4000-8000-000000000001';
const TEACHER = '00000000-0000-4000-8000-000000000002';
const NATIVE = '00000000-0000-4000-8000-000000000003';
const OUTSIDER = '00000000-0000-4000-8000-000000000004'; // angemeldet, aber nicht eingeladen
const GROUP_A = '10000000-0000-4000-8000-00000000000a';
const GROUP_B = '10000000-0000-4000-8000-00000000000b';
const STUDENT_A = '20000000-0000-4000-8000-00000000000a';
const STUDENT_B = '20000000-0000-4000-8000-00000000000b';
const STUDENT_NONE = '20000000-0000-4000-8000-00000000000c';

let db: PGlite;
const count = async (user: string | null, sql: string) =>
  asUser(db, user, async () =>
    Number((await db.query<{ n: number }>(`select count(*)::int as n ${sql}`)).rows[0]?.n),
  );
const ids = async (user: string | null, table: string) =>
  asUser(db, user, async () =>
    (await db.query<{ id: string }>(`select id from public.${table} order by id`)).rows.map(
      (r) => r.id,
    ),
  );
const setVisibility = (v: 'own_groups' | 'all') =>
  asUser(db, ADMIN, () =>
    db.query(`update public.app_settings set value = $1 where key = 'staff_group_visibility'`, [
      JSON.stringify(v),
    ]),
  );

beforeAll(async () => {
  db = await createTestDb();
  await addMember(db, ADMIN, 'admin');
  await addMember(db, TEACHER, 'teacher');
  await addMember(db, NATIVE, 'native');
  await addMember(db, OUTSIDER, null);
  await db.exec(`
    insert into public.groups (id, name, level) values ('${GROUP_A}', 'Testgruppe A', 'A1'), ('${GROUP_B}', 'Testgruppe B', 'A2');
    insert into public.group_staff values ('${GROUP_A}', '${TEACHER}'), ('${GROUP_A}', '${NATIVE}');
    insert into public.students (id, name, level, group_id) values
      ('${STUDENT_A}', 'Test A', 'A1', '${GROUP_A}'),
      ('${STUDENT_B}', 'Test B', 'A2', '${GROUP_B}'),
      ('${STUDENT_NONE}', 'Test ohne Gruppe', 'A1', null);
    insert into public.errors (student_id, error, category) values ('${STUDENT_A}', 'x', 'Grammatik'), ('${STUDENT_B}', 'y', 'Satzbau');
    insert into public.homework (student_id, task) values ('${STUDENT_A}', 'x'), ('${STUDENT_B}', 'y');
    insert into public.lesson_docs (date, group_id, lesson_id, created_by) values
      ('2026-01-05', '${GROUP_A}', 'A1.1.Mo', '${ADMIN}'), ('2026-01-05', '${GROUP_B}', 'A2.1.Mo', '${ADMIN}');
  `);
}, 60_000);

describe('ohne Einladung kein Zugriff', () => {
  it('anonyme Anfragen werden abgelehnt', async () => {
    await expect(asUser(db, null, () => db.query('select * from public.students'))).rejects.toThrow(
      /permission denied/,
    );
  });

  it('angemeldet, aber ohne Profil: sieht nichts', async () => {
    for (const t of [
      'profiles',
      'groups',
      'students',
      'errors',
      'homework',
      'lesson_docs',
      'decisions',
      'app_settings',
    ]) {
      expect(await count(OUTSIDER, `from public.${t}`), t).toBe(0);
    }
  });

  it('ohne Profil keine Einträge möglich', async () => {
    await expect(
      asUser(db, OUTSIDER, () =>
        db.query(
          `insert into public.errors (student_id, error, category) values ('${STUDENT_A}', 'z', 'Grammatik')`,
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});

describe('admin', () => {
  it('sieht alle Gruppen, Schüler, Fehler, Hausaufgaben und Dokumentationen', async () => {
    expect(await ids(ADMIN, 'groups')).toEqual([GROUP_A, GROUP_B]);
    expect(await ids(ADMIN, 'students')).toEqual([STUDENT_A, STUDENT_B, STUDENT_NONE]);
    expect(await count(ADMIN, 'from public.errors')).toBe(2);
    expect(await count(ADMIN, 'from public.homework')).toBe(2);
    expect(await count(ADMIN, 'from public.lesson_docs')).toBe(2);
  });

  it('kann Rollen vergeben', async () => {
    await asUser(db, ADMIN, () =>
      db.query(`update public.profiles set role = 'native' where id = $1`, [TEACHER]),
    );
    expect(
      (
        await db.query<{ role: string }>('select role from public.profiles where id = $1', [
          TEACHER,
        ])
      ).rows[0]?.role,
    ).toBe('native');
    await db.query(`update public.profiles set role = 'teacher' where id = $1`, [TEACHER]);
  });
});

describe('Einstellung „nur eigene Gruppen“ (Standard)', () => {
  it('Standard ist own_groups', async () => {
    const r = await db.query<{ value: string }>(
      `select value from public.app_settings where key = 'staff_group_visibility'`,
    );
    expect(r.rows[0]?.value).toBe('own_groups');
  });

  for (const [name, user] of [
    ['Lehrkraft', TEACHER],
    ['Muttersprachler/in', NATIVE],
  ] as const) {
    it(`${name} sieht keine fremden Gruppen und deren Schülerdaten`, async () => {
      expect(await ids(user, 'groups')).toEqual([GROUP_A]);
      expect(await ids(user, 'students')).toEqual([STUDENT_A]);
      expect(await count(user, `from public.errors where student_id = '${STUDENT_B}'`)).toBe(0);
      expect(await count(user, `from public.homework where student_id = '${STUDENT_B}'`)).toBe(0);
      expect(await count(user, `from public.lesson_docs where group_id = '${GROUP_B}'`)).toBe(0);
      expect(await count(user, 'from public.errors')).toBe(1);
    });
  }

  it('Lehrkraft kann keine Fehler, Hausaufgaben oder Dokumentation für fremde Gruppen anlegen', async () => {
    await expect(
      asUser(db, TEACHER, () =>
        db.query(
          `insert into public.errors (student_id, error, category) values ('${STUDENT_B}', 'z', 'Grammatik')`,
        ),
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      asUser(db, TEACHER, () =>
        db.query(`insert into public.homework (student_id, task) values ('${STUDENT_B}', 'z')`),
      ),
    ).rejects.toThrow(/row-level security/);
    await expect(
      asUser(db, TEACHER, () =>
        db.query(
          `insert into public.lesson_docs (date, group_id, lesson_id) values ('2026-01-06', '${GROUP_B}', 'A2.1.Di')`,
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it('Lehrkraft kann in der eigenen Gruppe dokumentieren und Schülerdaten bearbeiten', async () => {
    await asUser(db, TEACHER, async () => {
      await db.query(
        `insert into public.lesson_docs (date, group_id, lesson_id) values ('2026-01-06', '${GROUP_A}', 'A1.1.Di')`,
      );
      await db.query(
        `insert into public.errors (student_id, error, category) values ('${STUDENT_A}', 'z', 'Wortschatz')`,
      );
      await db.query(`update public.students set skill_speaking = 3 where id = '${STUDENT_A}'`);
    });
    const s = await db.query<{ skill_speaking: number }>(
      `select skill_speaking from public.students where id = '${STUDENT_A}'`,
    );
    expect(s.rows[0]?.skill_speaking).toBe(3);
    const d = await db.query<{ created_by: string }>(
      `select created_by from public.lesson_docs where lesson_id = 'A1.1.Di'`,
    );
    expect(d.rows[0]?.created_by).toBe(TEACHER);
  });

  it('Lehrkraft kann Schüler nicht in eine fremde Gruppe verschieben, fremde Schüler nicht ändern', async () => {
    await expect(
      asUser(db, TEACHER, () =>
        db.query(`update public.students set group_id = '${GROUP_B}' where id = '${STUDENT_A}'`),
      ),
    ).rejects.toThrow(/row-level security/);
    const r = await asUser(db, TEACHER, () =>
      db.query(`update public.students set name = 'x' where id = '${STUDENT_B}'`),
    );
    expect(r.affectedRows).toBe(0);
  });

  it('Lehrkraft kann nichts löschen, keine Gruppen anlegen und keine Rollen oder Einstellungen ändern', async () => {
    const del = await asUser(db, TEACHER, () =>
      db.query(`delete from public.students where id = '${STUDENT_A}'`),
    );
    expect(del.affectedRows).toBe(0);
    await expect(
      asUser(db, TEACHER, () =>
        db.query(`insert into public.groups (name, level) values ('x', 'A1')`),
      ),
    ).rejects.toThrow(/row-level security/);
    const role = await asUser(db, TEACHER, () =>
      db.query(`update public.profiles set role = 'admin' where id = '${TEACHER}'`),
    );
    expect(role.affectedRows).toBe(0);
    const set = await asUser(db, TEACHER, () =>
      db.query(`update public.app_settings set value = '"all"'`),
    );
    expect(set.affectedRows).toBe(0);
  });
});

describe('Einstellung „alle Gruppen“', () => {
  it('Team sieht alle Gruppen und Schüler, solange die Einstellung aktiv ist', async () => {
    await setVisibility('all');
    expect(await ids(TEACHER, 'groups')).toEqual([GROUP_A, GROUP_B]);
    expect(await ids(NATIVE, 'students')).toEqual([STUDENT_A, STUDENT_B, STUDENT_NONE]);
    expect(await count(TEACHER, `from public.errors where student_id = '${STUDENT_B}'`)).toBe(1);
    await setVisibility('own_groups');
    expect(await ids(TEACHER, 'groups')).toEqual([GROUP_A]);
  });
});

describe('Checklisten, Material, Entscheidungen', () => {
  it('jede Person sieht und ändert nur die eigenen Häkchen', async () => {
    await asUser(db, TEACHER, () =>
      db.query(`insert into public.checklist_progress (item_id) values ('A1.1.Mo#0')`),
    );
    await asUser(db, NATIVE, () =>
      db.query(`insert into public.checklist_progress (item_id) values ('A1.1.Fr#0')`),
    );
    expect(await count(TEACHER, 'from public.checklist_progress')).toBe(1);
    expect(await count(ADMIN, 'from public.checklist_progress')).toBe(2);
    await expect(
      asUser(db, TEACHER, () =>
        db.query(
          `insert into public.checklist_progress (user_id, item_id) values ('${NATIVE}', 'x')`,
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it('Material-Notizen sind für das ganze Team', async () => {
    await asUser(db, TEACHER, () =>
      db.query(
        `insert into public.material_notes (lesson_id, note) values ('A1.1.Mo', 'Lektion 1')`,
      ),
    );
    expect(await count(NATIVE, 'from public.material_notes')).toBe(1);
  });

  it('die 21 offenen Entscheidungen aus legacy sind angelegt; nur admin entscheidet', async () => {
    expect(await count(TEACHER, `from public.decisions where status = 'offen'`)).toBe(21);
    const t = await asUser(db, TEACHER, () =>
      db.query(`update public.decisions set status = 'entschieden' where id = 'dec#0'`),
    );
    expect(t.affectedRows).toBe(0);
    const a = await asUser(db, ADMIN, () =>
      db.query(
        `update public.decisions set status = 'entschieden', decision = 'Test', decided_at = '2026-01-05' where id = 'dec#4'`,
      ),
    );
    expect(a.affectedRows).toBe(1);
  });

  it('Migration der Entscheidungen entspricht content/decisions.json', () => {
    expect(readFileSync(DECISIONS_MIGRATION, 'utf8')).toBe(decisionsSql());
  });
});
