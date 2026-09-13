-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "iam";

-- CreateEnum
CREATE TYPE "crm"."LeadSource" AS ENUM ('WEB_FORM', 'WHATSAPP', 'PHONE', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "crm"."LeadStatus" AS ENUM ('NEW', 'ASSIGNED', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "crm"."ActivityType" AS ENUM ('CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'NOTE');

-- CreateTable
CREATE TABLE "crm"."lead" (
    "id" TEXT NOT NULL,
    "source" "crm"."LeadSource" NOT NULL,
    "status" "crm"."LeadStatus" NOT NULL DEFAULT 'NEW',
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT,
    "assetId" TEXT,
    "partyId" TEXT,
    "assignedTo" TEXT,
    "slaDueAt" TIMESTAMP(3),
    "firstContactAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."activity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "crm"."ActivityType" NOT NULL,
    "outcome" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "lead_status_idx" ON "crm"."lead"("status");

-- CreateIndex
CREATE INDEX "lead_assignedTo_idx" ON "crm"."lead"("assignedTo");

-- CreateIndex
CREATE INDEX "lead_email_idx" ON "crm"."lead"("email");

-- CreateIndex
CREATE INDEX "lead_phone_idx" ON "crm"."lead"("phone");

-- CreateIndex
CREATE INDEX "activity_leadId_idx" ON "crm"."activity"("leadId");

-- AddForeignKey
ALTER TABLE "crm"."activity" ADD CONSTRAINT "activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
