import type { Metadata } from 'next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { resetPasswordAction } from './actions';

export const metadata: Metadata = { title: 'Passwort zurücksetzen – DeutschFlow' };

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token ?? '';

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">Neues Passwort festlegen</h1>
      </div>

      {!token ? (
        <FormMessage type="error">
          Dieser Link ist ungültig. Bitte fordere einen neuen Link zum Zurücksetzen an.
        </FormMessage>
      ) : (
        <form action={resetPasswordAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-1.5">
            <Label htmlFor="password">Neues Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="passwordConfirmation">Neues Passwort bestätigen</Label>
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
            Passwort speichern
          </Button>
        </form>
      )}
    </div>
  );
}
