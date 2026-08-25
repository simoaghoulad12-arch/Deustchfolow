import { Module } from '@nestjs/common';
import { PaymentPolicyModule } from '../payments/policy/payment-policy.module';
import { EntitlementsService } from './entitlements.service';
import { EntitlementsController } from './entitlements.controller';
import { SubscriptionController } from './subscription.controller';

/**
 * The Subscription -> Entitlement layer (see architecture decision
 * record, section 1). Deliberately its own module: distinct from
 * `users` (identity) and from `payments` (the Stripe integration itself)
 * — Subscription/Entitlements is a separate concern from both. Imports
 * only PaymentPolicyModule (Phase 6.11), not the whole PaymentsModule —
 * the PAST_DUE grace-period length and the PRO/MAX weekly live-lesson
 * quota are configurable, never hardcoded here. Importing all of
 * PaymentsModule would create a circular module import once
 * PaymentsModule needs EntitlementsService in turn (Phase 7's booking
 * flow) — see payment-policy.module.ts for the full reasoning.
 */
@Module({
  imports: [PaymentPolicyModule],
  controllers: [EntitlementsController, SubscriptionController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
