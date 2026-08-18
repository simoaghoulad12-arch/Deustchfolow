import type Stripe from 'stripe';
import { WebhookDispatcherService } from '../webhook-dispatcher.service';
import type { SubscriptionService } from '../../subscriptions/subscription.service';
import type { ConnectAccountService } from '../../connect/connect-account.service';
import type { BookingPaymentService } from '../../booking-payments/booking-payment.service';
import type { RefundService } from '../../refunds/refund.service';
import type { TutorPayoutService } from '../../payouts/tutor-payout.service';

function buildRefundsMock() {
  return {
    upsertFromStripeRefund: jest.fn().mockResolvedValue(undefined),
    recordDispute: jest.fn().mockResolvedValue(undefined),
  } as unknown as RefundService;
}

function buildPayoutsMock() {
  return {
    recordTransfer: jest.fn().mockResolvedValue(undefined),
    recordPayoutOutcome: jest.fn().mockResolvedValue(undefined),
  } as unknown as TutorPayoutService;
}

function buildSubscriptionsMock() {
  return {
    upsertFromStripeSubscription: jest.fn().mockResolvedValue(undefined),
  } as unknown as SubscriptionService;
}

function buildConnectAccountsMock() {
  return {
    upsertFromStripeAccount: jest.fn().mockResolvedValue(undefined),
  } as unknown as ConnectAccountService;
}

function buildBookingPaymentsMock() {
  return {
    upsertFromPaymentIntent: jest.fn().mockResolvedValue(undefined),
  } as unknown as BookingPaymentService;
}

