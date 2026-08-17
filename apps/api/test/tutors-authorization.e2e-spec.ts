import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Exercises the real AppModule's routing/guards for the Tutor Marketplace,
 * the same way learning-authorization.e2e-spec.ts and
 * ai-authorization.e2e-spec.ts do for their domains. No database is
 * touched: every case here is rejected by the global AuthGuard before any
 * controller method runs.
 */
describe('Tutors module authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SERVICE_TOKEN_SECRET ??= 'test-only-service-token-secret';

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

  it('rejects PATCH /api/v1/tutors/me/offerings/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/me/offerings/some-id')
      .send({ title: 'x' })
      .expect(401);
  });
});
