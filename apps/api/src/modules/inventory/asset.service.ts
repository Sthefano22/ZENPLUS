import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import type {
  CreateAssetInput,
  ChangeStatusInput,
} from "./asset.schema";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW", "UNDER_REVIEW"],
  UNDER_REVIEW: ["AVAILABLE", "DRAFT"],
  IN_REVIEW: ["AVAILABLE", "DRAFT"],
  AVAILABLE: ["RESERVED", "IN_REVIEW", "UNDER_REVIEW"],
  RESERVED: ["SOLD", "AVAILABLE"],
  SOLD: [],
};

export async function listPublicAssets(filters: {
  assetType?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: any = { status: "AVAILABLE" };

  if (filters.assetType) where.assetType = filters.assetType;
  if (filters.minPrice || filters.maxPrice) {
    where.currentPrice = {};
    if (filters.minPrice) where.currentPrice.gte = filters.minPrice;
    if (filters.maxPrice) where.currentPrice.lte = filters.maxPrice;
  }

  return prisma.asset.findMany({
    where,
    orderBy: { currentPrice: "asc" },
    include: {
      parties: {
        select: { id: true, organizations: { select: { trade_name: true } } },
      },
    },
  });
}

export async function getAssetById(id: string) {
  return prisma.asset.findUnique({
    where: { id },
    include: {
      parties: {
        include: {
          organizations: true,
          persons: true,
        },
      },
      timeline: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function listAllAssets() {
  return prisma.asset.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      parties: {
        include: { organizations: true },
      },
    },
  });
}

export async function createAsset(input: CreateAssetInput) {
  // Si no viene ownerPartyId, usar la primera organización
  let ownerPartyId = input.ownerPartyId;
  if (!ownerPartyId) {
    const firstOrg = await prisma.organizations.findFirst();
    ownerPartyId = firstOrg?.party_id;
  }

  const asset = await prisma.asset.create({
    data: {
      code: input.code.toUpperCase().trim(),
      name: input.name.trim(),
      description: input.description,
      assetType: input.assetType,
      status: "DRAFT",
      areaM2: input.areaM2,
      currency: input.currency,
      currentPrice: input.currentPrice,
      ownerPartyId,
    },
  });

  await prisma.assetTimeline.create({
    data: {
      assetId: asset.id,
      previousStatus: null,
      newStatus: "DRAFT",
      actionType: "CREATED",
      details: `Asset creado con código ${asset.code}`,
    },
  });

  logger.info({ assetId: asset.id, code: asset.code }, "Asset created");
  return asset;
}

export async function changeAssetStatus(
  id: string,
  input: ChangeStatusInput,
  actor: string
) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) throw new Error("ASSET_NOT_FOUND");

  const currentStatus = asset.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(input.nextStatus)) {
    throw new Error(
      `INVALID_TRANSITION: No se puede cambiar de ${currentStatus} a ${input.nextStatus}`
    );
  }

  const updated = await prisma.asset.update({
    where: { id },
    data: { status: input.nextStatus as any },
  });

  await prisma.assetTimeline.create({
    data: {
      assetId: id,
      previousStatus: currentStatus,
      newStatus: input.nextStatus,
      actionType: "STATUS_CHANGE",
      details: input.notes || `Cambio de ${currentStatus} a ${input.nextStatus} por ${actor}`,
    },
  });

  logger.info({ assetId: id, from: currentStatus, to: input.nextStatus }, "Asset status changed");
  return updated;
}

export async function getAssetTimeline(id: string) {
  return prisma.assetTimeline.findMany({
    where: { assetId: id },
    orderBy: { createdAt: "desc" },
  });
}