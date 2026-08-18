import type Stripe from 'stripe';
import { WebhookDispatcherService } from '../webhook-dispatcher.service';
import type { SubscriptionService } from '../../subscriptions/subscription.service';

function buildSubscriptionsMock() {
  return {
    upsertFromStripeSubscription: jest.fn().mockResolvedValue(undefined),
  } as unknown as SubscriptionService;
}

function buildSubscriptionEvent(type: string, overrides?: Partial<Stripe.Subscription>): Stripe.Event {
  return {
    id: 'evt_1',
    type,
    data: {
      object: {
        id: 'sub_123',
        status: 'active',
        customer: 'cus_1',
        current_period_end: 1_800_000_000,
        cancel_at_period_end: false,
        items: { data: [{ price: { id: 'price_premium_test' } }] },
        ...overrides,
      },
    },
  } as unknown as Stripe.Event;
}

describe('WebhookDispatcherService', () => {
  it.each(['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted'])(
    'dispatches %s to SubscriptionService.upsertFromStripeSubscription',
    async (type) => {
      const subscriptions = buildSubscriptionsMock();
      const dispatcher = new WebhookDispatcherService(subscriptions);

      const handled = await dispatcher.dispatch(buildSubscriptionEvent(type));

      expect(handled).toBe(true);
      expect(subscriptions.upsertFromStripeSubscription).toHaveBeenCalledWith({
        id: 'sub_123',
        status: 'active',
        customer: 'cus_1',
        currentPeriodEnd: 1_800_000_000,
        cancelAtPeriodEnd: false,
        priceId: 'price_premium_test',
      });
    },
  );

  it('handles a Customer object passed instead of a customer id string (unexpanded vs expanded field)', async () => {
    const subscriptions = buildSubscriptionsMock();
    const dispatcher = new WebhookDispatcherService(subscriptions);

    const event = buildSubscriptionEvent('customer.subscription.updated', {
      customer: { id: 'cus_expanded' } as unknown as string,
    });

    await dispatcher.dispatch(event);

    expect(subscriptions.upsertFromStripeSubscription).toHaveBeenCalledWith(
      expect.objectContaining({ customer: 'cus_expanded' }),
    );
  });

  it('returns false (not an error) for an event type it does not yet handle', async () => {
    const subscriptions = buildSubscriptionsMock();
    const dispatcher = new WebhookDispatcherService(subscriptions);

    const handled = await dispatcher.dispatch({ id: 'evt_2', type: 'charge.succeeded', data: { object: {} } } as unknown as Stripe.Event);

    expect(handled).toBe(false);
    expect(subscriptions.upsertFromStripeSubscription).not.toHaveBeenCalled();
  });

  it('logs and skips (does not throw) a subscription event with no price on the first item', async () => {
    const subscriptions = buildSubscriptionsMock();
    const dispatcher = new WebhookDispatcherService(subscriptions);

    const event = buildSubscriptionEvent('customer.subscription.updated', {
      items: { data: [] } as unknown as Stripe.Subscription['items'],
    });

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(subscriptions.upsertFromStripeSubscription).not.toHaveBeenCalled();
  });
});
