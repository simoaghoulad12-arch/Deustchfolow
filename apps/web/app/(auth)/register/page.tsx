import type { Metadata } from 'next';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { registerAction } from './actions';

export const metadata: Metadata = { title: 'Registrieren – DeutschFlow' };

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Konto erstellen</h1>
        <p className="text-sm text-muted-foreground">Starte kostenlos mit DeutschFlow.</p>
      </div>

      <form action={registerAction} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">E-Mail-Adresse</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Passwort</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
          <p className="text-xs text-muted-foreground">
            Mindestens 10 Zeichen, mit Buchstaben und Zahlen.
          </p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="passwordConfirmation">Passwort bestätigen</Label>
          <Input
            id="passwordConfirmation"
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            minLength={10}
            required
          />
        </div>

        {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}

        <Button type="submit" className="w-full">
          Konto erstellen
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Schon ein Konto?{' '}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Anmelden
          </Link>
        </p>
      </form>
    </div>
  );
}
