import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { StripeCustomerService } from './customers/stripe-customer.service';
import { PaymentPolicyService } from './policy/payment-policy.service';
import { SubscriptionService } from './subscriptions/subscription.service';

/**
 * Payments & Monetization (Phase 6). Built up subphase by subphase —
 * see docs/architecture-decisions/phase-6-implementation.md. This
 * module currently exports the foundation every later subphase
 * (checkout, webhooks, Connect, refunds, payouts) is built on: the
 * Stripe SDK wrapper, the Customer relationship, the configurable
 * business-rule policy, and the Subscription lifecycle.
 */
@Module({
  providers: [StripeService, StripeCustomerService, PaymentPolicyService, SubscriptionService],
  exports: [StripeService, StripeCustomerService, PaymentPolicyService, SubscriptionService],
})
export class PaymentsModule {}
