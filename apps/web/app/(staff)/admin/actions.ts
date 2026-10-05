'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth/session';
import { liveSend, type LiveResult } from '@/lib/api/live';

const RESOURCE = /^[a-z-]{2,40}$/;

async function user() {
  const session = await getSession();
  if (!session) redirect('/login');
  return session;
}

export async function saveContentAction(resource: string, id: string | null, data: Record<string, unknown>): Promise<LiveResult<Record<string, unknown>>> {
  if (!RESOURCE.test(resource)) return { ok: false, message: 'Unknown content type.', status: 400 };
  const result = id
    ? await liveSend<Record<string, unknown>>(await user(), 'PATCH', `/admin/content/${resource}/${encodeURIComponent(id)}`, data)
    : await liveSend<Record<string, unknown>>(await user(), 'POST', `/admin/content/${resource}`, data);
  if (result.ok) revalidatePath(`/admin/${resource}`);
  return result;
}

export async function deleteContentAction(resource: string, id: string): Promise<LiveResult<unknown>> {
  if (!RESOURCE.test(resource)) return { ok: false, message: 'Unknown content type.', status: 400 };
  const result = await liveSend(await user(), 'DELETE', `/admin/content/${resource}/${encodeURIComponent(id)}`);
  if (result.ok) revalidatePath(`/admin/${resource}`);
  return result;
}

export async function setRoleAction(userId: string, role: string): Promise<LiveResult<unknown>> {
  const result = await liveSend(await user(), 'PATCH', `/admin/users/${encodeURIComponent(userId)}/role`, { role });
  if (result.ok) revalidatePath('/admin/users');
  return result;
}
