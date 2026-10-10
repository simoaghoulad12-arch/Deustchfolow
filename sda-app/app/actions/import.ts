'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { getRepo } from '@/lib/data/repo';
import { getStore } from '@/lib/data/store';
import type { LevelKey } from '@/content/types';
import { planLegacyImport, planSummary } from '@/lib/legacyImport';

export interface ImportState {
  status: 'idle' | 'preview' | 'done' | 'error';
  message: string;
  warnings: string[];
}

/**
 * Daten aus der alten Version übernehmen. Erst „Prüfen“ (zeigt, was übernommen wird), dann „Importieren“.
 * Nur die Leitung. Neue IDs werden vergeben; Verweise (Schüler in Fehlern, Anwesenheit) werden übertragen.
 */
export async function importLegacy(_prev: ImportState, fd: FormData): Promise<ImportState> {
  const admin = await requireAdmin();
  const text = String(fd.get('export') ?? '');
  if (text.length > 5_000_000)
    return { status: 'error', message: 'Der Text ist zu groß (max. 5 MB).', warnings: [] };
  let plan;
  try {
    plan = planLegacyImport(text);
  } catch (e) {
    return {
      status: 'error',
      message: e instanceof Error ? e.message : 'Ungültiger Export.',
      warnings: [],
    };
  }
  if (fd.get('mode') !== 'import') {
    return {
      status: 'preview',
      message: `Wird übernommen: ${planSummary(plan)}.`,
      warnings: plan.warnings,
    };
  }

  const repo = getRepo();
  try {
    const groups = await repo.insert(
      'groups',
      plan.groups.map((g) => ({ name: g.name, level: g.key, start_date: null })),
    );
    const groupOf = new Map<LevelKey, string>(groups.map((g) => [g.level, g.id]));
    const students = await repo.insert(
      'students',
      plan.students.map((x) => ({ ...x.row, group_id: groupOf.get(x.level) ?? null }) as never),
    );
    const idOf = new Map<string, string>(
      plan.students.map((x, i) => [x.legacyId, students[i]!.id]),
    );
    const map = (ids: string[]) => ids.map((x) => idOf.get(x)).filter((x): x is string => !!x);
    await repo.insert(
      'lesson_docs',
      plan.docs.map(
        (d) =>
          ({
            ...d.row,
            group_id: groupOf.get(d.level)!,
            present: map(d.present),
            absent: map(d.absent),
            created_by: admin.id,
          }) as never,
      ),
    );
    await repo.insert(
      'errors',
      plan.errors.map((e) => ({ ...e.row, student_id: idOf.get(e.legacyStudent)! }) as never),
    );
    await repo.insert(
      'homework',
      plan.homework.map((h) => ({ ...h.row, student_id: idOf.get(h.legacyStudent)! }) as never),
    );
    const store = getStore();
    for (const n of plan.notes) await store.setMaterialNote(n.lessonId, n.note);
  } catch {
    return {
      status: 'error',
      message:
        'Import abgebrochen. Ein Teil kann bereits übernommen sein – bitte unter Student Progress prüfen.',
      warnings: [],
    };
  }
  for (const p of [
    '/',
    '/fortschritt',
    '/dokumentation',
    '/fehler',
    '/hausaufgaben',
    '/materialien',
    '/playbook',
  ])
    revalidatePath(p);
  return { status: 'done', message: `Übernommen: ${planSummary(plan)}.`, warnings: plan.warnings };
}
