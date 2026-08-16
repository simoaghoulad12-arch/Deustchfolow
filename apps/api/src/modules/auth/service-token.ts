import { jwtVerify } from 'jose';
import type { AuthenticatedUser } from '@deutschflow/types';

/**
 * Verifies the short-lived (~60s) service token minted by Next.js's server
 * (see apps/web/lib/auth/service-token.ts and architecture decision
 * record, section 4). This is the ONLY identity NestJS trusts — it is
 * never derived from anything the browser sends directly.
 */
export async function verifyServiceToken(token: string): Promise<AuthenticatedUser> {
  const secret = new TextEncoder().encode(getServiceTokenSecret());
  const { payload } = await jwtVerify(token, secret);

  if (typeof payload.sub !== 'string' || typeof payload.role !== 'string') {
    throw new Error('Service token payload is missing required claims.');
  }

  return { id: payload.sub, role: payload.role as AuthenticatedUser['role'] };
}

function getServiceTokenSecret(): string {
  const secret = process.env.SERVICE_TOKEN_SECRET;
  if (!secret) {
    throw new Error('Missing required environment variable: SERVICE_TOKEN_SECRET');
  }
  return secret;
}
