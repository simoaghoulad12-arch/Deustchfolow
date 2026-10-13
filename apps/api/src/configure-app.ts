import { ValidationPipe, type INestApplication } from '@nestjs/common';
import { applySecurityHeaders } from './common/security-headers';

/**
 * Shared app setup for the long-running server (`main.ts`) and the
 * serverless entry (`serverless.ts`), so both expose the same routes,
 * headers and validation.
 */
export function configureApp(app: INestApplication): void {
  applySecurityHeaders(app);

  app.setGlobalPrefix('api/v1');

  // whitelist + forbidNonWhitelisted: any field not declared on a DTO is
  // rejected outright, not silently stripped — the mass-assignment
  // defense (see architecture decision record, section 8).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
