import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Reviews module authorization (e2e)', () => {
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

  it('rejects POST /api/v1/bookings/:id/review without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/bookings/some-id/review')
      .send({ rating: 5 })
      .expect(401);
  });

  it('rejects GET /api/v1/tutors/:id/reviews without a valid session token', async () => {
    await request(app.getHttpServer()).get('/api/v1/tutors/some-id/reviews').expect(401);
  });
});
