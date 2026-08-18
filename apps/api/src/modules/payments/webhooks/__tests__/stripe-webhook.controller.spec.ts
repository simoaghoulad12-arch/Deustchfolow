import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import type Stripe from 'stripe';
import { StripeWebhookController } from '../stripe-webhook.controller';
import type { WebhookSignatureService } from '../webhook-signature.service';
import type { WebhookIdempotencyService } from '../webhook-idempotency.service';
import type { WebhookDispatcherService } from '../webhook-dispatcher.service';

const fakeEvent = { id: 'evt_1', type: 'customer.subscription.updated' } as unknown as Stripe.Event;

function buildReq(): RawBodyRequest<Request> {
  return { rawBody: Buffer.from('{}') } as unknown as RawBodyRequest<Request>;
}

function buildSignatureMock(event: Stripe.Event = fakeEvent) {
  return { verifyAndParse: jest.fn().mockReturnValue(event) } as unknown as WebhookSignatureService;
}

function buildIdempotencyMock(isNew = true) {
  return {
    recordIfNew: jest.fn().mockResolvedValue(isNew),
    markProcessed: jest.fn().mockResolvedValue(undefined),
    markIgnored: jest.fn().mockResolvedValue(undefined),
    markFailed: jest.fn().mockResolvedValue(undefined),
  } as unknown as WebhookIdempotencyService;
}

function buildDispatcherMock(handled = true, error?: Error) {
  return {
    dispatch: error ? jest.fn().mockRejectedValue(error) : jest.fn().mockResolvedValue(handled),
  } as unknown as WebhookDispatcherService;
}

/**
 * Proves the composition the quality-gate report's §5/§18 describe, not
 * just each collaborator in isolation: a duplicate event must never reach
 * the dispatcher at all — this is the literal enforcement point for
 * "Webhook-Verarbeitung muss idempotent sein" / "Keine Zahlung darf
 * doppelt verarbeitet werden."
 */
describe('StripeWebhookController', () => {
  it('dispatches a new, recognized event and marks it PROCESSED', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(true);
    const dispatcher = buildDispatcherMock(true);
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);

    const result = await controller.handlePlatformWebhook(buildReq(), 't=1,v1=sig');

    expect(idempotency.recordIfNew).toHaveBeenCalledWith(fakeEvent);
    expect(dispatcher.dispatch).toHaveBeenCalledWith(fakeEvent);
    expect(idempotency.markProcessed).toHaveBeenCalledWith('evt_1');
    expect(idempotency.markIgnored).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });

  it('marks an unrecognized-but-valid event type IGNORED, not PROCESSED', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(true);
    const dispatcher = buildDispatcherMock(false); // dispatcher.dispatch returns false (unhandled type)
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);

    await controller.handlePlatformWebhook(buildReq(), 't=1,v1=sig');

    expect(idempotency.markIgnored).toHaveBeenCalledWith('evt_1');
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
  });

  it('never calls the dispatcher for a duplicate (already-seen) event id — the core idempotency guarantee', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(false); // recordIfNew: not new
    const dispatcher = buildDispatcherMock(true);
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);

    const result = await controller.handlePlatformWebhook(buildReq(), 't=1,v1=sig');

    expect(dispatcher.dispatch).not.toHaveBeenCalled();
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
    expect(idempotency.markIgnored).not.toHaveBeenCalled();
    expect(result).toEqual({ received: true });
  });

  it('marks a failed dispatch FAILED and rethrows (so Stripe retries via a 500)', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(true);
    const error = new Error('downstream boom');
    const dispatcher = buildDispatcherMock(undefined, error);
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);

    await expect(controller.handlePlatformWebhook(buildReq(), 't=1,v1=sig')).rejects.toThrow('downstream boom');

    expect(idempotency.markFailed).toHaveBeenCalledWith('evt_1', 'downstream boom');
    expect(idempotency.markProcessed).not.toHaveBeenCalled();
  });

  it('verifies against the "connect" kind for the Connect endpoint, "platform" for the platform endpoint', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(true);
    const dispatcher = buildDispatcherMock(true);
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);

    await controller.handleConnectWebhook(buildReq(), 't=1,v1=sig');
    expect(signature.verifyAndParse).toHaveBeenCalledWith(expect.any(Buffer), 't=1,v1=sig', 'connect');

    await controller.handlePlatformWebhook(buildReq(), 't=1,v1=sig');
    expect(signature.verifyAndParse).toHaveBeenCalledWith(expect.any(Buffer), 't=1,v1=sig', 'platform');
  });

  it('passes an empty buffer to signature verification when rawBody is missing, rather than skipping verification', async () => {
    const signature = buildSignatureMock();
    const idempotency = buildIdempotencyMock(true);
    const dispatcher = buildDispatcherMock(true);
    const controller = new StripeWebhookController(signature, idempotency, dispatcher);
    const reqWithNoRawBody = {} as unknown as RawBodyRequest<Request>;

    await controller.handlePlatformWebhook(reqWithNoRawBody, 't=1,v1=sig');

    expect(signature.verifyAndParse).toHaveBeenCalledWith(Buffer.alloc(0), 't=1,v1=sig', 'platform');
  });
});
