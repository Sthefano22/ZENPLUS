-- CreateEnum
CREATE TYPE "crm"."OfferStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'COUNTERED', 'ACCEPTED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "crm"."ReservationStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "crm"."OperationStatus" AS ENUM ('BOOTSTRAPPED', 'IN_PROGRESS', 'CLOSED');

-- CreateEnum
CREATE TYPE "crm"."InterestStatus" AS ENUM ('SUGGESTED', 'SENT', 'INTERESTED', 'DISCARDED');

-- CreateEnum
CREATE TYPE "inventory"."CommercialStatus" AS ENUM ('AVAILABLE', 'RESERVATION_HOLD', 'RESERVED', 'SOLD', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "inventory"."PublicationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED');

-- AlterTable
ALTER TABLE "inventory"."assets" ADD COLUMN     "commercial_status" "inventory"."CommercialStatus" NOT NULL DEFAULT 'AVAILABLE',
ADD COLUMN     "publication_status" "inventory"."PublicationStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "crm"."opportunity_asset_interest" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "asset_id" UUID NOT NULL,
    "status" "crm"."InterestStatus" NOT NULL DEFAULT 'SUGGESTED',
    "notes" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "opportunity_asset_interest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."offer_thread" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "asset_id" UUID,
    "status" "crm"."OfferStatus" NOT NULL DEFAULT 'DRAFT',
    "current_version" INTEGER NOT NULL DEFAULT 0,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offer_thread_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."offer_version" (
    "id" TEXT NOT NULL,
    "thread_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'USD',
    "conditions" JSONB,
    "status" "crm"."OfferStatus" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_role" VARCHAR(30) NOT NULL,
    "parent_version_id" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "offer_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."reservation" (
    "id" TEXT NOT NULL,
    "opportunity_id" TEXT NOT NULL,
    "asset_id" UUID NOT NULL,
    "offer_thread_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "status" "crm"."ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT NOT NULL,
    "converted_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm"."operation" (
    "id" TEXT NOT NULL,
    "reservation_id" TEXT NOT NULL,
    "status" "crm"."OperationStatus" NOT NULL DEFAULT 'BOOTSTRAPPED',
    "bootstrapped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."asset_active_hold" (
    "asset_id" UUID NOT NULL,
    "reservation_id" VARCHAR(100) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "asset_active_hold_pkey" PRIMARY KEY ("asset_id")
);

-- CreateTable
CREATE TABLE "inventory"."inventory_domain_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_type" VARCHAR(100) NOT NULL,
    "aggregate_type" VARCHAR(50) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "occurred_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "inventory_domain_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "opportunity_asset_interest_opportunity_id_idx" ON "crm"."opportunity_asset_interest"("opportunity_id");

-- CreateIndex
CREATE INDEX "opportunity_asset_interest_asset_id_idx" ON "crm"."opportunity_asset_interest"("asset_id");

-- CreateIndex
CREATE UNIQUE INDEX "opportunity_asset_interest_opportunity_id_asset_id_key" ON "crm"."opportunity_asset_interest"("opportunity_id", "asset_id");

-- CreateIndex
CREATE INDEX "offer_thread_opportunity_id_idx" ON "crm"."offer_thread"("opportunity_id");

-- CreateIndex
CREATE INDEX "offer_thread_status_idx" ON "crm"."offer_thread"("status");

-- CreateIndex
CREATE INDEX "offer_version_thread_id_idx" ON "crm"."offer_version"("thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "offer_version_thread_id_version_key" ON "crm"."offer_version"("thread_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_offer_thread_id_key" ON "crm"."reservation"("offer_thread_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_idempotency_key_key" ON "crm"."reservation"("idempotency_key");

-- CreateIndex
CREATE INDEX "reservation_asset_id_status_idx" ON "crm"."reservation"("asset_id", "status");

-- CreateIndex
CREATE INDEX "reservation_opportunity_id_idx" ON "crm"."reservation"("opportunity_id");

-- CreateIndex
CREATE INDEX "reservation_expires_at_idx" ON "crm"."reservation"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "operation_reservation_id_key" ON "crm"."operation"("reservation_id");

-- CreateIndex
CREATE INDEX "idx_active_hold_expires" ON "inventory"."asset_active_hold"("expires_at");

-- CreateIndex
CREATE INDEX "idx_inventory_events_aggregate" ON "inventory"."inventory_domain_events"("aggregate_type", "aggregate_id");

-- CreateIndex
CREATE INDEX "idx_inventory_events_occurred" ON "inventory"."inventory_domain_events"("occurred_at" DESC);

-- CreateIndex
CREATE INDEX "idx_assets_commercial_search" ON "inventory"."assets"("commercial_status", "current_price", "area_m2");

-- CreateIndex
CREATE INDEX "idx_assets_publication_active" ON "inventory"."assets"("publication_status", "commercial_status");

-- AddForeignKey
ALTER TABLE "crm"."opportunity_asset_interest" ADD CONSTRAINT "opportunity_asset_interest_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm"."opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."offer_thread" ADD CONSTRAINT "offer_thread_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm"."opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."offer_version" ADD CONSTRAINT "offer_version_thread_id_fkey" FOREIGN KEY ("thread_id") REFERENCES "crm"."offer_thread"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."reservation" ADD CONSTRAINT "reservation_opportunity_id_fkey" FOREIGN KEY ("opportunity_id") REFERENCES "crm"."opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."reservation" ADD CONSTRAINT "reservation_offer_thread_id_fkey" FOREIGN KEY ("offer_thread_id") REFERENCES "crm"."offer_thread"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm"."operation" ADD CONSTRAINT "operation_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "crm"."reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory"."asset_active_hold" ADD CONSTRAINT "asset_active_hold_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "inventory"."assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

