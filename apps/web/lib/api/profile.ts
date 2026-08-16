import 'server-only';
import { callNestApi } from './nest-client';
import type { SessionUser } from '../auth/session';

export interface UserProfileData {
  displayName: string | null;
  avatarUrl: string | null;
}

export async function getMyProfile(user: SessionUser): Promise<UserProfileData | null> {
  const response = await callNestApi('/users/me/profile', user);
  if (!response.ok) return null;
  return response.json();
}

export async function updateMyProfile(
  user: SessionUser,
  data: Partial<UserProfileData>,
): Promise<{ success: boolean }> {
  const response = await callNestApi('/users/me/profile', user, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
  return { success: response.ok };
}