function buildDispatcher(overrides?: {
  subscriptions?: SubscriptionService;
  connectAccounts?: ConnectAccountService;
  bookingPayments?: BookingPaymentService;
  refunds?: RefundService;
  payouts?: TutorPayoutService;
}) {
  return new WebhookDispatcherService(
    overrides?.subscriptions ?? buildSubscriptionsMock(),
    overrides?.connectAccounts ?? buildConnectAccountsMock(),
    overrides?.bookingPayments ?? buildBookingPaymentsMock(),
    overrides?.refunds ?? buildRefundsMock(),
    overrides?.payouts ?? buildPayoutsMock(),
  );
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
      const dispatcher = buildDispatcher({ subscriptions });

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
    const dispatcher = buildDispatcher({ subscriptions });

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
    const dispatcher = buildDispatcher({ subscriptions });

    const handled = await dispatcher.dispatch({ id: 'evt_2', type: 'charge.succeeded', data: { object: {} } } as unknown as Stripe.Event);

    expect(handled).toBe(false);
    expect(subscriptions.upsertFromStripeSubscription).not.toHaveBeenCalled();
  });

  it('logs and skips (does not throw) a subscription event with no price on the first item', async () => {
    const subscriptions = buildSubscriptionsMock();
    const dispatcher = buildDispatcher({ subscriptions });

    const event = buildSubscriptionEvent('customer.subscription.updated', {
      items: { data: [] } as unknown as Stripe.Subscription['items'],
    });

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(subscriptions.upsertFromStripeSubscription).not.toHaveBeenCalled();
  });

  it('dispatches account.updated to ConnectAccountService.upsertFromStripeAccount', async () => {
    const connectAccounts = buildConnectAccountsMock();
    const dispatcher = buildDispatcher({ connectAccounts });

    const event = {
      id: 'evt_3',
      type: 'account.updated',
      data: {
        object: { id: 'acct_1', charges_enabled: true, payouts_enabled: false, details_submitted: true },
      },
    } as unknown as Stripe.Event;

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(connectAccounts.upsertFromStripeAccount).toHaveBeenCalledWith({
      stripeAccountId: 'acct_1',
      chargesEnabled: true,
      payoutsEnabled: false,
      detailsSubmitted: true,
    });
  });

  it('treats missing capability flags on account.updated as false rather than undefined', async () => {
    const connectAccounts = buildConnectAccountsMock();
    const dispatcher = buildDispatcher({ connectAccounts });

    const event = {
      id: 'evt_4',
      type: 'account.updated',
      data: { object: { id: 'acct_2' } },
    } as unknown as Stripe.Event;

    await dispatcher.dispatch(event);

    expect(connectAccounts.upsertFromStripeAccount).toHaveBeenCalledWith({
      stripeAccountId: 'acct_2',
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
    });
  });

  it.each(['payment_intent.succeeded', 'payment_intent.payment_failed', 'payment_intent.canceled', 'payment_intent.processing'])(
    'dispatches %s to BookingPaymentService.upsertFromPaymentIntent',
    async (type) => {
      const bookingPayments = buildBookingPaymentsMock();
      const dispatcher = buildDispatcher({ bookingPayments });

      const event = {
        id: 'evt_5',
        type,
        data: { object: { id: 'pi_1', status: 'succeeded', metadata: { bookingId: 'booking-1' }, latest_charge: 'ch_1' } },
      } as unknown as Stripe.Event;

      const handled = await dispatcher.dispatch(event);

      expect(handled).toBe(true);
      expect(bookingPayments.upsertFromPaymentIntent).toHaveBeenCalledWith({
        id: 'pi_1',
        status: 'succeeded',
        bookingId: 'booking-1',
        chargeId: 'ch_1',
      });
    },
  );

  it('passes undefined bookingId and chargeId through when a PaymentIntent has no metadata/charge at all', async () => {
    const bookingPayments = buildBookingPaymentsMock();
    const dispatcher = buildDispatcher({ bookingPayments });

    const event = {
      id: 'evt_6',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_2', status: 'succeeded' } },
    } as unknown as Stripe.Event;

    await dispatcher.dispatch(event);

    expect(bookingPayments.upsertFromPaymentIntent).toHaveBeenCalledWith({
      id: 'pi_2',
      status: 'succeeded',
      bookingId: undefined,
      chargeId: undefined,
    });
  });

  it('handles an expanded (object, not string) latest_charge on a payment_intent event', async () => {
    const bookingPayments = buildBookingPaymentsMock();
    const dispatcher = buildDispatcher({ bookingPayments });

    const event = {
      id: 'evt_10',
      type: 'payment_intent.succeeded',
      data: { object: { id: 'pi_3', status: 'succeeded', latest_charge: { id: 'ch_expanded' } } },
    } as unknown as Stripe.Event;

    await dispatcher.dispatch(event);

    expect(bookingPayments.upsertFromPaymentIntent).toHaveBeenCalledWith(
      expect.objectContaining({ chargeId: 'ch_expanded' }),
    );
  });

  it('dispatches refund.updated to RefundService.upsertFromStripeRefund', async () => {
    const refunds = buildRefundsMock();
    const dispatcher = buildDispatcher({ refunds });

    const event = {
      id: 'evt_7',
      type: 'refund.updated',
      data: { object: { id: 're_1', status: 'succeeded' } },
    } as unknown as Stripe.Event;

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(refunds.upsertFromStripeRefund).toHaveBeenCalledWith('re_1', 'succeeded');
  });

  it.each(['charge.dispute.created', 'charge.dispute.updated', 'charge.dispute.closed'])(
    'dispatches %s to RefundService.recordDispute with the payment_intent id',
    async (type) => {
      const refunds = buildRefundsMock();
      const dispatcher = buildDispatcher({ refunds });

      const event = {
        id: 'evt_8',
        type,
        data: { object: { id: 'dp_1', status: 'needs_response', payment_intent: 'pi_1' } },
      } as unknown as Stripe.Event;

      const handled = await dispatcher.dispatch(event);

      expect(handled).toBe(true);
      expect(refunds.recordDispute).toHaveBeenCalledWith('pi_1', 'needs_response');
    },
  );

  it('handles an expanded (object, not string) payment_intent on a dispute event', async () => {
    const refunds = buildRefundsMock();
    const dispatcher = buildDispatcher({ refunds });

    const event = {
      id: 'evt_9',
      type: 'charge.dispute.created',
      data: { object: { id: 'dp_2', status: 'needs_response', payment_intent: { id: 'pi_expanded' } } },
    } as unknown as Stripe.Event;

    await dispatcher.dispatch(event);

    expect(refunds.recordDispute).toHaveBeenCalledWith('pi_expanded', 'needs_response');
  });

  it('dispatches transfer.created to TutorPayoutService.recordTransfer with a string destination/source_transaction', async () => {
    const payouts = buildPayoutsMock();
    const dispatcher = buildDispatcher({ payouts });

    const event = {
      id: 'evt_11',
      type: 'transfer.created',
      data: {
        object: { id: 'tr_1', destination: 'acct_1', source_transaction: 'ch_1', amount: 4500, currency: 'eur' },
      },
    } as unknown as Stripe.Event;

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(payouts.recordTransfer).toHaveBeenCalledWith({
      stripeTransferId: 'tr_1',
      stripeAccountId: 'acct_1',
      sourceChargeId: 'ch_1',
      amountCents: 4500,
      currency: 'eur',
    });
  });

  it('handles expanded (object, not string) destination/source_transaction on transfer.created', async () => {
    const payouts = buildPayoutsMock();
    const dispatcher = buildDispatcher({ payouts });

    const event = {
      id: 'evt_12',
      type: 'transfer.created',
      data: {
        object: {
          id: 'tr_2',
          destination: { id: 'acct_expanded' },
          source_transaction: { id: 'ch_expanded' },
          amount: 1000,
          currency: 'eur',
        },
      },
    } as unknown as Stripe.Event;

    await dispatcher.dispatch(event);

    expect(payouts.recordTransfer).toHaveBeenCalledWith(
      expect.objectContaining({ stripeAccountId: 'acct_expanded', sourceChargeId: 'ch_expanded' }),
    );
  });

  it.each([
    ['payout.paid', 'PAID'],
    ['payout.failed', 'FAILED'],
  ])('dispatches %s to TutorPayoutService.recordPayoutOutcome as %s', async (type, expectedStatus) => {
    const payouts = buildPayoutsMock();
    const dispatcher = buildDispatcher({ payouts });

    const event = {
      id: 'evt_13',
      type,
      account: 'acct_1',
      data: { object: { id: 'po_1', amount: 9900, currency: 'eur' } },
    } as unknown as Stripe.Event;

    const handled = await dispatcher.dispatch(event);

    expect(handled).toBe(true);
    expect(payouts.recordPayoutOutcome).toHaveBeenCalledWith({
      stripePayoutId: 'po_1',
      stripeAccountId: 'acct_1',
      amountCents: 9900,
      currency: 'eur',
      status: expectedStatus,
    });
  });
});
