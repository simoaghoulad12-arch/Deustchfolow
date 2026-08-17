-- CreateEnum
CREATE TYPE "TutorVerificationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TutorSpecialty" AS ENUM ('CONVERSATION', 'EXAM_PREPARATION', 'APPLICATION_COACHING', 'PRONUNCIATION', 'BUSINESS_GERMAN', 'EVERYDAY_GERMAN', 'PROFESSIONAL_GERMAN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REFUND_PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "GermanyGoalType" AS ENUM ('WORK', 'STUDY', 'APPRENTICESHIP', 'FAMILY', 'LANGUAGE', 'JOB_SEARCH', 'OTHER');

-- CreateEnum
CREATE TYPE "GermanyPathStep" AS ENUM ('ORIENTATION', 'GERMAN_LEVEL', 'QUALIFICATION_CHECK', 'JOB_OR_APPRENTICESHIP', 'DOCUMENTS', 'VISA_RESIDENCE_CHECK', 'ENTRY', 'FIRST_STEPS', 'GERMANY_EVERYDAY_LIFE');

-- CreateEnum
CREATE TYPE "OfficialSourceTopic" AS ENUM ('VISA', 'WORK_PERMIT', 'RECOGNITION_OF_QUALIFICATIONS', 'JOB_SEARCH', 'HOUSING', 'HEALTH_INSURANCE', 'LANGUAGE', 'GENERAL');

-- CreateEnum
CREATE TYPE "DocumentRequirementStatus" AS ENUM ('MISSING', 'UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'EXPIRED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "SimulationCategory" AS ENUM ('HOUSING', 'DOCTOR', 'BANK', 'GOVERNMENT_OFFICE', 'TRANSPORT', 'SHOPPING', 'PHONE_CALL', 'WORK', 'STUDY', 'PACKAGE', 'NEIGHBORS');

-- CreateEnum
CREATE TYPE "CareerModuleType" AS ENUM ('CV', 'COVER_LETTER', 'INTERVIEW', 'WORKPLACE_GERMAN', 'PROFESSIONAL_EMAIL');

-- AlterTable
ALTER TABLE "conversation_sessions" ADD COLUMN     "simulationId" UUID;

-- CreateTable
CREATE TABLE "tutor_profiles" (
    "userId" UUID NOT NULL,
    "headline" TEXT,
    "aboutMe" TEXT,
    "languages" TEXT[],
    "teaching_levels" "CEFRLevel"[],
    "specialties" "TutorSpecialty"[],
    "years_experience" INTEGER,
    "timezone" TEXT NOT NULL,
    "verification_status" "TutorVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tutor_profiles_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "tutor_verification_documents" (
    "id" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "storage_key" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_verification_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_availability_rules" (
    "id" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "weekday" INTEGER NOT NULL,
    "start_minute" INTEGER NOT NULL,
    "end_minute" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tutor_availability_exceptions" (
    "id" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "is_blocked" BOOLEAN NOT NULL DEFAULT true,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tutor_availability_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offerings" (
    "id" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "TutorSpecialty" NOT NULL,
    "duration_minutes" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "cefr_levels" "CEFRLevel"[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "offeringId" UUID NOT NULL,
    "start_at" TIMESTAMPTZ NOT NULL,
    "end_at" TIMESTAMPTZ NOT NULL,
    "student_timezone" TEXT NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" UUID NOT NULL,
    "bookingId" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "tutorId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "is_hidden" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "germany_paths" (
    "userId" UUID NOT NULL,
    "goal_type" "GermanyGoalType" NOT NULL,
    "current_step" "GermanyPathStep" NOT NULL DEFAULT 'ORIENTATION',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "germany_paths_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "official_sources" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "authority" TEXT NOT NULL,
    "topic" "OfficialSourceTopic" NOT NULL,
    "language" TEXT NOT NULL,
    "last_verified_at" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "official_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_requirements" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "document_type" TEXT NOT NULL,
    "goal" "GermanyGoalType" NOT NULL,
    "context" TEXT,
    "status" "DocumentRequirementStatus" NOT NULL DEFAULT 'MISSING',
    "source_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "document_requirements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulations" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "category" "SimulationCategory" NOT NULL,
    "cefr_level" "CEFRLevel" NOT NULL,
    "situation" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "roles" TEXT[],
    "expected_skills" "LearningSkill"[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "career_modules" (
    "id" UUID NOT NULL,
    "type" "CareerModuleType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cefr_level" "CEFRLevel",
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "career_modules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tutor_profiles_verification_status_idx" ON "tutor_profiles"("verification_status");

-- CreateIndex
CREATE INDEX "tutor_profiles_is_active_idx" ON "tutor_profiles"("is_active");

-- CreateIndex
CREATE INDEX "tutor_verification_documents_tutorId_idx" ON "tutor_verification_documents"("tutorId");

-- CreateIndex
CREATE INDEX "tutor_availability_rules_tutorId_idx" ON "tutor_availability_rules"("tutorId");

-- CreateIndex
CREATE INDEX "tutor_availability_exceptions_tutorId_start_at_idx" ON "tutor_availability_exceptions"("tutorId", "start_at");

-- CreateIndex
CREATE INDEX "offerings_tutorId_idx" ON "offerings"("tutorId");

-- CreateIndex
CREATE INDEX "offerings_is_active_idx" ON "offerings"("is_active");

-- CreateIndex
CREATE INDEX "bookings_tutorId_start_at_idx" ON "bookings"("tutorId", "start_at");

-- CreateIndex
CREATE INDEX "bookings_studentId_idx" ON "bookings"("studentId");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "reviews_tutorId_idx" ON "reviews"("tutorId");

-- CreateIndex
CREATE INDEX "official_sources_topic_idx" ON "official_sources"("topic");

-- CreateIndex
CREATE INDEX "official_sources_active_idx" ON "official_sources"("active");

-- CreateIndex
CREATE INDEX "document_requirements_userId_idx" ON "document_requirements"("userId");

-- CreateIndex
CREATE INDEX "simulations_category_idx" ON "simulations"("category");

-- CreateIndex
CREATE INDEX "simulations_cefr_level_idx" ON "simulations"("cefr_level");

-- CreateIndex
CREATE INDEX "career_modules_type_idx" ON "career_modules"("type");

-- CreateIndex
CREATE INDEX "conversation_sessions_simulationId_idx" ON "conversation_sessions"("simulationId");

-- AddForeignKey
ALTER TABLE "conversation_sessions" ADD CONSTRAINT "conversation_sessions_simulationId_fkey" FOREIGN KEY ("simulationId") REFERENCES "simulations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_profiles" ADD CONSTRAINT "tutor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_verification_documents" ADD CONSTRAINT "tutor_verification_documents_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availability_rules" ADD CONSTRAINT "tutor_availability_rules_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tutor_availability_exceptions" ADD CONSTRAINT "tutor_availability_exceptions_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offerings" ADD CONSTRAINT "offerings_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_offeringId_fkey" FOREIGN KEY ("offeringId") REFERENCES "offerings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_tutorId_fkey" FOREIGN KEY ("tutorId") REFERENCES "tutor_profiles"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "germany_paths" ADD CONSTRAINT "germany_paths_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_requirements" ADD CONSTRAINT "document_requirements_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "official_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Double-booking prevention (spec: "Extrem wichtig", race-condition-proof,
-- client/app-level checks alone are NOT sufficient). Prisma's schema DSL
-- cannot express a PostgreSQL EXCLUDE constraint, so it's added here by
-- hand. Requires btree_gist for the equality operator class on a UUID
-- column to be combinable with the range overlap operator in the same
-- GiST index.
--
-- Effect: PostgreSQL itself refuses to COMMIT a second PENDING/CONFIRMED
-- booking for the same tutor whose [start_at, end_at) range overlaps an
-- existing PENDING/CONFIRMED booking for that tutor — enforced inside the
-- database's own MVCC/locking, so two concurrent transactions racing past
-- an application-level pre-check cannot both succeed. The loser gets a
-- Postgres error (SQLSTATE 23P01, exclusion_violation), which
-- BookingsService maps to the same friendly ConflictException as the
-- app-level pre-check.
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "bookings"
  ADD CONSTRAINT "bookings_no_overlapping_active_ranges"
  EXCLUDE USING gist (
    "tutorId" WITH =,
    tstzrange("start_at", "end_at") WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));
