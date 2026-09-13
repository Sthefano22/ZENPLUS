-- CreateEnum
CREATE TYPE "crm"."PartyType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "crm"."OpportunityStage" AS ENUM ('NEW', 'QUALIFIED', 'VISIT_SCHEDULED', 'OFFER', 'RESERVATION', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "crm"."lead" ADD COLUMN     "qualifiedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "crm"."party" (
    "id" TEXT NOT NULL,
    "type" "crm"."PartyType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "fullName" TEXT,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."opportunity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "stage" "crm"."OpportunityStage" NOT NULL DEFAULT 'NEW',
    "amount" DECIMAL(65,30),
    "currency" TEXT NOT NULL DEFAULT 'PEN',
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "closeReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "party_email_key" ON "crm"."party"("email");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_leadId_key" ON "crm"."opportunity"("leadId");

-- CreateIndex
CREATE INDEX "opportunity_stage_idx" ON "crm"."opportunity"("stage");

-- AddForeignKey
ALTER TABLE "crm"."lead" ADD CONSTRAINT "lead_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "crm"."party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."opportunity" ADD CONSTRAINT "opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
