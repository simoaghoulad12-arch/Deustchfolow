import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { StripeService } from './stripe/stripe.service';
import { StripeCustomerService } from './customers/stripe-customer.service';
import { PaymentPolicyService } from './policy/payment-policy.service';
import { SubscriptionService } from './subscriptions/subscription.service';
import { CheckoutService } from './checkout/checkout.service';
import { PaymentsController } from './payments.controller';
import { WebhookSignatureService } from './webhooks/webhook-signature.service';
import { WebhookIdempotencyService } from './webhooks/webhook-idempotency.service';
import { WebhookDispatcherService } from './webhooks/webhook-dispatcher.service';
import { StripeWebhookController } from './webhooks/stripe-webhook.controller';
import { ConnectAccountService } from './connect/connect-account.service';
import { ConnectController } from './connect/connect.controller';

/**
 * Payments & Monetization (Phase 6). Built up subphase by subphase —
 * see docs/architecture-decisions/phase-6-implementation.md. This
 * module currently exports the foundation every later subphase
 * (webhooks, Connect, booking payments, refunds, payouts) is built on:
 * the Stripe SDK wrapper, the Customer relationship, the configurable
 * business-rule policy, the Subscription lifecycle, and subscription
 * checkout.
 */
@Module({
  imports: [
    // Burst-abuse protection for checkout-session creation only (see
    // PaymentsThrottlerGuard) — a lower ceiling than AI's 20/min since
    // legitimate checkout attempts are rare per user.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
  ],
  controllers: [PaymentsController, StripeWebhookController, ConnectController],
  providers: [
    StripeService,
    StripeCustomerService,
    PaymentPolicyService,
    SubscriptionService,
    CheckoutService,
    WebhookSignatureService,
    WebhookIdempotencyService,
    WebhookDispatcherService,
    ConnectAccountService,
  ],
  exports: [
    StripeService,
    StripeCustomerService,
    PaymentPolicyService,
    SubscriptionService,
    CheckoutService,
    ConnectAccountService,
  ],
})
export class PaymentsModule {}
