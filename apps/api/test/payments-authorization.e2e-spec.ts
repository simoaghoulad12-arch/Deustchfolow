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
 * Exercises the real AppModule's routing/guards for the Payments
 * module, the same way every other *-authorization.e2e-spec.ts does
 * for its domain. No database is touched: every case here is rejected
 * either by the global AuthGuard (no token) or the ValidationPipe (bad
 * payload) before any controller method that would call Stripe runs.
 */
describe('Payments module authorization (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env.SERVICE_TOKEN_SECRET = SECRET;
    // Dummy, non-secret test-only values so WebhookSignatureService can
    // reach its "signature verification failed" branch (400) instead of
    // a config-error 500 — same rationale as SERVICE_TOKEN_SECRET above.
    process.env.STRIPE_SECRET_KEY ??= 'sk_test_dummy_for_e2e';
    process.env.STRIPE_WEBHOOK_SECRET ??= 'whsec_dummy_for_e2e';
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET ??= 'whsec_connect_dummy_for_e2e';

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

  it('rejects POST /api/v1/payments/subscriptions/checkout without a valid session token', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/payments/subscriptions/checkout')
      .send({ plan: 'PREMIUM' })
      .expect(401);
  });

  it('rejects a FREE plan (ValidationPipe — FREE is never checked out against Stripe)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/payments/subscriptions/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan: 'FREE' })
      .expect(400);
  });

  it('rejects an unrecognized plan value', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/payments/subscriptions/checkout')
      .set('Authorization', `Bearer ${token}`)
      .send({ plan: 'ULTRA_DELUXE' })
      .expect(400);
  });

  it('rejects a webhook POST with no stripe-signature header — the endpoint is @Public() but never trusts an unverified body', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/payments/webhooks/stripe')
      .send({ id: 'evt_fake', type: 'customer.subscription.updated' })
      .expect(400);
  });

  it('rejects a webhook POST with a forged stripe-signature header', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/payments/webhooks/stripe')
      .set('stripe-signature', 't=1,v1=not-a-real-signature')
      .send({ id: 'evt_fake', type: 'customer.subscription.updated' })
      .expect(400);
  });

  it('rejects a Connect webhook POST with a forged stripe-signature header on the separate Connect endpoint', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/payments/webhooks/stripe-connect')
      .set('stripe-signature', 't=1,v1=not-a-real-signature')
      .send({ id: 'evt_fake', type: 'account.updated' })
      .expect(400);
  });

  it('rejects POST /api/v1/payments/connect/onboarding-link without a valid session token', async () => {
    await request(app.getHttpServer()).post('/api/v1/payments/connect/onboarding-link').expect(401);
  });

  it('rejects GET /api/v1/payments/connect/status without a valid session token', async () => {
    await request(app.getHttpServer()).get('/api/v1/payments/connect/status').expect(401);
  });

  it('rejects a non-TUTOR token on POST /api/v1/payments/connect/onboarding-link (RolesGuard, not ownership)', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .post('/api/v1/payments/connect/onboarding-link')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('rejects a non-TUTOR token on GET /api/v1/payments/connect/status', async () => {
    const token = await signToken(UserRole.STUDENT);
    await request(app.getHttpServer())
      .get('/api/v1/payments/connect/status')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });
});
