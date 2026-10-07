import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { VisitNotFoundError } from './visit.service';
import { InvalidStateTransitionError } from './errors';
import type { RegisterVisitFeedbackInput } from './visitFeedback.schema';

export async function registerVisitFeedback(visitId: string, input: RegisterVisitFeedbackInput) {
  const visit = await prisma.visit.findUnique({ where: { id: visitId } });
  if (!visit) throw new VisitNotFoundError(visitId);

  if (visit.status !== 'COMPLETED') {
    throw new InvalidStateTransitionError('Visit', visit.status, 'registerFeedback');
  }

  try {
    return await prisma.visitFeedback.upsert({
      where: { visitId },
      create: {
        visitId,
        outcome: input.outcome,
        interestLevel: input.interestLevel,
        nextAction: input.nextAction,
        nextActionAt: input.nextActionAt,
        notes: input.notes,
      },
      update: {
        outcome: input.outcome,
        interestLevel: input.interestLevel,
        nextAction: input.nextAction,
        nextActionAt: input.nextActionAt,
        notes: input.notes,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2003') {
      throw new VisitNotFoundError(visitId);
    }
    throw err;
  }
}

export async function getVisitFeedback(visitId: string) {
  const feedback = await prisma.visitFeedback.findUnique({ where: { visitId } });
  if (!feedback) throw new VisitNotFoundError(visitId);
  return feedback;
}