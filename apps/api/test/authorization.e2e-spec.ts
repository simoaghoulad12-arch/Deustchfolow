import { Controller, Get, INestApplication, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test, type TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { SignJWT } from 'jose';
import { UserRole } from '@deutschflow/types';
import { AuthGuard } from '../src/modules/auth/guards/auth.guard';
import { RolesGuard } from '../src/modules/auth/guards/roles.guard';
import { Public } from '../src/modules/auth/decorators/public.decorator';
import { Roles } from '../src/modules/auth/decorators/roles.decorator';

const SECRET = 'test-only-service-token-secret';

/**
 * Exercises AuthGuard + RolesGuard through the real Nest HTTP pipeline
 * (not just unit-tested in isolation) using a throwaway controller, so no
 * database is required — see docs/architecture-decisions/... section 12
 * for why NestJS tests avoid needing a live Postgres in CI.
 */
@Controller('test')
class FixtureController {
  @Public()
  @Get('public')
  publicRoute() {
    return { ok: true };
  }

  @Get('protected')
  protectedRoute() {
    return { ok: true };
  }

  @Roles(UserRole.ADMIN)
  @Get('admin-only')
  adminOnlyRoute() {
    return { ok: true };
  }
}

@Module({
  controllers: [FixtureController],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
class FixtureModule {}

async function signToken(role: string, sub = 'user-1', expiresIn = '60s') {
  const secret = new TextEncoder().encode(SECRET);
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

describe('Authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SERVICE_TOKEN_SECRET = SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [FixtureModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('allows a @Public() route with no token', async () => {
    await request(app.getHttpServer()).get('/test/public').expect(200);
  });

  it('rejects a protected route with no session/token', async () => {
    await request(app.getHttpServer()).get('/test/protected').expect(401);
  });

  it('allows a protected route with a valid session token', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  it('rejects an expired session token', async () => {
    const token = await signToken(UserRole.STUDENT, 'user-1', '-1s');
    await request(app.getHttpServer())
      .get('/test/protected')
      .set('Authorization', `Bearer ${token}`)
      .expect(401);
  });

  it('denies a STUDENT on an ADMIN-only route', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('allows an ADMIN on an ADMIN-only route', async () => {
    const token = await signToken(UserRole.ADMIN);
    await request(app.getHttpServer())
      .get('/test/admin-only')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});
