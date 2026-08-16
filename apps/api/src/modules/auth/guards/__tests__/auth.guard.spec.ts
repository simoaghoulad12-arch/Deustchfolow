import { UnauthorizedException, type ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SignJWT } from 'jose';
import { AuthGuard } from '../auth.guard';

const SECRET = 'test-only-service-token-secret';

function buildContext(headers: Record<string, string>, metadata: { isPublic?: boolean } = {}) {
  const reflector = new Reflector();
  jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(metadata.isPublic);

  const request: { headers: Record<string, string>; user?: unknown } = { headers };
  const context = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as unknown as ExecutionContext;

  return { reflector, context, request };
}

async function signToken(claims: Record<string, unknown>, expiresIn = '60s') {
  const secret = new TextEncoder().encode(SECRET);
  return new SignJWT(claims)
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(claims.sub ?? 'user-1'))
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

describe('AuthGuard', () => {
  beforeEach(() => {
    process.env.SERVICE_TOKEN_SECRET = SECRET;
  });

  it('allows a route marked @Public() without any token', async () => {
    const { reflector, context } = buildContext({}, { isPublic: true });
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('rejects a request with no Authorization header', async () => {
    const { reflector, context } = buildContext({});
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a malformed Authorization header', async () => {
    const { reflector, context } = buildContext({ authorization: 'not-a-bearer-token' });
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects an expired token', async () => {
    const token = await signToken({ sub: 'user-1', role: 'STUDENT' }, '-1s');
    const { reflector, context } = buildContext({ authorization: `Bearer ${token}` });
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const secret = new TextEncoder().encode('a-completely-different-secret');
    const token = await new SignJWT({ role: 'STUDENT' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setIssuedAt()
      .setExpirationTime('60s')
      .sign(secret);

    const { reflector, context } = buildContext({ authorization: `Bearer ${token}` });
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('accepts a validly signed token and attaches the identity to the request', async () => {
    const token = await signToken({ sub: 'user-1', role: 'STUDENT' });
    const { reflector, context, request } = buildContext({ authorization: `Bearer ${token}` });
    const guard = new AuthGuard(reflector);

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user).toEqual({ id: 'user-1', role: 'STUDENT' });
  });
});
