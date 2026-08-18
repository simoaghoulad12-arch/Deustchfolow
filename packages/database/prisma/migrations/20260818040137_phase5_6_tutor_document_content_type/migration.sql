/*
  Warnings:

  - Added the required column `content_type` to the `tutor_verification_documents` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tutor_verification_documents" ADD COLUMN     "content_type" TEXT NOT NULL;
