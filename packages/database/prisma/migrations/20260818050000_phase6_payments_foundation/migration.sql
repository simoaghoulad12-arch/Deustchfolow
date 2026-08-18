-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('REQUIRES_PAYMENT_METHOD', 'REQUIRES_CONFIRMATION', 'PROCESSING', 'SUCCEEDED', 'CANCELED', 'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "RefundInitiatorRole" AS ENUM ('STUDENT', 'SUPPORT', 'ADMIN', 'SYSTEM');

-- CreateEnum
CREATE TYPE "TutorConnectAccountStatus" AS ENUM ('ONBOARDING_INCOMPLETE', 'RESTRICTED', 'ENABLED');

-- CreateEnum
CREATE TYPE "TutorPayoutStatus" AS ENUM ('PENDING', 'IN_TRANSIT', 'PAID', 'FAILED', 'CANCELED');

-- CreateEnum
CREATE TYPE "WebhookProcessingStatus" AS ENUM ('PENDING', 'PROCESSED', 'FAILED', 'IGNORED');

-- AlterEnum
BEGIN;
CREATE TYPE "SubscriptionStatus_new" AS ENUM ('INCOMPLETE', 'INCOMPLETE_EXPIRED', 'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID');
ALTER TABLE "subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "status" TYPE "SubscriptionStatus_new" USING ("status"::text::"SubscriptionStatus_new");
ALTER TYPE "SubscriptionStatus" RENAME TO "SubscriptionStatus_old";
ALTER TYPE "SubscriptionStatus_new" RENAME TO "SubscriptionStatus";
DROP TYPE "SubscriptionStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;

-- AlterTable
ALTER TABLE "subscriptions" ADD COLUMN     "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "current_period_end" TIMESTAMPTZ,
ADD COLUMN     "past_due_since" TIMESTAMPTZ,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateTable
CREATE TABLE "stripe_customers" (
    "userId" UUID NOT NULL,
    "stripe_customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_customers_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "tutor_connected_accounts" (
    "tutorId" UUID NOT NULL,
    "stripe_account_id" TEXT NOT NULL,
    "status" "TutorConnectAccountStatus" NOT NULL DEFAULT 'ONBOARDING_INCOMPLETE',
    "charges_enabled" BOOLEAN NOT NULL DEFAULT false,
    "payouts_enabled" BOOLEAN NOT NULL DEFAULT false,
    "details_submitted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_connected_accounts_pkey" PRIMARY KEY ("tutorId")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "stripe_payment_intent_id" TEXT NOT NULL,
    "stripe_charge_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "application_fee_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD',
    "disputed_at" TIMESTAMPTZ,
    "dispute_status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refunds" (
    "id" UUID NOT NULL,
    "paymentId" UUID NOT NULL,
    "stripe_refund_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "reason" TEXT,
    "initiated_by_user_id" UUID NOT NULL,
    "initiated_by_role" "RefundInitiatorRole" NOT NULL,
    "required_admin_approval" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_payouts" (
    "id" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "paymentId" UUID,
    "stripe_transfer_id" TEXT,
    "stripe_payout_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "status" "TutorPayoutStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stripe_webhook_events" (
    "id" UUID NOT NULL,
    "stripe_event_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "WebhookProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processing_error" TEXT,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "stripe_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_policies" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "commission_basis_points" INTEGER NOT NULL DEFAULT 2000,
    "support_refund_limit_cents" INTEGER NOT NULL DEFAULT 5000,
    "past_due_grace_period_days" INTEGER NOT NULL DEFAULT 7,
    "abandoned_booking_ttl_minutes" INTEGER NOT NULL DEFAULT 15,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_user_id" UUID,

    CONSTRAINT "payment_policies_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stripe_customers_stripe_customer_id_key" ON "stripe_customers"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_connected_accounts_stripe_account_id_key" ON "tutor_connected_accounts"("stripe_account_id");

-- CreateIndex
CREATE INDEX "tutor_connected_accounts_status_idx" ON "tutor_connected_accounts"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_bookingId_key" ON "payments"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_payment_intent_id_key" ON "payments"("stripe_payment_intent_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "refunds_stripe_refund_id_key" ON "refunds"("stripe_refund_id");

-- CreateIndex
CREATE INDEX "refunds_paymentId_idx" ON "refunds"("paymentId");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_payouts_stripe_transfer_id_key" ON "tutor_payouts"("stripe_transfer_id");

-- CreateIndex
CREATE UNIQUE INDEX "tutor_payouts_stripe_payout_id_key" ON "tutor_payouts"("stripe_payout_id");

-- CreateIndex
CREATE INDEX "tutor_payouts_tutorId_idx" ON "tutor_payouts"("tutorId");

-- CreateIndex
CREATE UNIQUE INDEX "stripe_webhook_events_stripe_event_id_key" ON "stripe_webhook_events"("stripe_event_id");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_type_idx" ON "stripe_webhook_events"("type");

-- CreateIndex
CREATE INDEX "stripe_webhook_events_status_idx" ON "stripe_webhook_events"("status");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_stripe_subscription_id_key" ON "subscriptions"("stripe_subscription_id");

-- AddForeignKey
ALTER TABLE "stripe_customers" ADD CONSTRAINT "stripe_customers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_connected_accounts" ADD CONSTRAINT "tutor_connected_accounts_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refunds" ADD CONSTRAINT "refunds_initiated_by_user_id_fkey" FOREIGN KEY ("initiated_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_payouts" ADD CONSTRAINT "tutor_payouts_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_connected_accounts"("tutorId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_payouts" ADD CONSTRAINT "tutor_payouts_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

