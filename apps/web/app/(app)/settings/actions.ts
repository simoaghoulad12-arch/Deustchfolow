'use server';

import { redirect } from 'next/navigation';
import type { CEFRLevel } from '@deutschflow/types';
import { getSession, destroySession } from '@/lib/auth/session';
import { updateMyProfile } from '@/lib/api/profile';
import { updateMyLearningProfile } from '@/lib/api/learning-profile';
import { deleteAccountForUser } from '@/lib/auth/delete-account';

function emptyToNull(value: FormDataEntryValue | null): string | null {
  const str = String(value ?? '').trim();
  return str.length > 0 ? str : null;
}

export async function updateProfileAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  await updateMyProfile(session, {
    displayName: emptyToNull(formData.get('displayName')),
    avatarUrl: emptyToNull(formData.get('avatarUrl')),
  });

  redirect('/settings?updated=profile');
}

export async function updateLearningProfileAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  await updateMyLearningProfile(session, {
    nativeLanguage: emptyToNull(formData.get('nativeLanguage')),
    explanationLanguage: emptyToNull(formData.get('explanationLanguage')),
    timezone: emptyToNull(formData.get('timezone')),
    learningGoal: emptyToNull(formData.get('learningGoal')),
    currentLevel: emptyToNull(formData.get('currentLevel')) as CEFRLevel | null,
    targetLevel: emptyToNull(formData.get('targetLevel')) as CEFRLevel | null,
  });

  redirect('/settings?updated=learning');
}

export async function deleteAccountAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect('/login');

  const result = await deleteAccountForUser(session.id, String(formData.get('password') ?? ''));

  if (!result.success) {
    redirect(`/settings?deleteError=${encodeURIComponent(result.error)}`);
  }

  await destroySession();
  redirect('/');
}
