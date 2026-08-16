import type { ExecutionContext } from '@nestjs/common';
import { UserRole } from '@deutschflow/types';
import { OwnershipGuard } from '../ownership.guard';

function buildContext(user: { id: string; role: string } | undefined, params: Record<string, string>) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user, params }) }),
  } as unknown as ExecutionContext;
}

describe('OwnershipGuard', () => {
  const guard = new OwnershipGuard();

  it('allows a user to access their own resource', () => {
    const context = buildContext({ id: 'user-1', role: UserRole.STUDENT }, { userId: 'user-1' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it("denies a STUDENT from accessing another user's resource", () => {
    const context = buildContext({ id: 'user-1', role: UserRole.STUDENT }, { userId: 'user-2' });
    expect(guard.canActivate(context)).toBe(false);
  });

  it("allows ADMIN to access another user's resource", () => {
    const context = buildContext({ id: 'admin-1', role: UserRole.ADMIN }, { userId: 'user-2' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it("allows SUPPORT to access another user's resource", () => {
    const context = buildContext({ id: 'support-1', role: UserRole.SUPPORT }, { userId: 'user-2' });
    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies when there is no authenticated user', () => {
    const context = buildContext(undefined, { userId: 'user-1' });
    expect(guard.canActivate(context)).toBe(false);
  });
});
