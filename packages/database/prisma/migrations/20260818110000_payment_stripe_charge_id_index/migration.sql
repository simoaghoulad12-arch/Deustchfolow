-- Phase 6.5 audit finding: TutorPayoutService.recordTransfer looks up
-- payments.stripe_charge_id on every transfer.created webhook with no
-- supporting index — a full table scan at scale.
CREATE INDEX "payments_stripe_charge_id_idx" ON "payments"("stripe_charge_id");
