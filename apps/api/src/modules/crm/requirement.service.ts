import { prisma } from '../../lib/prisma';
import { randomUUID } from 'crypto';
import type { CreateRequirementInput, UpdateRequirementInput } from './requirement.schema';

export class RequirementNotFoundError extends Error {
  constructor(id: string) {
    super(`Requirement ${id} no encontrado`);
    this.name = 'RequirementNotFoundError';
  }
}

export async function createRequirement(input: CreateRequirementInput) {
  const opportunity = await prisma.opportunities.findUnique({
    where: { id: input.opportunityId },
  });

  if (!opportunity) {
    throw new Error(`Opportunity ${input.opportunityId} no existe`);
  }

  return prisma.requirements.create({
    data: {
      id: randomUUID(),
      opportunity_id: input.opportunityId,
      operation_type: input.operationType,
      asset_type: input.assetType,
      zones: input.zones,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      currency: input.currency,
      area_min: input.areaMin ?? null,
      area_max: input.areaMax ?? null,
      attributes: input.attributes ?? undefined,
      time_horizon: input.timeHorizon ?? null,
    },
  });
}

export async function getRequirementByOpportunity(opportunityId: string) {
  const requirement = await prisma.requirements.findFirst({
    where: { opportunity_id: opportunityId },
  });

  if (!requirement) {
    throw new RequirementNotFoundError(opportunityId);
  }

  return requirement;
}

export async function updateRequirement(id: string, input: UpdateRequirementInput) {
  const existing = await prisma.requirements.findUnique({ where: { id } });

  if (!existing) {
    throw new RequirementNotFoundError(id);
  }

  return prisma.requirements.update({
    where: { id },
    data: {
      operation_type: input.operationType,
      asset_type: input.assetType,
      zones: input.zones,
      budget_min: input.budgetMin ?? null,
      budget_max: input.budgetMax ?? null,
      currency: input.currency,
      area_min: input.areaMin ?? null,
      area_max: input.areaMax ?? null,
      attributes: input.attributes ?? undefined,
      time_horizon: input.timeHorizon ?? null,
    },
  });
}