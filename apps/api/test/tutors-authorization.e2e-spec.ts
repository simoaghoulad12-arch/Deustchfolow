import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SignJWT } from 'jose';
import { UserRole } from '@deutschflow/types';
import { AppModule } from '../src/app.module';

const SECRET = 'test-only-service-token-secret';

async function signToken(role: string, sub = 'user-1') {
  const secret = new TextEncoder().encode(SECRET);
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(secret);
}

/**
 * Exercises the real AppModule's routing/guards for the Tutor Marketplace,
 * the same way learning-authorization.e2e-spec.ts and
 * ai-authorization.e2e-spec.ts do for their domains. No database is
 * touched: every case here is rejected either by the global AuthGuard (no
 * token), the RolesGuard (wrong role), or the ValidationPipe (bad
 * payload) before any controller method that would need Prisma runs.
 */
describe('Tutors module authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SERVICE_TOKEN_SECRET = SECRET;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['/api/v1/tutors'],
    ['/api/v1/tutors/some-id'],
    ['/api/v1/tutors/me/profile'],
    ['/api/v1/tutors/me/offerings'],
    ['/api/v1/tutors/some-id/offerings'],
    ['/api/v1/tutors/me/availability/rules'],
    ['/api/v1/tutors/me/availability/exceptions'],
    ['/api/v1/tutors/some-id/availability?from=2026-08-17T00:00:00.000Z&to=2026-08-18T00:00:00.000Z'],
  ])('rejects %s without a valid session token', async (path) => {
    await request(app.getHttpServer()).get(path).expect(401);
  });

  it('rejects PUT /api/v1/tutors/me/profile without a valid session token', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/tutors/me/profile')
      .send({ languages: [], timezone: 'Europe/Berlin' })
      .expect(401);
  });

  it('rejects POST /api/v1/tutors/me/offerings without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tutors/me/offerings')
      .send({ title: 'x', category: 'CONVERSATION', durationMinutes: 30, priceCents: 1000 })
      .expect(401);
  });

  it('rejects an offering priced below the Stripe EUR minimum charge (50 cents), with a valid token, via ValidationPipe', async () => {
    const token = await signToken(UserRole.TUTOR);
    await request(app.getHttpServer())
      .post('/api/v1/tutors/me/offerings')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'x', category: 'CONVERSATION', durationMinutes: 30, priceCents: 10 })
      .expect(400);
  });

  it('rejects PATCH /api/v1/tutors/me/offerings/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/me/offerings/some-id')
      .send({ title: 'x' })
      .expect(401);
  });

  it('rejects POST /api/v1/tutors/me/availability/rules without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tutors/me/availability/rules')
      .send({ weekday: 1, startMinute: 540, endMinute: 600 })
      .expect(401);
  });

  it('rejects DELETE /api/v1/tutors/me/availability/rules/:id without a valid session token', async () => {
    await request(app.getHttpServer()).delete('/api/v1/tutors/me/availability/rules/some-id').expect(401);
  });

  it('rejects POST /api/v1/tutors/me/availability/exceptions without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tutors/me/availability/exceptions')
      .send({ startAt: '2026-09-01T00:00:00.000Z', endAt: '2026-09-02T00:00:00.000Z' })
      .expect(401);
  });

  it('rejects DELETE /api/v1/tutors/me/availability/exceptions/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .delete('/api/v1/tutors/me/availability/exceptions/some-id')
      .expect(401);
  });

  it('rejects PATCH /api/v1/tutors/admin/:id/status without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/some-id/status')
      .send({ isActive: false })
      .expect(401);
  });

  it('rejects a non-ADMIN token on PATCH /api/v1/tutors/admin/:id/status (RolesGuard, not ownership)', async () => {
    const token = await signToken(UserRole.TUTOR);
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/some-id/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: false })
      .expect(403);
  });

  it('rejects an ADMIN token with a non-boolean isActive (ValidationPipe, before any database call)', async () => {
    const token = await signToken(UserRole.ADMIN);
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/some-id/status')
      .set('Authorization', `Bearer ${token}`)
      .send({ isActive: 'not-a-boolean' })
      .expect(400);
  });
});
