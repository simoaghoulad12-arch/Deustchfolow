import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { FormMessage } from '@/components/ui/form-message';
import { verifyEmailAction } from './actions';

export const metadata: Metadata = { title: 'E-Mail bestätigen – DeutschFlow' };

export default function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string; error?: string };
}) {
  const token = searchParams.token ?? '';

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-xl font-semibold">E-Mail-Adresse bestätigen</h1>
      </div>

      {!token ? (
        <FormMessage type="error">
          Dieser Bestätigungslink ist unvollständig. Bitte öffne den Link direkt aus der E-Mail.
        </FormMessage>
      ) : (
        <form action={verifyEmailAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <p className="text-center text-sm text-muted-foreground">
            Bestätige mit einem Klick, dass diese E-Mail-Adresse dir gehört.
          </p>
          {searchParams.error && <FormMessage type="error">{searchParams.error}</FormMessage>}
          <Button type="submit" className="w-full">
            E-Mail-Adresse jetzt bestätigen
          </Button>
        </form>
      )}
    </div>
  );
}
