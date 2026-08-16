import type { Metadata } from 'next';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { loginAction } from './actions';

export const metadata: Metadata = { title: 'Anmelden – DeutschFlow' };

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Willkommen zurück</h1>
        <p className="text-sm text-muted-foreground">Melde dich bei deinem DeutschFlow-Konto an.</p>
      </div>

      <form action={loginAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Passwort</Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Passwort vergessen?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
          />
        </div>

        {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}

        <Button type="submit" className="w-full">
          Anmelden
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Noch kein Konto?{' '}
          <Link
            href="/register"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Jetzt registrieren
          </Link>
        </p>
      </form>
    </div>
  );
}
