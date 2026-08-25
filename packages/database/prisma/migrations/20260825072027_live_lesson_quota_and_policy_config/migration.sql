-- CreateEnum
CREATE TYPE "LiveLessonQuotaConsumptionStatus" AS ENUM ('ACTIVE', 'RELEASED');

-- AlterTable
ALTER TABLE "payment_policies" ADD COLUMN     "premium_weekly_live_minutes" INTEGER NOT NULL DEFAULT 60,
ADD COLUMN     "pro_weekly_live_minutes" INTEGER NOT NULL DEFAULT 120;

-- CreateTable
CREATE TABLE "live_lesson_quota_consumptions" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "minutes_consumed" INTEGER NOT NULL,
    "week_start" TIMESTAMPTZ NOT NULL,
    "status" "LiveLessonQuotaConsumptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_lesson_quota_consumptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "live_lesson_quota_consumptions_bookingId_key" ON "live_lesson_quota_consumptions"("bookingId");

-- CreateIndex
CREATE INDEX "live_lesson_quota_consumptions_userId_week_start_status_idx" ON "live_lesson_quota_consumptions"("userId", "week_start", "status");

-- AddForeignKey
ALTER TABLE "live_lesson_quota_consumptions" ADD CONSTRAINT "live_lesson_quota_consumptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "live_lesson_quota_consumptions" ADD CONSTRAINT "live_lesson_quota_consumptions_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
