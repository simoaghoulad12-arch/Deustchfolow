'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { findLesson } from '@/content';
import { requireAdmin, requireMember } from '@/lib/auth';
import { getStore } from '@/lib/data/store';
import { DAYS, isPerson, isTeacherDuty, normalizeDayRoles } from '@/lib/dayRoles';
import { PERSON_COOKIE } from '@/lib/team';

const itemIdsOf = (lessonId: string) =>
  new Set(findLesson(lessonId)?.groups.flatMap((g) => g.items.map((x) => x.id)) ?? []);

/** Aufgaben einer Stunde abhaken oder zurücknehmen (nur IDs, die zu dieser Stunde gehören). */
export async function setItemsDone(
  lessonId: string,
  itemIds: string[],
  done: boolean,
): Promise<void> {
  const member = await requireMember();
  const valid = itemIdsOf(lessonId);
  const ids = itemIds.filter((id) => valid.has(id));
  if (!ids.length) return;
  await getStore().setDone(member.id, ids, done);
  revalidatePath('/curriculum');
}

export async function resetLesson(lessonId: string): Promise<void> {
  const member = await requireMember();
  await getStore().setDone(member.id, [...itemIdsOf(lessonId)], false);
  revalidatePath(`/stunde/${lessonId}`);
  revalidatePath('/curriculum');
}

/** Feld „Im Lehrbuch (Seite / Lektion)“ einer Stunde, für das ganze Team. */
export async function saveMaterialNote(lessonId: string, note: string): Promise<{ ok: boolean }> {
  await requireMember();
  if (!findLesson(lessonId)) return { ok: false };
  await getStore().setMaterialNote(lessonId, note.trim().slice(0, 200));
  revalidatePath('/materialien');
  return { ok: true };
}

/** Eigene Rolle im Team-Plan auf diesem Gerät (Lehrkraft 1/2, Muttersprachler/in, alle Aufgaben). */
export async function setPerson(formData: FormData): Promise<void> {
  await requireMember();
  const person = formData.get('person');
  if (!isPerson(person)) return;
  cookies().set(PERSON_COOKIE, person, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' });
  revalidatePath('/', 'layout');
}

/** Rollen pro Wochentag (PROPOSAL) – nur die Leitung. */
export async function saveDayRoles(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const raw: Record<string, { L1?: unknown; L2?: unknown }> = {};
  for (const d of DAYS) {
    const l1 = formData.get(`${d}.L1`);
    const l2 = formData.get(`${d}.L2`);
    raw[d] = { L1: isTeacherDuty(l1) ? l1 : undefined, L2: isTeacherDuty(l2) ? l2 : undefined };
  }
  await getStore().setSetting('day_roles', normalizeDayRoles(raw), admin.id);
  revalidatePath('/', 'layout');
}
