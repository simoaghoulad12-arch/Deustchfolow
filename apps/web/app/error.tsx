'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

/**
 * Route-level error boundary: replaces Next's bare "Application error"
 * screen with a German message. The digest is shown so a user can quote
 * it — it matches the entry in the server logs (e.g. Vercel → Logs).
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-semibold">Da ist etwas schiefgelaufen</h1>
      <p className="text-sm text-muted-foreground">
        Der Server konnte die Seite gerade nicht laden. Bitte versuche es in einem Moment erneut.
      </p>
      {error.digest && <p className="text-xs text-muted-foreground">Fehler-Code: {error.digest}</p>}
      <div className="flex flex-wrap justify-center gap-2">
        <Button type="button" onClick={reset}>
          Erneut versuchen
        </Button>
        <Link href="/">
          <Button type="button" variant="outline">
            Zur Startseite
          </Button>
        </Link>
      </div>
    </div>
  );
}
