import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Germany Coach module authorization (e2e)', () => {
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
    ['/api/v1/germany/my-path'],
    ['/api/v1/germany/sources'],
    ['/api/v1/germany/documents'],
  ])('rejects GET %s without a valid session token', async (path) => {
    await request(app.getHttpServer()).get(path).expect(401);
  });

  it('rejects PUT /api/v1/germany/my-path/goal without a valid session token', async () => {
    await request(app.getHttpServer())
      .put('/api/v1/germany/my-path/goal')
      .send({ goalType: 'WORK' })
      .expect(401);
  });

  it('rejects PATCH /api/v1/germany/my-path/step without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/germany/my-path/step')
      .send({ step: 'DOCUMENTS' })
      .expect(401);
  });

  it('rejects POST /api/v1/germany/sources without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/germany/sources')
      .send({ title: 'x', url: 'https://example.com', authority: 'x', topic: 'GENERAL', language: 'de' })
      .expect(401);
  });

  it('rejects PATCH /api/v1/germany/sources/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/germany/sources/some-id')
      .send({ active: false })
      .expect(401);
  });

  it('rejects POST /api/v1/germany/documents without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/germany/documents')
      .send({ documentType: 'Reisepass', goal: 'WORK' })
      .expect(401);
  });

  it('rejects PATCH /api/v1/germany/documents/:id without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/germany/documents/some-id')
      .send({ status: 'UPLOADED' })
      .expect(401);
  });

  it('rejects DELETE /api/v1/germany/documents/:id without a valid session token', async () => {
    await request(app.getHttpServer()).delete('/api/v1/germany/documents/some-id').expect(401);
  });
});
