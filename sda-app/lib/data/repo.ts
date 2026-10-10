import 'server-only';
import { devMember } from '@/lib/auth';
import { content } from '@/content';
import { createClient } from '@/lib/supabase/server';
import type { TableName, Tables } from './types';

/**
 * Einfacher Tabellenzugriff. In Supabase gelten alle Zugriffsregeln (RLS) der angemeldeten Person;
 * eine verweigerte Änderung (0 Zeilen) wird als Fehler gemeldet.
 * Nur mit Testzugang in der Entwicklung: Tabellen im Arbeitsspeicher, ohne Datenbank.
 */
export interface ListOptions {
  eq?: Record<string, unknown>;
  in?: [string, unknown[]];
  order?: { column: string; ascending?: boolean };
}

export interface Repo {
  list<T extends TableName>(table: T, opts?: ListOptions): Promise<Tables[T][]>;
  get<T extends TableName>(table: T, id: string): Promise<Tables[T] | null>;
  insert<T extends TableName>(table: T, rows: Partial<Tables[T]>[]): Promise<Tables[T][]>;
  update<T extends TableName>(table: T, id: string, patch: Partial<Tables[T]>): Promise<void>;
  remove<T extends TableName>(table: T, match: Partial<Tables[T]>): Promise<void>;
}

export class AccessError extends Error {
  constructor(what: string) {
    super(`${what}: keine Berechtigung oder nicht gefunden`);
  }
}

function supabaseRepo(): Repo {
  const db = createClient();
  const check = (what: string, error: { message: string } | null) => {
    if (error) throw new Error(`${what} fehlgeschlagen`);
  };
  return {
    async list(table, opts = {}) {
      let q = db.from(table).select('*');
      for (const [k, v] of Object.entries(opts.eq ?? {})) q = q.eq(k, v as string);
      if (opts.in) q = q.in(opts.in[0], opts.in[1] as string[]);
      if (opts.order) q = q.order(opts.order.column, { ascending: opts.order.ascending ?? true });
      const { data, error } = await q;
      check(`${table} laden`, error);
      return (data ?? []) as never[];
    },
    async get(table, id) {
      const { data, error } = await db.from(table).select('*').eq('id', id).maybeSingle();
      check(`${table} laden`, error);
      return data as never;
    },
    async insert(table, rows) {
      if (!rows.length) return [];
      const { data, error } = await db
        .from(table)
        .insert(rows as never)
        .select('*');
      if (error?.code === '42501') throw new AccessError(`${table} anlegen`);
      check(`${table} anlegen`, error);
      return (data ?? []) as never[];
    },
    async update(table, id, patch) {
      const { data, error } = await db
        .from(table)
        .update(patch as never)
        .eq('id', id)
        .select('id');
      if (error?.code === '42501') throw new AccessError(`${table} ändern`);
      check(`${table} ändern`, error);
      if (!data?.length) throw new AccessError(`${table} ändern`);
    },
    async remove(table, match) {
      const { data, error } = await db.from(table).delete().match(match).select();
      check(`${table} löschen`, error);
      if (!data?.length) throw new AccessError(`${table} löschen`);
    },
  };
}

type MemoryTables = { [T in TableName]: Tables[T][] };

/** Nur Entwicklung/Tests: Daten leben bis zum Neustart des Servers. */
function memoryRepo(): Repo {
  const g = globalThis as unknown as { __sdaTables?: MemoryTables };
  const dev = devMember();
  const t = (g.__sdaTables ??= {
    groups: [],
    group_staff: [],
    profiles: dev
      ? [{ id: dev.id, email: dev.email, full_name: dev.fullName, role: dev.role }]
      : [],
    students: [],
    lesson_docs: [],
    errors: [],
    homework: [],
    exercise_attempts: [],
    test_results: [],
    submissions: [],
    model_test_results: [],
    exam_registrations: [],
    // wie die Migration 20261007120100_seed_decisions.sql
    decisions: content.decisions.map((d, i) => ({
      id: d.id,
      title: d.text.de,
      title_ar: d.text.ar,
      status: 'offen' as const,
      decision: '',
      decided_at: null,
      decided_by: null,
      sort_order: i,
    })),
  });
  const field = (row: object, col: string) => (row as unknown as Record<string, unknown>)[col];
  const matches = (row: object, match: Record<string, unknown>) =>
    Object.entries(match).every(([k, v]) => field(row, k) === v);
  return {
    async list(table, opts = {}) {
      let rows = t[table].filter((r) => matches(r, opts.eq ?? {})) as Tables[typeof table][];
      if (opts.in) {
        const [col, values] = opts.in;
        rows = rows.filter((r) => values.includes(field(r, col)));
      }
      if (opts.order) {
        const { column, ascending = true } = opts.order;
        rows = [...rows].sort((a, b) => {
          const x = String(field(a, column) ?? '');
          const y = String(field(b, column) ?? '');
          return ascending ? x.localeCompare(y) : y.localeCompare(x);
        });
      }
      return structuredClone(rows);
    },
    async get(table, id) {
      const row = t[table].find((r) => (r as { id?: string }).id === id);
      return row ? structuredClone(row) : null;
    },
    async insert(table, rows) {
      const created = rows.map((r) => ({
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        ...r,
      }));
      (t[table] as object[]).push(...created);
      return structuredClone(created) as never[];
    },
    async update(table, id, patch) {
      const row = t[table].find((r) => (r as { id?: string }).id === id);
      if (!row) throw new AccessError(`${table} ändern`);
      Object.assign(row, patch);
    },
    async remove(table, match) {
      const all = t as Record<string, object[]>;
      const gone = all[table]!.filter((r) => matches(r, match as Record<string, unknown>));
      if (!gone.length) throw new AccessError(`${table} löschen`);
      all[table] = all[table]!.filter((r) => !gone.includes(r));
      // Wie die Fremdschlüssel in der Migration: on delete cascade / set null
      const ids = new Set(gone.map((r) => field(r, 'id')));
      if (table === 'students') {
        for (const t2 of [
          'errors',
          'homework',
          'exercise_attempts',
          'test_results',
          'submissions',
        ]) {
          all[t2] = all[t2]!.filter((r) => !ids.has(field(r, 'student_id')));
        }
      }
      if (table === 'homework')
        all.submissions = all.submissions!.filter((r) => !ids.has(field(r, 'homework_id')));
      if (table === 'groups') {
        all.lesson_docs = all.lesson_docs!.filter((r) => !ids.has(field(r, 'group_id')));
        all.group_staff = all.group_staff!.filter((r) => !ids.has(field(r, 'group_id')));
        for (const st of t.students) if (ids.has(st.group_id)) st.group_id = null;
      }
    },
  };
}

export function getRepo(): Repo {
  return devMember() ? memoryRepo() : supabaseRepo();
}
