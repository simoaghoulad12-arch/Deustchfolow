import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@deutschflow/types';
import { RolesGuard } from '../roles.guard';

function buildContext(user: { id: string; role: string } | undefined, requiredRoles?: string[]) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles);

  const context = {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  return { reflector, context };
}

describe('RolesGuard', () => {
  it('allows any authenticated user when no @Roles() metadata is set', () => {
    const { reflector, context } = buildContext({ id: 'user-1', role: UserRole.STUDENT }, undefined);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies a STUDENT trying to reach an ADMIN-only route', () => {
    const { reflector, context } = buildContext({ id: 'user-1', role: UserRole.STUDENT }, [
      UserRole.ADMIN,
    ]);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(false);
  });

  it('allows an ADMIN to reach an ADMIN-only route', () => {
    const { reflector, context } = buildContext({ id: 'user-1', role: UserRole.ADMIN }, [
      UserRole.ADMIN,
    ]);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(true);
  });

  it('denies when there is no authenticated user at all', () => {
    const { reflector, context } = buildContext(undefined, [UserRole.ADMIN]);
    const guard = new RolesGuard(reflector);

    expect(guard.canActivate(context)).toBe(false);
  });
});
