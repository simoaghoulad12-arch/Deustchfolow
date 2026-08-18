import { Controller, Headers, HttpCode, Logger, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../../auth/decorators/public.decorator';
import { WebhookSignatureService } from './webhook-signature.service';
import { WebhookIdempotencyService } from './webhook-idempotency.service';
import { WebhookDispatcherService } from './webhook-dispatcher.service';

/**
 * The only two `@Public()` (no service-token auth) routes in the
 * payments surface — Stripe cannot mint one. Security instead comes
 * entirely from signature verification (WebhookSignatureService). Two
 * separate endpoints because Stripe delivers platform events and
 * Connect (connected-account) events as logically distinct webhook
 * subscriptions, each with its own signing secret, even though both
 * terminate on this server (phase-6 quality-gate report §5).
 *
 * Processing order, every request, no exceptions: verify signature ->
 * check idempotency -> dispatch -> mark processed/ignored/failed ->
 * respond. A failure to verify or a duplicate delivery never reaches
 * business logic. A dispatch failure returns 500 so Stripe's automatic
 * retry gives it another chance; every other outcome returns 200 so
 * Stripe does not keep redelivering something we've already handled.
 */
@Controller('payments/webhooks')
export class StripeWebhookController {
  private readonly logger = new Logger('StripeWebhook');

  constructor(
    private readonly signature: WebhookSignatureService,
    private readonly idempotency: WebhookIdempotencyService,
    private readonly dispatcher: WebhookDispatcherService,
  ) {}

  @Public()
  @Post('stripe')
  @HttpCode(200)
  async handlePlatformWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signatureHeader: string | undefined,
  ) {
    return this.handle(req, signatureHeader, 'platform');
  }

  @Public()
  @Post('stripe-connect')
  @HttpCode(200)
  async handleConnectWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signatureHeader: string | undefined,
  ) {
    return this.handle(req, signatureHeader, 'connect');
  }

  private async handle(
    req: RawBodyRequest<Request>,
    signatureHeader: string | undefined,
    kind: 'platform' | 'connect',
  ) {
    // A missing rawBody here means main.ts's `rawBody: true` app option
    // did not apply to this request — verifyAndParse's missing-header
    // path also catches this (constructEvent rejects an empty buffer),
    // so no separate branch is needed; failing closed either way.
    const event = this.signature.verifyAndParse(req.rawBody ?? Buffer.alloc(0), signatureHeader, kind);

    const isNew = await this.idempotency.recordIfNew(event);
    if (!isNew) {
      this.logger.log(JSON.stringify({ event: 'webhook_duplicate_absorbed', stripeEventId: event.id, type: event.type }));
      return { received: true };
    }

    try {
      const handled = await this.dispatcher.dispatch(event);
      if (handled) {
        await this.idempotency.markProcessed(event.id);
      } else {
        await this.idempotency.markIgnored(event.id);
      }
      return { received: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      await this.idempotency.markFailed(event.id, message);
      this.logger.error(JSON.stringify({ event: 'webhook_processing_failed', stripeEventId: event.id, type: event.type, message }));
      throw error;
    }
  }
}
