import { Module } from '@nestjs/common';
import { StripeService } from './stripe/stripe.service';
import { StripeCustomerService } from './customers/stripe-customer.service';
import { PaymentPolicyService } from './policy/payment-policy.service';

/**
 * Payments & Monetization (Phase 6). Built up subphase by subphase —
 * see docs/architecture-decisions/phase-6-implementation.md. This
 * module currently exports the foundation every later subphase
 * (subscriptions, checkout, webhooks, Connect, refunds, payouts) is
 * built on: the Stripe SDK wrapper, the Customer relationship, and the
 * configurable business-rule policy.
 */
@Module({
  providers: [StripeService, StripeCustomerService, PaymentPolicyService],
  exports: [StripeService, StripeCustomerService, PaymentPolicyService],
})
export class PaymentsModule {}
