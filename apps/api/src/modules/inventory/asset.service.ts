import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { logger } from "../../lib/logger";
import type { CreateAssetInput, ChangeStatusInput } from "./asset.schema";

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["IN_REVIEW", "UNDER_REVIEW", "AVAILABLE"],
  UNDER_REVIEW: ["AVAILABLE", "DRAFT"],
  IN_REVIEW: ["AVAILABLE", "DRAFT"],
  AVAILABLE: ["RESERVED", "IN_REVIEW", "UNDER_REVIEW", "SOLD"],
  RESERVED: ["SOLD", "AVAILABLE"],
  SOLD: [],
};

export async function listPublicAssets(filters: {
  assetType?: string;
  minPrice?: number;
  maxPrice?: number;
}) {
  const where: any = { status: "AVAILABLE" };

  if (filters.assetType) where.type = filters.assetType;
  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  return prisma.assets.findMany({
    where,
    orderBy: { price: "asc" },
    include: {
      projects: true,
      units: true,
    },
  });
}

export async function getAssetById(id: string) {
  return prisma.assets.findUnique({
    where: { id },
    include: {
      projects: true,
      units: true,
      timelines: { orderBy: { created_at: "desc" }, take: 10 },
    },
  });
}

export async function listAllAssets() {
  return prisma.assets.findMany({
    orderBy: { created_at: "desc" },
    include: {
      projects: true,
    },
  });
}

export async function createAsset(input: CreateAssetInput) {
  const assetId = randomUUID();

  const asset = await prisma.assets.create({
    data: {
      id: assetId,
      code: input.code.toUpperCase().trim(),
      title: input.name.trim(),
      details: input.description ? ({ description: input.description } as any) : undefined,
      type: input.assetType,
      status: "AVAILABLE",
      area: input.areaM2 ?? null,
      currency: input.currency,
      price: input.currentPrice,
      commercial_status: "AVAILABLE",
      publication_status: "DRAFT",
    },
  });

  await prisma.asset_timelines.create({
    data: {
      id: randomUUID(),
      asset_id: asset.id,
      previous_status: null,
      new_status: "AVAILABLE",
      action_type: "CREATED",
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
  const asset = await prisma.assets.findUnique({ where: { id } });
  if (!asset) throw new Error("ASSET_NOT_FOUND");

  const currentStatus = asset.status;
  const allowed = VALID_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(input.nextStatus)) {
    throw new Error(
      `INVALID_TRANSITION: No se puede cambiar de ${currentStatus} a ${input.nextStatus}`
    );
  }

  const updated = await prisma.assets.update({
    where: { id },
    data: { status: input.nextStatus },
  });

  await prisma.asset_timelines.create({
    data: {
      id: randomUUID(),
      asset_id: id,
      previous_status: currentStatus,
      new_status: input.nextStatus,
      action_type: "STATUS_CHANGE",
      details:
        input.notes ||
        `Cambio de ${currentStatus} a ${input.nextStatus} por ${actor}`,
    },
  });

  logger.info(
    { assetId: id, from: currentStatus, to: input.nextStatus },
    "Asset status changed"
  );
  return updated;
}

export async function getAssetTimeline(id: string) {
  return prisma.asset_timelines.findMany({
    where: { asset_id: id },
    orderBy: { created_at: "desc" },
  });
}