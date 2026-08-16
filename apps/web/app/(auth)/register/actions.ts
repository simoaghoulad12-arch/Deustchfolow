'use server';

import { redirect } from 'next/navigation';
import { registerUser } from '@/lib/auth/register';
import { getClientIp } from '@/lib/security/client-ip';

export async function registerAction(formData: FormData): Promise<void> {
  const clientIp = await getClientIp();

  const result = await registerUser(
    {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
      passwordConfirmation: String(formData.get('passwordConfirmation') ?? ''),
    },
    clientIp,
  );

  if (!result.success) {
    redirect(`/register?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/settings');
}
