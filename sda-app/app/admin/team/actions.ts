'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { requireAdmin } from '@/lib/auth';
import { isAppRole, isGroupVisibility, parseInvite } from '@/lib/roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export interface ActionState {
  status: 'idle' | 'ok' | 'error';
  message: string;
}

/** Person einladen: Supabase sendet die Einladungs-E-Mail, danach wird das Profil mit Rolle angelegt. */
export async function inviteMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireAdmin();
  const input = parseInvite({
    email: formData.get('email'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
  });
  if ('error' in input) return { status: 'error', message: input.error };

  const admin = createAdminClient();
  const origin = headers().get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { data, error } = await admin.auth.admin.inviteUserByEmail(input.email, {
    redirectTo: `${origin}/auth/confirm`,
    data: { full_name: input.fullName },
  });
  if (error || !data.user) {
    const exists = error?.status === 422 || /already/i.test(error?.message ?? '');
    return {
      status: 'error',
      message: exists
        ? 'Diese Adresse ist bereits registriert.'
        : 'Einladung fehlgeschlagen. Bitte später erneut versuchen.',
    };
  }
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({ id: data.user.id, email: input.email, full_name: input.fullName, role: input.role });
  if (profileError)
    return {
      status: 'error',
      message: 'Einladung gesendet, aber das Profil konnte nicht angelegt werden.',
    };

  revalidatePath('/admin/team');
  return { status: 'ok', message: `Einladung an ${input.email} gesendet.` };
}

/** Rolle ändern. Läuft mit der Sitzung des Admins, die Datenbank prüft zusätzlich per RLS. */
export async function changeRole(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const id = String(formData.get('id') ?? '');
  const role = formData.get('role');
  // Eigene Rolle nicht ändern, damit sich die Leitung nicht versehentlich aussperrt.
  if (!id || id === me.id || !isAppRole(role)) return;
  await createClient().from('profiles').update({ role }).eq('id', id);
  revalidatePath('/admin/team');
}

/** OFFENE ENTSCHEIDUNG umschalten: Sieht das Team alle Gruppen oder nur die eigenen? */
export async function setGroupVisibility(formData: FormData): Promise<void> {
  const me = await requireAdmin();
  const value = formData.get('visibility');
  if (!isGroupVisibility(value)) return;
  await createClient()
    .from('app_settings')
    .update({ value, updated_at: new Date().toISOString(), updated_by: me.id })
    .eq('key', 'staff_group_visibility');
  revalidatePath('/admin/team');
}
