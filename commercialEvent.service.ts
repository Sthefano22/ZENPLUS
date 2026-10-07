import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { OpportunityNotFoundError } from './errors';

export async function logCommercialEvent(input: {
  opportunityId: string;
  type: string;
  message: string;
  metadata?: Record<string, any>;
  createdBy?: string;
}) {
  try {
    return await prisma.commercialEvent.create({
      data: {
        opportunityId: input.opportunityId,
        type: input.type as any,
        message: input.message,
        metadata: input.metadata,
        createdBy: input.createdBy ?? 'system',
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new OpportunityNotFoundError(input.opportunityId);
    }
    throw err;
  }
}

export async function getTimelineByOpportunity(opportunityId: string) {
  return prisma.commercialEvent.findMany({
    where: { opportunityId },
    orderBy: { createdAt: 'desc' },
  });
}