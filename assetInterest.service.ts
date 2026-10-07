import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { OpportunityNotFoundError, NotFoundError } from './errors';

export async function createAssetInterest(input: {
  opportunityId: string;
  assetId: string;
  status: string;
  notes?: string;
}) {
  try {
    return await prisma.assetInterest.upsert({
      where: {
        opportunityId_assetId: {
          opportunityId: input.opportunityId,
          assetId: input.assetId,
        },
      },
      create: {
        opportunityId: input.opportunityId,
        assetId: input.assetId,
        status: input.status as any,
        notes: input.notes,
      },
      update: {
        status: input.status as any,
        notes: input.notes,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new OpportunityNotFoundError(input.opportunityId);
    }
    throw err;
  }
}

export async function listAssetInterestsByOpportunity(opportunityId: string) {
  return prisma.assetInterest.findMany({
    where: { opportunityId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function updateAssetInterest(id: string, input: { status: string; notes?: string }) {
  try {
    return await prisma.assetInterest.update({
      where: { id },
      data: { status: input.status as any, notes: input.notes },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
      throw new NotFoundError('AssetInterest', id);
    }
    throw err;
  }
}