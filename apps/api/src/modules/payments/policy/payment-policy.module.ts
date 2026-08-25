import { Module } from '@nestjs/common';
import { PaymentPolicyService } from './payment-policy.service';
import { PaymentPolicyController } from './payment-policy.controller';

/**
 * Deliberately its own module, not folded into PaymentsModule.
 * PaymentPolicyService's only dependency is PrismaService (global), so
 * it can sit as a leaf module that both EntitlementsModule (needs the
 * PAST_DUE grace period and the PRO/MAX weekly live-lesson quota
 * minutes) and PaymentsModule (needs everything else on the row) import
 * independently. Folding it into PaymentsModule would make
 * EntitlementsModule depend on the entire Payments module — and once
 * PaymentsModule needs EntitlementsService in turn (Phase 7's booking
 * flow checking live-lesson quota before falling back to paid
 * checkout), that becomes a circular module import. This split keeps
 * the dependency graph a DAG: PaymentPolicyModule -> EntitlementsModule
 * -> PaymentsModule, plus PaymentsModule -> PaymentPolicyModule
 * directly for its own other consumers (RefundService,
 * BookingPaymentService, ...).
 */
@Module({
  controllers: [PaymentPolicyController],
  providers: [PaymentPolicyService],
  exports: [PaymentPolicyService],
})
export class PaymentPolicyModule {}
