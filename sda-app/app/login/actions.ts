'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabasePublicEnv } from '@/lib/supabase/env';

export interface LoginState {
  status: 'idle' | 'sent' | 'error';
  message: string;
}

/**
 * Magic Link per E-Mail. shouldCreateUser: false – nur eingeladene Personen bekommen einen Link,
 * es gibt keine offene Registrierung. Die Antwort verrät nicht, ob eine Adresse eingeladen ist.
 */
export async function sendMagicLink(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabasePublicEnv())
    return { status: 'error', message: 'Die Anmeldung ist noch nicht eingerichtet.' };
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 'error', message: 'Bitte eine gültige E-Mail-Adresse eingeben.' };
  }
  const origin = headers().get('origin') ?? process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: false, emailRedirectTo: `${origin}/auth/confirm` },
  });
  // Fehler „Nutzer nicht gefunden“ bewusst wie Erfolg behandeln (keine Auskunft über eingeladene Adressen).
  if (error && error.status !== 400 && error.status !== 422) {
    return {
      status: 'error',
      message: 'Der Link konnte gerade nicht gesendet werden. Bitte später erneut versuchen.',
    };
  }
  return {
    status: 'sent',
    message: 'Wenn diese Adresse eingeladen ist, kommt gleich eine E-Mail mit dem Anmeldelink.',
  };
}

export async function signOut() {
  if (supabasePublicEnv()) await createClient().auth.signOut();
  redirect('/login');
}
