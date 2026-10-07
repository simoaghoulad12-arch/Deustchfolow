'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { findLesson } from '@/content';
import { requireAdmin, requireMember } from '@/lib/auth';
import { AccessError, getRepo } from '@/lib/data/repo';
import { getStore } from '@/lib/data/store';
import {
  ERROR_STATUSES,
  HOMEWORK_STATUSES,
  type ErrorStatus,
  type HomeworkStatus,
} from '@/lib/data/types';
import { todayISO } from '@/lib/school';
import {
  parseDecision,
  parseDoc,
  parseError,
  parseGroup,
  parseHomework,
  parseStudent,
  parseThresholds,
} from '@/lib/validation';

export interface FormState {
  error: string;
}

const id = (fd: FormData) => String(fd.get('id') ?? '');

/** Datenbankfehler als verständliche Meldung; Erfolg leitet weiter (redirect außerhalb von try). */
async function attempt(fn: () => Promise<void>): Promise<FormState | null> {
  try {
    await fn();
    return null;
  } catch (e) {
    if (e instanceof AccessError) return { error: 'Dafür fehlt die Berechtigung.' };
    return { error: 'Speichern fehlgeschlagen. Bitte erneut versuchen.' };
  }
}

function done(paths: string[], to: string): never {
  for (const p of paths) revalidatePath(p);
  redirect(to);
}

// ------------------------------------------------------------------ Gruppen (nur Leitung)

export async function saveGroup(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const p = parseGroup(fd);
  if (!p.ok) return { error: p.error };
  const repo = getRepo();
  const failed = await attempt(async () => {
    if (id(fd)) await repo.update('groups', id(fd), p.data);
    else await repo.insert('groups', [p.data]);
  });
  if (failed) return failed;
  done(['/fortschritt', '/playbook'], '/fortschritt/gruppen');
}

/** Team-Mitglieder einer Gruppe (Grundlage für „nur eigene Gruppen“). */
export async function saveGroupStaff(fd: FormData): Promise<void> {
  await requireAdmin();
  const groupId = id(fd);
  const wanted = new Set(fd.getAll('staff').map(String));
  const repo = getRepo();
  const current = await repo.list('group_staff', { eq: { group_id: groupId } });
  for (const row of current) if (!wanted.has(row.profile_id)) await repo.remove('group_staff', row);
  const have = new Set(current.map((r) => r.profile_id));
  const add = [...wanted]
    .filter((p) => !have.has(p))
    .map((profile_id) => ({ group_id: groupId, profile_id }));
  await repo.insert('group_staff', add);
  revalidatePath(`/fortschritt/gruppen/${groupId}`);
}

export async function deleteGroup(fd: FormData): Promise<void> {
  await requireAdmin();
  await getRepo().remove('groups', { id: id(fd) });
  done(['/fortschritt', '/playbook'], '/fortschritt/gruppen');
}

// ------------------------------------------------------------------ Schüler

export async function saveStudent(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireMember();
  const p = parseStudent(fd);
  if (!p.ok) return { error: p.error };
  const repo = getRepo();
  let target = '/fortschritt';
  const failed = await attempt(async () => {
    if (id(fd)) {
      await repo.update('students', id(fd), {
        ...p.data,
        updated_at: new Date().toISOString(),
      } as never);
      target = `/fortschritt/${id(fd)}`;
    } else {
      const [row] = await repo.insert('students', [p.data]);
      if (row) target = `/fortschritt/${row.id}`;
    }
  });
  if (failed) return failed;
  done(['/fortschritt', '/playbook', '/'], target);
}

export async function deleteStudent(fd: FormData): Promise<void> {
  await requireAdmin();
  await getRepo().remove('students', { id: id(fd) });
  done(['/fortschritt', '/fehler', '/hausaufgaben', '/'], '/fortschritt');
}

// ------------------------------------------------------------------ Fehler

export async function saveError(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireMember();
  const p = parseError(fd, todayISO());
  if (!p.ok) return { error: p.error };
  const repo = getRepo();
  const failed = await attempt(async () => {
    if (id(fd)) await repo.update('errors', id(fd), p.data);
    else await repo.insert('errors', [p.data]);
  });
  if (failed) return failed;
  done(['/fehler', '/fortschritt', '/playbook', '/'], String(fd.get('back') || '/fehler'));
}

export async function setErrorStatus(fd: FormData): Promise<void> {
  await requireMember();
  const status = String(fd.get('status')) as ErrorStatus;
  if (!ERROR_STATUSES.includes(status)) return;
  await getRepo().update('errors', id(fd), { status });
  revalidatePath('/fehler');
  revalidatePath('/fortschritt');
}

