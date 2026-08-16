import { Injectable, type CanActivate, type ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { verifyServiceToken } from '../service-token';

/**
 * Applied globally (see AppModule). Verifies the signed service token on
 * every request and attaches the identity to `req.user`. Routes must opt
 * OUT with `@Public()` (e.g. the health check) — secure-by-default rather
 * than relying on every route remembering to opt in.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or malformed Authorization header.');
    }

    const token = authHeader.slice('Bearer '.length);

    try {
      request.user = await verifyServiceToken(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired service token.');
    }

    return true;
  }
}
