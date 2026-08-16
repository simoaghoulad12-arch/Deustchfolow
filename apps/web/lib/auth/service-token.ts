import 'server-only';
import { SignJWT } from 'jose';
import { requireEnv } from '../env';
import type { SessionUser } from './session';

/**
 * Mints the short-lived, server-only token that authenticates Next.js's
 * server to NestJS (see architecture decision record, section 4). Never
 * sent to or readable by the browser — the browser only ever holds the
 * opaque session cookie.
 */
export async function mintServiceToken(user: SessionUser): Promise<string> {
  const secret = new TextEncoder().encode(requireEnv('SERVICE_TOKEN_SECRET'));

  return new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(secret);
}
