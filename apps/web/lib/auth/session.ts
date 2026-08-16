import 'server-only';
import { cookies } from 'next/headers';
import { prisma } from '@deutschflow/database';
import type { UserRole } from '@deutschflow/types';
import { randomBytes } from 'node:crypto';

/**
 * Custom, Auth.js-schema-compatible session module (database-backed —
 * see docs/architecture-decisions/phase-1.5-identity-auth-entitlements.md,
 * section 12, for why this is hand-rolled rather than the `next-auth`
 * package: Auth.js's Credentials provider does not support the
 * "database" session strategy, and working around that would need more
 * code than this file).
 */

const SESSION_COOKIE_NAME = 'df_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_RENEW_THRESHOLD_MS = 15 * 24 * 60 * 60 * 1000; // renew if < 15 days left

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

export async function createSession(userId: string): Promise<void> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await prisma.session.create({
    data: { userId, sessionToken, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  });
}

/**
 * Reads the session cookie, validates it against the database, and returns
 * the authenticated user — or null. Performs sliding-expiry renewal so
 * active users are not logged out mid-session.
 */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date() || session.user.deletedAt) {
    return null;
  }

  const remainingMs = session.expiresAt.getTime() - Date.now();
  if (remainingMs < SESSION_RENEW_THRESHOLD_MS) {
    const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await prisma.session.update({
      where: { sessionToken },
      data: { expiresAt: newExpiresAt },
    });
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: newExpiresAt,
    });
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    emailVerified: session.user.emailVerified !== null,
  };
}

/** Logs out the current browser: deletes the session row and clears the cookie. */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    await prisma.session.deleteMany({ where: { sessionToken } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * "Log out everywhere": used after password reset and account deletion so
 * a compromised or superseded credential can never keep an old session
 * alive.
 */
export async function destroyAllSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
