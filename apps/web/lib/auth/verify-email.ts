import 'server-only';
import { prisma } from '@deutschflow/database';
import { hashToken } from './tokens';

export type VerifyEmailResult = { success: true } | { success: false; error: string };

const GENERIC_ERROR = 'Dieser Bestätigungslink ist ungültig oder abgelaufen.';

export async function verifyEmail(rawToken: string): Promise<VerifyEmailResult> {
  if (!rawToken) {
    return { success: false, error: GENERIC_ERROR };
  }

  const tokenHash = hashToken(rawToken);
  const record = await prisma.verificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    return { success: false, error: GENERIC_ERROR };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { email: record.identifier },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { tokenHash } }),
  ]);

  return { success: true };
}
