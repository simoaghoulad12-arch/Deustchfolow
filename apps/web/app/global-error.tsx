'use client';

/**
 * Last-resort boundary for errors in the root layout itself. Must render
 * its own <html>/<body> and cannot rely on the app's components.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="de">
      <body style={{ fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: '20vh 16px' }}>
        <h1 style={{ fontSize: 20 }}>Da ist etwas schiefgelaufen</h1>
        <p style={{ color: '#666', fontSize: 14 }}>Bitte versuche es in einem Moment erneut.</p>
        {error.digest && <p style={{ color: '#666', fontSize: 12 }}>Fehler-Code: {error.digest}</p>}
        <button type="button" onClick={reset} style={{ marginTop: 16, padding: '10px 20px' }}>
          Erneut versuchen
        </button>
      </body>
    </html>
  );
}
