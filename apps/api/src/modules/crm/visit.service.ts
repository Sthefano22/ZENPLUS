import { prisma } from '../../lib/prisma';
import { randomUUID } from 'crypto';
import type {
  ScheduleVisitInput,
  RescheduleVisitInput,
  CancelVisitInput,
  CompleteVisitInput,
  NoShowVisitInput,
} from './visit.schema';

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
  const opportunity = await prisma.opportunities.findUnique({
    where: { id: input.opportunityId },
  });
  if (!opportunity) {
    throw new Error(`Opportunity ${input.opportunityId} no existe`);
  }

  return prisma.visits.create({
    data: {
      id: randomUUID(),
      opportunity_id: input.opportunityId,
      asset_id: input.assetId ?? null,
      scheduled_at: input.scheduledAt,
      status: 'SCHEDULED',
      notes: input.notes ?? null,
      created_by: createdBy,
    },
  });
}

export async function getVisit(id: string) {
  const visit = await prisma.visits.findUnique({ where: { id } });
  if (!visit) throw new VisitNotFoundError(id);
  return visit;
}

export async function rescheduleVisit(id: string, input: RescheduleVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'reschedule');

  return prisma.visits.update({
    where: { id },
    data: {
      scheduled_at: input.scheduledAt,
      reschedule_reason: input.reason ?? null,
      rescheduled_count: { increment: 1 },
    },
  });
}

export async function cancelVisit(id: string, input: CancelVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'cancel');

  return prisma.visits.update({
    where: { id },
    data: {
      status: 'CANCELLED',
      cancel_reason: input.reason ?? null,
      cancelled_at: new Date(),
    },
  });
}

export async function completeVisit(id: string, input: CompleteVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'complete');

  return prisma.visits.update({
    where: { id },
    data: {
      status: 'COMPLETED',
      completed_at: new Date(),
      notes: input.notes ?? visit.notes,
    },
  });
}

export async function markNoShow(id: string, input: NoShowVisitInput) {
  const visit = await getVisit(id);
  assertIsSchedulable(visit.status, 'markNoShow');

  return prisma.visits.update({
    where: { id },
    data: {
      status: 'NO_SHOW',
      notes: input.notes ?? visit.notes,
    },
  });
}

export async function registerVisitOutcome(
  id: string,
  input: { outcome: string; nextAction?: string; interestLevel?: number; notes?: string },
  actorId: string
) {
  const visit = await getVisit(id);

  return prisma.visits.update({
    where: { id },
    data: {
      outcome: input.outcome,
      next_action: input.nextAction ?? null,
      interest_level: input.interestLevel ?? null,
      notes: input.notes ?? visit.notes,
    },
  });
}