export async function deleteError(fd: FormData): Promise<void> {
  await requireAdmin();
  await getRepo().remove('errors', { id: id(fd) });
  done(['/fehler', '/fortschritt'], '/fehler');
}

// ------------------------------------------------------------------ Hausaufgaben

export async function saveHomework(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireMember();
  const p = parseHomework(fd);
  if (!p.ok) return { error: p.error };
  const { target, ...fields } = p.data;
  const repo = getRepo();
  const failed = await attempt(async () => {
    if (id(fd)) {
      if (!('student' in target)) throw new Error('Beim Bearbeiten nur ein Schüler');
      await repo.update('homework', id(fd), { ...fields, student_id: target.student });
    } else if ('group' in target) {
      const students = await repo.list('students', { eq: { group_id: target.group } });
      await repo.insert(
        'homework',
        students.map((s) => ({ ...fields, student_id: s.id })),
      );
    } else {
      await repo.insert('homework', [{ ...fields, student_id: target.student }]);
    }
  });
  if (failed) return failed;
  done(['/hausaufgaben', '/fortschritt', '/playbook', '/'], '/hausaufgaben');
}

export async function setHomeworkStatus(fd: FormData): Promise<void> {
  await requireMember();
  const status = String(fd.get('status')) as HomeworkStatus;
  if (!HOMEWORK_STATUSES.includes(status)) return;
  await getRepo().update('homework', id(fd), { status });
  revalidatePath('/hausaufgaben');
  revalidatePath('/fortschritt');
}

export async function deleteHomework(fd: FormData): Promise<void> {
  await requireAdmin();
  await getRepo().remove('homework', { id: id(fd) });
  done(['/hausaufgaben', '/fortschritt'], '/hausaufgaben');
}

// ------------------------------------------------------------------ Dokumentation

/**
 * Stunde dokumentieren (legacy: saveDoc). Abwesend = Schüler der Gruppe, die nicht angehakt sind.
 * Optional: Hausaufgabe für alle Anwesenden anlegen; Material wird als Lehrbuch-Notiz der Stunde übernommen.
 */
export async function saveDoc(_prev: FormState, fd: FormData): Promise<FormState> {
  const member = await requireMember();
  const p = parseDoc(fd, todayISO());
  if (!p.ok) return { error: p.error };
  const { homeworkForPresent, present, ...fields } = p.data;
  const repo = getRepo();
  const failed = await attempt(async () => {
    const students = await repo.list('students', { eq: { group_id: fields.group_id } });
    const ids = new Set(students.map((s) => s.id));
    const pres = present.filter((x) => ids.has(x));
    const row = {
      ...fields,
      present: pres,
      absent: students.map((s) => s.id).filter((x) => !pres.includes(x)),
    };
    if (id(fd)) await repo.update('lesson_docs', id(fd), row);
    else
      await repo.insert('lesson_docs', [{ ...row, teacher_id: member.id, created_by: member.id }]);
    if (!id(fd) && homeworkForPresent && fields.homework) {
      const goal = findLesson(fields.lesson_id)?.title ?? '';
      await repo.insert(
        'homework',
        pres.map((student_id) => ({
          student_id,
          task: fields.homework,
          goal,
          status: 'Offen' as const,
        })),
      );
    }
    const store = getStore();
    if (fields.material && fields.material !== (await store.materialNote(fields.lesson_id))) {
      await store.setMaterialNote(fields.lesson_id, fields.material);
    }
  });
  if (failed) return failed;
  done(['/dokumentation', '/fortschritt', '/playbook', '/hausaufgaben', '/'], '/dokumentation');
}

export async function deleteDoc(fd: FormData): Promise<void> {
  await requireAdmin();
  await getRepo().remove('lesson_docs', { id: id(fd) });
  done(['/dokumentation', '/fortschritt', '/playbook'], '/dokumentation');
}

// ------------------------------------------------------------------ Offene Entscheidungen und Qualität (nur Leitung)

export async function saveDecision(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = parseDecision(fd, todayISO());
  if (!p.ok) return { error: p.error };
  const failed = await attempt(() =>
    getRepo().update('decisions', id(fd), {
      ...p.data,
      decided_by: p.data.status === 'entschieden' ? admin.id : null,
    }),
  );
  if (failed) return failed;
  done(['/entscheidungen', '/'], `/entscheidungen#${encodeURIComponent(id(fd))}`);
}

export async function saveThresholds(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const p = parseThresholds(fd);
  if (!p.ok) return { error: p.error };
  const failed = await attempt(() => getStore().setSetting('qc_thresholds', p.data, admin.id));
  if (failed) return failed;
  done(['/qualitaet'], '/qualitaet');
}
