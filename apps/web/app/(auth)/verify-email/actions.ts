'use server';

import { redirect } from 'next/navigation';
import { verifyEmail } from '@/lib/auth/verify-email';

export async function verifyEmailAction(formData: FormData): Promise<void> {
  const token = String(formData.get('token') ?? '');

  const result = await verifyEmail(token);

  if (!result.success) {
    redirect(`/verify-email?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/settings?verified=1');
}
