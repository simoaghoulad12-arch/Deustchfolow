import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { supabasePublicEnv } from './lib/supabase/env';

/** Seiten, die ohne Anmeldung erreichbar sind. */
const PUBLIC_PATHS = ['/login', '/auth/'];

/**
 * Erneuert die Supabase-Sitzung bei jeder Anfrage und schickt nicht angemeldete Personen zum Login.
 * Ob jemand eingeladen ist (Profil vorhanden), prüfen die Seiten selbst und die Datenbank (RLS).
 */
export async function middleware(request: NextRequest) {
  const isPublic = PUBLIC_PATHS.some((p) => request.nextUrl.pathname.startsWith(p));
  const env = supabasePublicEnv();
  if (!env) {
    // Ohne Konfiguration nur die Login-Seite (zeigt einen Hinweis).
    return isPublic ? NextResponse.next() : NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|svg|ico|webmanifest)$).*)'],
};
