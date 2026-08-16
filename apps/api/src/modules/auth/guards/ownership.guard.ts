import { Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { UserRole, type AuthenticatedUser } from '@deutschflow/types';

/**
 * For routes parameterized by `:userId` (e.g. admin/support tooling that
 * looks up a specific user). Regular "my own data" endpoints don't need
 * this guard at all — they never accept a client-supplied id in the first
 * place, which is the stronger IDOR defense (see users.controller.ts).
 * This guard exists for the cases where a :userId param is unavoidable.
 */
@Injectable()
export class OwnershipGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;
    if (!user) return false;

    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPPORT) {
      return true;
    }

    return request.params.userId === user.id;
  }
}
