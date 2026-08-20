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
 * Exercises the real AppModule's routing/guards for the Booking Engine,
 * the same way tutors-authorization.e2e-spec.ts does for the Tutor
 * Marketplace. No database is touched: every case here is rejected either
 * by the global AuthGuard (no token), the RolesGuard (wrong role — role
 * checks never reach the database), or the ValidationPipe (bad payload —
 * rejected before any controller method runs) before any controller
 * method that would need Prisma runs.
 */
describe('Bookings module authorization (e2e)', () => {
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

  it.each([['/api/v1/bookings/me'], ['/api/v1/bookings/tutor/me']])(
    'rejects %s without a valid session token',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(401);
    },
  );

  it('rejects POST /api/v1/bookings without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .send({ offeringId: 'x', startAt: new Date().toISOString(), studentTimezone: 'Europe/Berlin' })
      .expect(401);
  });

  it.each([
    ['/api/v1/bookings/some-id/confirm'],
    ['/api/v1/bookings/some-id/cancel'],
    ['/api/v1/bookings/some-id/complete'],
    ['/api/v1/bookings/some-id/no-show'],
  ])('rejects PATCH %s without a valid session token', async (path) => {
    await request(app.getHttpServer()).patch(path).send({}).expect(401);
  });

  it('rejects a STUDENT token on GET /api/v1/bookings/tutor/me (RolesGuard, not ownership)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .get('/api/v1/bookings/tutor/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it.each([
    ['/api/v1/bookings/some-id/confirm'],
    ['/api/v1/bookings/some-id/complete'],
    ['/api/v1/bookings/some-id/no-show'],
  ])('rejects a STUDENT token on the TUTOR-only PATCH %s (RolesGuard, not ownership)', async (path) => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .patch(path)
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(403);
  });

  it('rejects POST /api/v1/bookings with an invalid offeringId (ValidationPipe, before any database call)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ offeringId: 'not-a-uuid', startAt: new Date().toISOString(), studentTimezone: 'Europe/Berlin' })
      .expect(400);
  });

  it('rejects POST /api/v1/bookings with a malformed startAt (ValidationPipe, before any database call)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/bookings')
      .set('Authorization', `Bearer ${token}`)
      .send({ offeringId: '11111111-1111-1111-1111-111111111111', startAt: 'not-a-date', studentTimezone: 'Europe/Berlin' })
      .expect(400);
  });

  it('rejects PATCH /api/v1/bookings/:bookingId/cancel with a non-UUID bookingId as a clean 400 (ParseUUIDPipe, before any database call)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .patch('/api/v1/bookings/not-a-uuid/cancel')
      .set('Authorization', `Bearer ${token}`)
      .send({})
      .expect(400);
  });
});
