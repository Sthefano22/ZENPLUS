import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

export async function addAssetInterest(input: {
  opportunityId: string;
  assetId: string;
  status?: string;
  notes?: string;
  createdBy: string;
}) {
  const existing = await prisma.opportunity_asset_interests.findUnique({
    where: {
      opportunity_id_asset_id: {
        opportunity_id: input.opportunityId,
        asset_id: input.assetId,
      },
    },
  });

  if (existing) {
    return prisma.opportunity_asset_interests.update({
      where: { id: existing.id },
      data: {
        status: input.status ?? existing.status,
        notes: input.notes ?? existing.notes,
      },
    });
  }

  return prisma.opportunity_asset_interests.create({
    data: {
      id: randomUUID(),
      opportunity_id: input.opportunityId,
      asset_id: input.assetId,
      status: input.status ?? "SUGGESTED",
      notes: input.notes ?? null,
      created_by: input.createdBy,
    },
  });
}

export async function listAssetInterests(opportunityId: string) {
  return prisma.opportunity_asset_interests.findMany({
    where: { opportunity_id: opportunityId },
    orderBy: { created_at: "desc" },
  });
}

export async function updateInterestStatus(
  id: string,
  status: string,
  notes?: string
) {
  return prisma.opportunity_asset_interests.update({
    where: { id },
    data: {
      status,
      notes: notes ?? undefined,
    },
  });
}

export async function removeInterest(id: string) {
  return prisma.opportunity_asset_interests.delete({ where: { id } });
}