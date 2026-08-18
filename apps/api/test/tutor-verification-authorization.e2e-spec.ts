import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Tutor verification authorization (e2e)', () => {
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
    ['/api/v1/tutors/me/verification/documents'],
    ['/api/v1/tutors/me/verification/documents/some-id/content'],
    ['/api/v1/tutors/admin/verification/queue'],
    ['/api/v1/tutors/admin/verification/some-tutor/documents'],
    ['/api/v1/tutors/admin/verification/documents/some-id/content'],
  ])('rejects GET %s without a valid session token', async (path) => {
    await request(app.getHttpServer()).get(path).expect(401);
  });

  it('rejects POST /api/v1/tutors/me/verification/documents without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/tutors/me/verification/documents')
      .send({ label: 'x', contentType: 'application/pdf', dataBase64: 'aGVsbG8=' })
      .expect(401);
  });

  it('rejects POST /api/v1/tutors/me/verification/submit without a valid session token', async () => {
    await request(app.getHttpServer()).post('/api/v1/tutors/me/verification/submit').expect(401);
  });

  it('rejects PATCH /api/v1/tutors/admin/verification/:tutorId without a valid session token', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/tutors/admin/verification/some-tutor')
      .send({ status: 'VERIFIED' })
      .expect(401);
  });
});
