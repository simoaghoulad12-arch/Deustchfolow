import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Exercises the real AppModule's routing/guards for the Booking Engine,
 * the same way tutors-authorization.e2e-spec.ts does for the Tutor
 * Marketplace. No database is touched: every case here is rejected by
 * the global AuthGuard before any controller method runs.
 */
describe('Bookings module authorization (e2e)', () => {
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
});
