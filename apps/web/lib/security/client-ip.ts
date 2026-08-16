import 'server-only';
import { headers } from 'next/headers';

/**
 * Reads the client IP from the `x-forwarded-for` header set by the
 * reverse proxy/load balancer in front of Next.js. This trusts that
 * header — correct as long as the deployment sits behind a proxy that
 * sets it and strips any client-supplied value first (standard for
 * Vercel/most reverse proxies). Falls back to a constant key so rate
 * limiting still degrades safely (shared bucket) if the header is absent
 * rather than throwing.
 */
export async function getClientIp(): Promise<string> {
  const headerStore = await headers();
  const forwardedFor = headerStore.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]!.trim();
  }
  return 'unknown';
}
