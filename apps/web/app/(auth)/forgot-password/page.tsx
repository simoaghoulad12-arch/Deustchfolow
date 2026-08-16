import type { Metadata } from 'next';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { forgotPasswordAction } from './actions';

export const metadata: Metadata = { title: 'Passwort vergessen – DeutschFlow' };

export default function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: { sent?: string };
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Passwort vergessen</h1>
        <p className="text-sm text-muted-foreground">
          Gib deine E-Mail-Adresse ein — wir senden dir einen Link zum Zurücksetzen.
        </p>
      </div>

      {searchParams.sent ? (
        <FormMessage type="success">
          Falls ein Konto mit dieser E-Mail-Adresse existiert, haben wir einen Link zum
          Zurücksetzen des Passworts gesendet. Bitte prüfe dein Postfach.
        </FormMessage>
      ) : (
        <form action={forgotPasswordAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail-Adresse</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <Button type="submit" className="w-full">
            Link anfordern
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Zurück zur Anmeldung
        </Link>
      </p>
    </div>
  );
}
