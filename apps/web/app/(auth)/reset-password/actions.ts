'use server';

import { redirect } from 'next/navigation';
import { resetPassword } from '@/lib/auth/password-reset';

export async function resetPasswordAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');

  const result = await resetPassword({
    token,
    password: String(formData.get('password') ?? ''),
    passwordConfirmation: String(formData.get('passwordConfirmation') ?? ''),
  });

  if (!result.success) {
    redirect(`/reset-password?token=${encodeURIComponent(token)}&error=${encodeURIComponent(result.error)}`);
  }

  redirect('/login?reset=1');
}
