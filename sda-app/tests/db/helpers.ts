/**
 * Test-Datenbank: echtes Postgres (PGlite, läuft im Prozess, auch in CI ohne Datenbank-Dienst)
 * mit Supabase-Nachbildung und allen Migrationen aus supabase/migrations.
 */
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { PGlite } from '@electric-sql/pglite';

const MIGRATIONS = path.join(__dirname, '..', '..', 'supabase', 'migrations');

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite();
  await db.exec(readFileSync(path.join(__dirname, 'supabase-stub.sql'), 'utf8'));
  for (const file of readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()) {
    await db.exec(readFileSync(path.join(MIGRATIONS, file), 'utf8'));
  }
  return db;
}

/** Führt fn als angemeldete Person (Rolle authenticated) aus – so wie Supabase mit einem JWT. */
export async function asUser<T>(
  db: PGlite,
  userId: string | null,
  fn: () => Promise<T>,
): Promise<T> {
  await db.exec(userId ? 'set role authenticated' : 'set role anon');
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [userId ?? '']);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false)`);
  }
}

/** Legt einen eingeladenen Nutzer an (auth.users + profiles), wie es die Admin-Seite tut. */
export async function addMember(
  db: PGlite,
  id: string,
  role: 'admin' | 'teacher' | 'native' | null,
) {
  await db.query('insert into auth.users (id, email) values ($1, $2)', [
    id,
    `${id.slice(-4)}@test.invalid`,
  ]);
  if (role) {
    await db.query(
      'insert into public.profiles (id, email, full_name, role) values ($1, $2, $3, $4)',
      [id, `${id.slice(-4)}@test.invalid`, `Test ${role}`, role],
    );
  }
}
