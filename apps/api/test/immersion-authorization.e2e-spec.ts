import { Test, type TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { SignJWT } from 'jose';
import { UserRole } from '@deutschflow/types';
import { AppModule } from '../src/app.module';

const SECRET = 'test-only-service-token-secret';

async function signToken(role: string, sub = 'user-1') {
  return new SignJWT({ role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(new TextEncoder().encode(SECRET));
}

/**
 * Routing and guards of the immersion API (/live/*) against the real
 * AppModule. Every case is decided by the global AuthGuard/RolesGuard
 * before a controller runs, so no database is needed.
 */
describe('Immersion API authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SERVICE_TOKEN_SECRET = SECRET;
    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['get', '/api/v1/live/me'],
    ['get', '/api/v1/live/home'],
    ['get', '/api/v1/live/world'],
    ['post', '/api/v1/live/missions/at-the-cafe/runs'],
    ['get', '/api/v1/live/placement/next'],
    ['get', '/api/v1/live/vocabulary/due'],
    ['get', '/api/v1/live/grammar'],
    ['post', '/api/v1/live/practice'],
    ['get', '/api/v1/live/journal'],
    ['get', '/api/v1/live/progress'],
    ['get', '/api/v1/live/admin'],
  ] as const)('rejects %s %s without a session token', async (method, path) => {
    const server = request(app.getHttpServer());
    const response = method === 'post' ? await server.post(path).send({}) : await server.get(path);
    expect(response.status).toBe(401);
  });

  it('rejects a token signed with the wrong secret', async () => {
    const forged = await new SignJWT({ role: UserRole.ADMIN })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('user-1')
      .setExpirationTime('60s')
      .sign(new TextEncoder().encode('not-the-secret'));
    await request(app.getHttpServer()).get('/api/v1/live/admin').set('Authorization', `Bearer ${forged}`).expect(401);
  });

  it.each([
    ['get', '/api/v1/live/admin'],
    ['get', '/api/v1/live/admin/dashboard'],
    ['get', '/api/v1/live/admin/content/missions'],
    ['post', '/api/v1/live/admin/content/missions'],
    ['patch', '/api/v1/live/admin/content/missions/some-id'],
    ['delete', '/api/v1/live/admin/content/missions/some-id'],
    ['get', '/api/v1/live/admin/users'],
    ['patch', '/api/v1/live/admin/users/user-2/role'],
  ] as const)('forbids a student from %s %s', async (method, path) => {
    const token = await signToken(UserRole.STUDENT);
    const server = request(app.getHttpServer());
    const call = method === 'get' ? server.get(path) : method === 'post' ? server.post(path) : method === 'patch' ? server.patch(path) : server.delete(path);
    const response = await call.set('Authorization', `Bearer ${token}`).send({});
    expect(response.status).toBe(403);
  });

  it.each([
    ['get', '/api/v1/live/admin/users'],
    ['patch', '/api/v1/live/admin/users/user-2/role'],
  ] as const)('keeps user management admin-only (content editor gets 403 on %s %s)', async (method, path) => {
    const token = await signToken(UserRole.CONTENT_EDITOR);
    const server = request(app.getHttpServer());
    const call = method === 'get' ? server.get(path) : server.patch(path);
    const response = await call.set('Authorization', `Bearer ${token}`).send({ role: 'ADMIN' });
    expect(response.status).toBe(403);
  });

  it('lets a content editor read the CMS registry without admin-only resources', async () => {
    const token = await signToken(UserRole.CONTENT_EDITOR);
    const response = await request(app.getHttpServer()).get('/api/v1/live/admin').set('Authorization', `Bearer ${token}`).expect(200);
    const keys = (response.body as { key: string }[]).map((r) => r.key);
    expect(keys).toContain('missions');
    expect(keys).not.toContain('settings');
    expect(keys).not.toContain('feature-flags');
  });
});
