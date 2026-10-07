import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireSupabasePublicEnv } from './env';

/**
 * Supabase-Client mit der Sitzung der angemeldeten Person (Cookies).
 * Alle Abfragen laufen über Row Level Security.
 */
export function createClient() {
  const { url, anonKey } = requireSupabasePublicEnv();
  const cookieStore = cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          // In Server Components dürfen keine Cookies gesetzt werden; die Middleware erneuert die Sitzung.
        }
      },
    },
  });
}
