/** Supabase-Konfiguration aus Umgebungsvariablen (siehe .env.example). Keine Schlüssel im Code. */
export interface SupabasePublicEnv {
  url: string;
  anonKey: string;
}

export function supabasePublicEnv(): SupabasePublicEnv | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return url && anonKey ? { url, anonKey } : null;
}

export function requireSupabasePublicEnv(): SupabasePublicEnv {
  const env = supabasePublicEnv();
  if (!env) {
    throw new Error(
      'Supabase ist nicht konfiguriert: NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_ANON_KEY setzen (.env.example).',
    );
  }
  return env;
}
