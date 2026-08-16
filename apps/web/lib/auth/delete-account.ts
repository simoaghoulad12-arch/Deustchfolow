import 'server-only';
import { prisma } from '@deutschflow/database';
import { verifyPassword } from './password';
import { destroyAllSessions } from './session';

export type DeleteAccountResult = { success: true } | { success: false; error: string };

/**
 * Soft-delete only (`deletedAt`) — never a hard delete, so audit/business
 * data referencing this user is not damaged. Full anonymization and a
 * hard-delete-after-grace-period job are a later, explicitly deferred
 * extension (see architecture decision record, section 6). Requires the
 * current password so an already-open session cannot be used to destroy
 * the account without re-proving identity.
 */
export async function deleteAccountForUser(
  userId: string,
  password: string,
): Promise<DeleteAccountResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.deletedAt) {
    return { success: false, error: 'Konto konnte nicht gefunden werden.' };
  }

  const passwordIsValid = await verifyPassword(password, user.passwordHash);
  if (!passwordIsValid) {
    return { success: false, error: 'Das eingegebene Passwort ist falsch.' };
  }

  await prisma.user.update({ where: { id: userId }, data: { deletedAt: new Date() } });
  await destroyAllSessions(userId);

  return { success: true };
}
