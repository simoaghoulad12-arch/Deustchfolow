import { supabasePublicEnv } from '@/lib/supabase/env';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default function LoginPage({ searchParams }: { searchParams: { fehler?: string } }) {
  const configured = supabasePublicEnv() !== null;
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-4">
      <p className="mb-1 text-lg font-bold tracking-wide">SMART DEUTSCH AKADEMIE</p>
      <h1 className="mb-2 text-2xl font-bold">Anmelden</h1>
      <p className="mb-6 text-muted">
        Nur für eingeladene Personen. Du bekommst einen Anmeldelink per E-Mail, ohne Passwort.
      </p>
      {searchParams.fehler && (
        <p role="alert" className="mb-4 text-red">
          {searchParams.fehler === 'zugang'
            ? 'Für dieses Konto gibt es keinen Zugang. Bitte die Leitung um eine Einladung.'
            : 'Der Link ist ungültig oder abgelaufen. Bitte einen neuen anfordern.'}
        </p>
      )}
      {configured ? (
        <LoginForm />
      ) : (
        <p role="alert" className="rounded-xl border border-line bg-panel p-4">
          Die Anmeldung ist noch nicht eingerichtet: Supabase-Zugangsdaten fehlen (siehe{' '}
          <code>.env.example</code>).
        </p>
      )}
    </main>
  );
}
