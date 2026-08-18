import type { INestApplication } from '@nestjs/common';

/**
 * Prevents a mislabeled upload (e.g. a tutor verification document
 * whose declared content-type doesn't match its real bytes, served
 * `inline` to an admin reviewer — see `matchesDeclaredFileSignature`)
 * from being MIME-sniffed and rendered as something other than what
 * it's served as. A single header, not a full Helmet dependency — no
 * other security-header concern exists in this API today (Phase 6.5
 * audit hardening).
 */
export function applySecurityHeaders(app: INestApplication): void {
  app.use((_req: unknown, res: { setHeader: (name: string, value: string) => void }, next: () => void) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    next();
  });
}
