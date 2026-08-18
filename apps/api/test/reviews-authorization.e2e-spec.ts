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

describe('Reviews module authorization (e2e)', () => {
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

  it('rejects POST /api/v1/bookings/:id/review without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/bookings/some-id/review')
      .send({ rating: 5 })
      .expect(401);
  });

  it('rejects GET /api/v1/tutors/:id/reviews without a valid session token', async () => {
    await request(app.getHttpServer()).get('/api/v1/tutors/some-id/reviews').expect(401);
  });

  it('rejects PATCH /api/v1/tutors/admin/reviews/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/reviews/some-id')
      .send({ isHidden: true })
      .expect(401);
  });

  it('rejects a non-ADMIN token on PATCH /api/v1/tutors/admin/reviews/:id (RolesGuard, not ownership)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/reviews/some-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ isHidden: true })
      .expect(403);
  });

  it('rejects an ADMIN token with a non-boolean isHidden (ValidationPipe, before any database call)', async () => {
    const token = await signToken(UserRole.ADMIN);
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/reviews/some-id')
      .set('Authorization', `Bearer ${token}`)
      .send({ isHidden: 'not-a-boolean' })
      .expect(400);
  });

  it('rejects POST /api/v1/bookings/:id/review with an out-of-range rating (ValidationPipe, before any database call)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/bookings/some-id/review')
      .set('Authorization', `Bearer ${token}`)
      .send({ rating: 6 })
      .expect(400);
  });
});
