-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "crm";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "iam";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateEnum
CREATE TYPE "crm"."LeadSource" AS ENUM ('WEB_FORM', 'WHATSAPP', 'PHONE', 'REFERRAL', 'OTHER');

-- CreateEnum
CREATE TYPE "crm"."LeadStatus" AS ENUM ('NEW', 'ASSIGNED', 'CONTACTED', 'QUALIFIED', 'DISQUALIFIED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "crm"."ActivityType" AS ENUM ('CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'NOTE');

-- CreateEnum
CREATE TYPE "crm"."PartyType" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "crm"."OpportunityStage" AS ENUM ('NEW', 'QUALIFIED', 'VISIT_SCHEDULED', 'OFFER', 'RESERVATION', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "core"."party_type" AS ENUM ('PERSON', 'ORGANIZATION');

-- CreateEnum
CREATE TYPE "inventory"."asset_status" AS ENUM ('DRAFT', 'UNDER_REVIEW', 'AVAILABLE', 'RESERVED', 'SOLD', 'IN_REVIEW');

-- CreateEnum
CREATE TYPE "inventory"."asset_type" AS ENUM ('LOT', 'APARTMENT', 'HOUSE', 'COMMERCIAL_SPACE');

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
    "qualifiedAt" TIMESTAMP(3),

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

-- CreateTable
CREATE TABLE "inventory"."assets" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "asset_type" "inventory"."asset_type" NOT NULL,
    "status" "inventory"."asset_status" NOT NULL DEFAULT 'DRAFT',
    "owner_party_id" UUID,
    "area_m2" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "current_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."asset_timeline" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" UUID NOT NULL,
    "previous_status" VARCHAR(50),
    "new_status" VARCHAR(50) NOT NULL,
    "action_type" VARCHAR(50) NOT NULL DEFAULT 'STATUS_CHANGE',
    "details" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_timeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."organizations" (
    "party_id" UUID NOT NULL,
    "legal_name" VARCHAR(200) NOT NULL,
    "trade_name" VARCHAR(200),
    "tax_id" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150),
    "phone" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("party_id")
);

-- CreateTable
CREATE TABLE "core"."parties" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "party_type" "core"."party_type" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."persons" (
    "party_id" UUID NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "doc_type" VARCHAR(20) NOT NULL,
    "doc_number" VARCHAR(20) NOT NULL,
    "email" VARCHAR(150) NOT NULL,
    "phone" VARCHAR(30),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("party_id")
);

-- CreateTable
CREATE TABLE "inventory"."asset_price_history" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "asset_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "valid_from" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMPTZ(6),
    "changed_by" UUID,
    "reason" TEXT,

    CONSTRAINT "asset_price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."asset_prices" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "asset_id" UUID NOT NULL,
    "currency" VARCHAR(3) DEFAULT 'USD',
    "amount" DECIMAL(12,2) NOT NULL,
    "is_current" BOOLEAN DEFAULT true,
    "valid_from" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "valid_to" TIMESTAMPTZ(6),

    CONSTRAINT "asset_prices_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "party_email_key" ON "crm"."party"("email");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_leadId_key" ON "crm"."opportunity"("leadId");

-- CreateIndex
CREATE INDEX "opportunity_stage_idx" ON "crm"."opportunity"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "assets_code_key" ON "inventory"."assets"("code");

-- CreateIndex
CREATE INDEX "idx_assets_code" ON "inventory"."assets"("code");

-- CreateIndex
CREATE INDEX "idx_assets_owner" ON "inventory"."assets"("owner_party_id");

-- CreateIndex
CREATE INDEX "idx_assets_status" ON "inventory"."assets"("status");

-- CreateIndex
CREATE INDEX "idx_asset_timeline_asset_id" ON "inventory"."asset_timeline"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_tax_id_key" ON "core"."organizations"("tax_id");

-- CreateIndex
CREATE INDEX "idx_organizations_tax_id" ON "core"."organizations"("tax_id");

-- CreateIndex
CREATE UNIQUE INDEX "persons_doc_number_key" ON "core"."persons"("doc_number");

-- CreateIndex
CREATE UNIQUE INDEX "persons_email_key" ON "core"."persons"("email");

-- CreateIndex
CREATE INDEX "idx_persons_doc_number" ON "core"."persons"("doc_number");

-- CreateIndex
CREATE INDEX "idx_persons_email" ON "core"."persons"("email");

-- CreateIndex
CREATE INDEX "idx_price_history_asset" ON "inventory"."asset_price_history"("asset_id");

-- AddForeignKey
ALTER TABLE "crm"."lead" ADD CONSTRAINT "lead_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "crm"."party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."activity" ADD CONSTRAINT "activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."opportunity" ADD CONSTRAINT "opportunity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "crm"."lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."assets" ADD CONSTRAINT "assets_owner_party_id_fkey" FOREIGN KEY ("owner_party_id") REFERENCES "core"."parties"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."asset_timeline" ADD CONSTRAINT "asset_timeline_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory"."assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."organizations" ADD CONSTRAINT "organizations_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "core"."parties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."persons" ADD CONSTRAINT "persons_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "core"."parties"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."asset_price_history" ADD CONSTRAINT "asset_price_history_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory"."assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."asset_price_history" ADD CONSTRAINT "asset_price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "core"."parties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."asset_prices" ADD CONSTRAINT "asset_prices_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory"."assets"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

