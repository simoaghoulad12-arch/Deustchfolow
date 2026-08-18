import { Injectable, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { SubscriptionService } from '../subscriptions/subscription.service';
import { ConnectAccountService } from '../connect/connect-account.service';
import { BookingPaymentService } from '../booking-payments/booking-payment.service';

/**
 * Routes a verified, not-yet-processed Stripe event to the handler for
 * its domain. Every event type this dispatcher does not recognize is
 * explicitly "handled" by doing nothing and reporting `handled: false`
 * — the caller (StripeWebhookController) records that as IGNORED, not
 * silently dropped and not a failure. Event types for booking payments,
 * refunds, and Connect accounts are wired in as their respective
 * subphases (6.6-6.9) land; this dispatcher grows, it is not
 * restructured, each time.
 */
@Injectable()
export class WebhookDispatcherService {
  private readonly logger = new Logger('StripeWebhook');

  constructor(
    private readonly subscriptions: SubscriptionService,
    private readonly connectAccounts: ConnectAccountService,
    private readonly bookingPayments: BookingPaymentService,
  ) {}

  /** Returns true if this event type was recognized and dispatched
   * (regardless of whether the underlying object represented a
   * business-relevant change), false if the type is not yet handled. */
  async dispatch(event: Stripe.Event): Promise<boolean> {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id;
        if (!priceId) {
          this.logger.error(
            JSON.stringify({ event: 'subscription_event_missing_price', stripeSubscriptionId: subscription.id }),
          );
          return true;
        }
        await this.subscriptions.upsertFromStripeSubscription({
          id: subscription.id,
          status: subscription.status,
          customer: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
          currentPeriodEnd: subscription.current_period_end,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          priceId,
        });
        return true;
      }
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await this.connectAccounts.upsertFromStripeAccount({
          stripeAccountId: account.id,
          chargesEnabled: account.charges_enabled ?? false,
          payoutsEnabled: account.payouts_enabled ?? false,
          detailsSubmitted: account.details_submitted ?? false,
        });
        return true;
      }
      case 'payment_intent.succeeded':
      case 'payment_intent.payment_failed':
      case 'payment_intent.canceled':
      case 'payment_intent.processing': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.bookingPayments.upsertFromPaymentIntent({
          id: paymentIntent.id,
          status: paymentIntent.status,
          bookingId: paymentIntent.metadata?.bookingId,
        });
        return true;
      }
      default:
        return false;
    }
  }
}
