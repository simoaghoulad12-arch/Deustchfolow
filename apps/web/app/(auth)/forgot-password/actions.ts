'use server';

import { redirect } from 'next/navigation';
import { requestPasswordReset } from '@/lib/auth/password-reset';
import { getClientIp } from '@/lib/security/client-ip';

export async function forgotPasswordAction(formData: FormData): Promise<void> {
  const clientIp = await getClientIp();

  await requestPasswordReset({ email: String(formData.get('email') ?? '') }, clientIp);

  // Always the same redirect, regardless of outcome — never reveal
  // whether the email address exists.
  redirect('/forgot-password?sent=1');
}
