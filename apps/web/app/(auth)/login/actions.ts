'use server';

import { redirect } from 'next/navigation';
import { loginUser } from '@/lib/auth/login';
import { getClientIp } from '@/lib/security/client-ip';

export async function loginAction(formData: FormData): Promise<void> {
  const clientIp = await getClientIp();

  const result = await loginUser(
    {
      email: String(formData.get('email') ?? ''),
      password: String(formData.get('password') ?? ''),
    },
    clientIp,
  );

  if (!result.success) {
    redirect(`/login?error=${encodeURIComponent(result.error)}`);
  }

  redirect('/dashboard');
}
