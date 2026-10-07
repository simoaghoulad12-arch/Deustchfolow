import 'server-only';
import { devMember } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

/**
 * Datenzugriff für Checklisten-Häkchen, Lehrbuch-Notizen und Einstellungen.
 * Normalfall: Supabase mit der Sitzung der angemeldeten Person (Row Level Security).
 * Nur mit Testzugang in der Entwicklung (devMember): Speicher im Arbeitsspeicher, ohne Datenbank.
 */
export interface DataStore {
  doneItems(userId: string): Promise<Set<string>>;
  setDone(userId: string, itemIds: string[], done: boolean): Promise<void>;
  materialNote(lessonId: string): Promise<string>;
  materialNotes(): Promise<{ lessonId: string; note: string }[]>;
  setMaterialNote(lessonId: string, note: string): Promise<void>;
  setting(key: string): Promise<unknown>;
  setSetting(key: string, value: unknown, userId: string): Promise<void>;
}

function supabaseStore(): DataStore {
  const db = createClient();
  const fail = (what: string, error: { message: string } | null) => {
    if (error) throw new Error(`${what} fehlgeschlagen`);
  };
  return {
    async doneItems() {
      // RLS liefert nur die eigenen Häkchen (Admin: alle) – darum zusätzlich nach Person filtern.
      const { data: auth } = await db.auth.getUser();
      const { data, error } = await db
        .from('checklist_progress')
        .select('item_id')
        .eq('user_id', auth.user?.id ?? '');
      fail('Häkchen laden', error);
      return new Set((data ?? []).map((r: { item_id: string }) => r.item_id));
    },
    async setDone(_userId, itemIds, done) {
      if (!itemIds.length) return;
      if (done) {
        const { error } = await db.from('checklist_progress').upsert(
          itemIds.map((item_id) => ({ item_id })),
          { onConflict: 'user_id,item_id', ignoreDuplicates: true },
        );
        fail('Häkchen speichern', error);
      } else {
        const { data: auth } = await db.auth.getUser();
        const { error } = await db
          .from('checklist_progress')
          .delete()
          .eq('user_id', auth.user?.id ?? '')
          .in('item_id', itemIds);
        fail('Häkchen entfernen', error);
      }
    },
    async materialNote(lessonId) {
      const { data, error } = await db
        .from('material_notes')
        .select('note')
        .eq('lesson_id', lessonId)
        .maybeSingle();
      fail('Notiz laden', error);
      return (data as { note: string } | null)?.note ?? '';
    },
    async materialNotes() {
      const { data, error } = await db
        .from('material_notes')
        .select('lesson_id, note')
        .neq('note', '');
      fail('Notizen laden', error);
      return (data ?? []).map((r: { lesson_id: string; note: string }) => ({
        lessonId: r.lesson_id,
        note: r.note,
      }));
    },
    async setMaterialNote(lessonId, note) {
      const { error } = await db
        .from('material_notes')
        .upsert(
          { lesson_id: lessonId, note, updated_at: new Date().toISOString() },
          { onConflict: 'lesson_id' },
        );
      fail('Notiz speichern', error);
    },
    async setting(key) {
      const { data, error } = await db
        .from('app_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      fail('Einstellung laden', error);
      return (data as { value: unknown } | null)?.value ?? null;
    },
    async setSetting(key, value, userId) {
      const { error } = await db
        .from('app_settings')
        .upsert(
          { key, value, updated_at: new Date().toISOString(), updated_by: userId },
          { onConflict: 'key' },
        );
      fail('Einstellung speichern', error);
    },
  };
}

interface Memory {
  done: Map<string, Set<string>>;
  notes: Map<string, string>;
  settings: Map<string, unknown>;
}

/** Nur Entwicklung/Tests: Daten leben bis zum Neustart des Servers. */
function memoryStore(): DataStore {
  const g = globalThis as unknown as { __sdaMemory?: Memory };
  const m = (g.__sdaMemory ??= { done: new Map(), notes: new Map(), settings: new Map() });
  const userSet = (u: string) => {
    let s = m.done.get(u);
    if (!s) m.done.set(u, (s = new Set()));
    return s;
  };
  return {
    doneItems: async (u) => new Set(userSet(u)),
    setDone: async (u, ids, done) => {
      const s = userSet(u);
      for (const id of ids) done ? s.add(id) : s.delete(id);
    },
    materialNote: async (id) => m.notes.get(id) ?? '',
    materialNotes: async () =>
      [...m.notes].filter(([, n]) => n).map(([lessonId, note]) => ({ lessonId, note })),
    setMaterialNote: async (id, note) => void m.notes.set(id, note),
    setting: async (k) => m.settings.get(k) ?? null,
    setSetting: async (k, v) => void m.settings.set(k, v),
  };
}

export function getStore(): DataStore {
  return devMember() ? memoryStore() : supabaseStore();
}
