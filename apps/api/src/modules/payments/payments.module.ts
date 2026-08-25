import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { PaymentPolicyModule } from './policy/payment-policy.module';
import { StripeService } from './stripe/stripe.service';
import { StripeCustomerService } from './customers/stripe-customer.service';
import { SubscriptionService } from './subscriptions/subscription.service';
import { CheckoutService } from './checkout/checkout.service';
import { PaymentsController } from './payments.controller';
import { WebhookSignatureService } from './webhooks/webhook-signature.service';
import { WebhookIdempotencyService } from './webhooks/webhook-idempotency.service';
import { WebhookDispatcherService } from './webhooks/webhook-dispatcher.service';
import { StripeWebhookController } from './webhooks/stripe-webhook.controller';
import { ConnectAccountService } from './connect/connect-account.service';
import { ConnectController } from './connect/connect.controller';
import { BookingPaymentService } from './booking-payments/booking-payment.service';
import { AbandonedBookingCleanupService } from './booking-payments/abandoned-booking-cleanup.service';
import { RefundService } from './refunds/refund.service';
import { TutorPayoutService } from './payouts/tutor-payout.service';
import { PayoutsController } from './payouts/payouts.controller';
import { AdminPaymentsService } from './admin/admin-payments.service';
import { AdminPaymentsController } from './admin/admin-payments.controller';
import { LiveLessonQuotaService } from './live-lessons/live-lesson-quota.service';

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
    // Registered once, here — the only module in this codebase using
    // scheduled jobs (AbandonedBookingCleanupService).
    ScheduleModule.forRoot(),
    // Its own module (not folded in here) so EntitlementsModule can
    // depend on just this, not all of PaymentsModule — see
    // payment-policy.module.ts.
    PaymentPolicyModule,
    // For LiveLessonQuotaService's callers (Phase 7): the booking flow
    // needs the student's resolved plan before deciding quota vs. paid
    // checkout. Safe to import here — EntitlementsModule itself only
    // depends on the leaf PaymentPolicyModule, not back on this module.
    EntitlementsModule,
  ],
  controllers: [PaymentsController, StripeWebhookController, ConnectController, PayoutsController, AdminPaymentsController],
  providers: [
    StripeService,
    StripeCustomerService,
    SubscriptionService,
    CheckoutService,
    WebhookSignatureService,
    WebhookIdempotencyService,
    WebhookDispatcherService,
    ConnectAccountService,
    BookingPaymentService,
    AbandonedBookingCleanupService,
    RefundService,
    TutorPayoutService,
    AdminPaymentsService,
    LiveLessonQuotaService,
  ],
  exports: [
    StripeService,
    StripeCustomerService,
    SubscriptionService,
    CheckoutService,
    ConnectAccountService,
    BookingPaymentService,
    RefundService,
    TutorPayoutService,
    LiveLessonQuotaService,
  ],
})
export class PaymentsModule {}
