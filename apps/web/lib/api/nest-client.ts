import 'server-only';
import { mintServiceToken } from '../auth/service-token';
import { requireEnv } from '../env';
import type { SessionUser } from '../auth/session';

/**
 * The only way apps/web talks to apps/api for user-owned data. Always
 * attaches a freshly minted, 60s-lived service token — never forwards the
 * browser's session cookie, and the browser never calls NestJS directly.
 */
export async function callNestApi(
  path: string,
  user: SessionUser,
  init?: RequestInit,
): Promise<Response> {
  const token = await mintServiceToken(user);
  const baseUrl = requireEnv('NEST_API_URL');

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });
}
