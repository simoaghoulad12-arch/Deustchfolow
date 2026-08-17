import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Exercises the real AppModule's routing/guards for the Learning Engine.
 * No database is touched: the 401 cases are rejected by the global
 * AuthGuard before any controller method runs, and the 404 cases never
 * match a route at all (proving no content-mutation endpoint exists —
 * "Student kann Content nicht verändern", spec section 23/24).
 */
describe('Learning Engine authorization (e2e)', () => {
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
    ['/api/v1/levels'],
    ['/api/v1/levels/A1'],
    ['/api/v1/courses'],
    ['/api/v1/courses/a1-grundlagen'],
    ['/api/v1/lessons/sich-vorstellen'],
    ['/api/v1/lessons/sich-vorstellen/exercises'],
    ['/api/v1/me/progress'],
  ])('rejects %s without a valid session token', async (path) => {
    await request(app.getHttpServer()).get(path).expect(401);
  });

  it('rejects submitting an exercise attempt without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/exercises/some-id/attempts')
      .send({ answer: 'x' })
      .expect(401);
  });

  it.each([
    ['post', '/api/v1/levels'],
    ['patch', '/api/v1/levels/A1'],
    ['delete', '/api/v1/levels/A1'],
    ['post', '/api/v1/courses'],
    ['patch', '/api/v1/courses/a1-grundlagen'],
    ['delete', '/api/v1/courses/a1-grundlagen'],
    ['patch', '/api/v1/lessons/sich-vorstellen'],
    ['delete', '/api/v1/lessons/sich-vorstellen'],
    ['patch', '/api/v1/exercises/some-id'],
    ['delete', '/api/v1/exercises/some-id'],
  ] as const)(
    'has no content-mutation endpoint at %s %s — students cannot edit content because the route does not exist',
    async (method, path) => {
      const server = request(app.getHttpServer());
      const response =
        method === 'post'
          ? await server.post(path)
          : method === 'patch'
            ? await server.patch(path)
            : await server.delete(path);
      expect(response.status).toBe(404);
    },
  );
});
