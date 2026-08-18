import { Prisma } from '@deutschflow/database';
import type Stripe from 'stripe';
import { WebhookIdempotencyService } from '../webhook-idempotency.service';
import type { PrismaService } from '../../../../common/prisma/prisma.service';

const sampleEvent = { id: 'evt_1', type: 'customer.subscription.updated', data: { object: {} } } as unknown as Stripe.Event;

function buildPrismaMock(overrides?: Partial<Record<string, jest.Mock>>) {
  return {
    client: {
      stripeWebhookEvent: {
        create: jest.fn().mockResolvedValue({}),
        update: jest.fn().mockResolvedValue({}),
        ...overrides,
      },
    },
  } as unknown as PrismaService;
}

function buildUniqueConstraintError(): Prisma.PrismaClientKnownRequestError {
  return new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
    code: 'P2002',
    clientVersion: '5.22.0',
  });
}

describe('WebhookIdempotencyService', () => {
  describe('recordIfNew', () => {
    it('returns true and inserts a row for an event id never seen before', async () => {
      const prisma = buildPrismaMock();
      const service = new WebhookIdempotencyService(prisma);

      const isNew = await service.recordIfNew(sampleEvent);

      expect(isNew).toBe(true);
      expect(prisma.client.stripeWebhookEvent.create).toHaveBeenCalledWith({
        data: { stripeEventId: 'evt_1', type: 'customer.subscription.updated', payload: sampleEvent, status: 'PENDING' },
      });
    });

    it('returns false (absorbs the duplicate) on a unique-constraint violation, without throwing', async () => {
      const prisma = buildPrismaMock({ create: jest.fn().mockRejectedValue(buildUniqueConstraintError()) });
      const service = new WebhookIdempotencyService(prisma);

      const isNew = await service.recordIfNew(sampleEvent);

      expect(isNew).toBe(false);
    });

    it('rethrows any other database error rather than silently swallowing it', async () => {
      const prisma = buildPrismaMock({ create: jest.fn().mockRejectedValue(new Error('connection lost')) });
      const service = new WebhookIdempotencyService(prisma);

      await expect(service.recordIfNew(sampleEvent)).rejects.toThrow('connection lost');
    });
  });

  describe('markProcessed / markIgnored / markFailed', () => {
    it('marks a processed event with a timestamp', async () => {
      const prisma = buildPrismaMock();
      const service = new WebhookIdempotencyService(prisma);

      await service.markProcessed('evt_1');

      expect(prisma.client.stripeWebhookEvent.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_1' },
        data: { status: 'PROCESSED', processedAt: expect.any(Date) },
      });
    });

    it('marks an ignored (unhandled type) event, not as a failure', async () => {
      const prisma = buildPrismaMock();
      const service = new WebhookIdempotencyService(prisma);

      await service.markIgnored('evt_1');

      expect(prisma.client.stripeWebhookEvent.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_1' },
        data: { status: 'IGNORED', processedAt: expect.any(Date) },
      });
    });

    it('records the error message on a failed event', async () => {
      const prisma = buildPrismaMock();
      const service = new WebhookIdempotencyService(prisma);

      await service.markFailed('evt_1', 'database unavailable');

      expect(prisma.client.stripeWebhookEvent.update).toHaveBeenCalledWith({
        where: { stripeEventId: 'evt_1' },
        data: { status: 'FAILED', processingError: 'database unavailable' },
      });
    });
  });
});
