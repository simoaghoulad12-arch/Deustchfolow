import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Exercises the real AppModule's routing/guards for the AI module, the
 * same way learning-authorization.e2e-spec.ts does for the Learning
 * Engine. No database or AI provider is touched: every case here is
 * rejected by the global AuthGuard before any controller method runs —
 * a client can never even reach the AI layer without a valid session.
 */
describe('AI module authorization (e2e)', () => {
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

  it('rejects POST /api/v1/ai/tutor without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/ai/tutor')
      .send({ message: 'Hallo' })
      .expect(401);
  });

  it('rejects POST /api/v1/ai/tutor/exercise/answer without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/ai/tutor/exercise/answer')
      .send({ sessionId: 'a', messageId: 'b', answer: 'c' })
      .expect(401);
  });

  it.each([['/api/v1/ai/tutor/sessions'], ['/api/v1/ai/tutor/sessions/some-id']])(
    'rejects %s without a valid session token',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(401);
    },
  );

  it('rejects POST /api/v1/ai/writing/correct without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/ai/writing/correct')
      .send({ text: 'Ich gehe zu Schule.' })
      .expect(401);
  });
});
