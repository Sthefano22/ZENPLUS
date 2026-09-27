import { prisma } from '../../lib/prisma';
import type {ScheduleVisitInput, RescheduleVisitInput, CancelVisitInput, CompleteVisitInput, NoShowVisitInput} from './visit.schema';

export class VisitNotFoundError extends Error {
  constructor(id: string) {
    super(`Visit ${id} no encontrada`);
    this.name = 'VisitNotFoundError';
  }
}

export class InvalidVisitTransitionError extends Error {
  constructor(from: string, action: string) {
    super(`No se puede ejecutar "${action}" sobre una visita en estado ${from}`);
    this.name = 'InvalidVisitTransitionError';
  }
}

function assertIsSchedulable(status: string, action: string) {
  if (status !== 'SCHEDULED') {
    throw new InvalidVisitTransitionError(status, action);
  }
}

export async function scheduleVisit(input: ScheduleVisitInput, createdBy: string) {
  const opportunity = await prisma.opportunity.findUnique({
    where: { id: input.opportunityId },
  });
  if (!opportunity) {
    throw new Error(`Opportunity ${input.opportunityId} no existe`);
  }

  return prisma.visit.create({
    data: {
      opportunityId: input.opportunityId,
      assetId: input.assetId,
      scheduledAt: input.scheduledAt,
      status: 'SCHEDULED',
      notes: input.notes,
      createdBy,
    },
  });
}

export async function getVisit(id: string) {
  const visit = await prisma.visit.findUnique({ where: { id } });
  if (!visit) throw new VisitNotFoundError(id);
  return visit;
}

export async function rescheduleVisit(id: string, input: RescheduleVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'reschedule');

  return prisma.visit.update({
    where: { id },
    data: {
      scheduledAt: input.scheduledAt,
      rescheduleReason: input.reason,
      rescheduledCount: { increment: 1 },
    },
  });
}

export async function cancelVisit(id: string, input: CancelVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'cancel');

  return prisma.visit.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancelReason: input.reason,
      cancelledAt: new Date(),
    },
  });
}

export async function completeVisit(id: string, input: CompleteVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'complete');

  return prisma.visit.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      notes: input.notes ?? visit.notes,
    },
  });
}

export async function markNoShow(id: string, input: NoShowVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'markNoShow');

  return prisma.visit.update({
    where: { id },
    data: {
      status: 'NO_SHOW',
      notes: input.notes ?? visit.notes,
    },
  });
}