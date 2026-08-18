import { Injectable } from '@nestjs/common';
import { Prisma } from '@deutschflow/database';
import type Stripe from 'stripe';
import { PrismaService } from '../../../common/prisma/prisma.service';

const UNIQUE_CONSTRAINT_VIOLATION = 'P2002';

/**
 * The entire idempotency guarantee for the whole payment system lives
 * in the unique constraint on `stripe_event_id` (see the Prisma
 * schema). `recordIfNew` is an INSERT that either succeeds (this event
 * id has never been seen — proceed) or fails with a unique-constraint
 * violation (already recorded — a duplicate/replayed delivery, absorb
 * it silently). This check must run, and must be attempted, BEFORE any
 * business-logic dispatch — see StripeWebhookController.
 */
@Injectable()
export class WebhookIdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  /** Returns true if this is the first time this Stripe event id has
   * been seen (a row was created, status PENDING) — false if it was
   * already recorded (a genuine duplicate/replay, no new row, no error). */
  async recordIfNew(event: Stripe.Event): Promise<boolean> {
    try {
      await this.prisma.client.stripeWebhookEvent.create({
        data: {
          stripeEventId: event.id,
          type: event.type,
          payload: event as unknown as Prisma.InputJsonValue,
          status: 'PENDING',
        },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === UNIQUE_CONSTRAINT_VIOLATION) {
        return false;
      }
      throw error;
    }
  }

  async markProcessed(stripeEventId: string): Promise<void> {
    await this.prisma.client.stripeWebhookEvent.update({
      where: { stripeEventId },
      data: { status: 'PROCESSED', processedAt: new Date() },
    });
  }

  /** For an event type we deliberately don't handle (see
   * WebhookDispatcherService) — still recorded, never silently dropped. */
  async markIgnored(stripeEventId: string): Promise<void> {
    await this.prisma.client.stripeWebhookEvent.update({
      where: { stripeEventId },
      data: { status: 'IGNORED', processedAt: new Date() },
    });
  }

  async markFailed(stripeEventId: string, errorMessage: string): Promise<void> {
    await this.prisma.client.stripeWebhookEvent.update({
      where: { stripeEventId },
      data: { status: 'FAILED', processingError: errorMessage },
    });
  }
}
