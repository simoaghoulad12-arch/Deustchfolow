import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { requireSupabasePublicEnv } from './env';

/**
 * Client mit Service-Role-Schlüssel: umgeht Row Level Security.
 * Nur auf dem Server und nur für Einladungen verwenden – niemals an den Browser geben.
 */
export function createAdminClient() {
  const { url } = requireSupabasePublicEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY fehlt (nur auf dem Server setzen).');
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
