import { prisma } from "../../lib/prisma";
import { pickAdvisor } from "./assignment.service";
import { calculateSlaDueAt } from "./sla.service";
import { resolveParty } from "./party.service";
import type { CreateLeadInput } from "./lead.schema";
import { logger } from "../../lib/logger";
import { track } from "../../lib/analytics";

export async function createLead(input: CreateLeadInput) {
  const assignedTo = pickAdvisor();
  const slaDueAt = calculateSlaDueAt();
  const { partyId, isNew } = await resolveParty({
    email: input.email,
    phone: input.phone,
    fullName: input.fullName,
  });

  const lead = await prisma.lead.create({
    data: {
      source: input.source,
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      message: input.message,
      assetId: input.assetId,
      partyId,
      assignedTo,
      slaDueAt,
      status: "ASSIGNED",
    },
  });

  logger.info(
    { leadId: lead.id, assignedTo, partyId, isNewParty: isNew },
    "Lead created and assigned"
  );

  track("lead_created", { leadId: lead.id, source: input.source });
  track("lead_assigned", { leadId: lead.id, assignedTo });

  return lead;
}

export async function listMyLeads(advisorId: string) {
  return prisma.lead.findMany({
    where: { assignedTo: advisorId },
    orderBy: { createdAt: "desc" },
    include: { activities: true, opportunity: true, party: true },
  });
}

export async function registerContact(
  leadId: string,
  advisorId: string,
  input: { outcome: string; notes?: string; type: string }
) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const activity = await prisma.activity.create({
    data: {
      leadId,
      type: input.type as any,
      outcome: input.outcome,
      notes: input.notes,
      createdBy: advisorId,
    },
  });

  const newStatus =
    input.outcome === "DISQUALIFIED"
      ? "DISQUALIFIED"
      : input.outcome === "CONTACTED"
      ? "CONTACTED"
      : lead.status;

  const updated = await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: newStatus,
      firstContactAt: lead.firstContactAt ?? new Date(),
    },
  });

  logger.info({ leadId, advisorId, outcome: input.outcome }, "Contact registered");
  track("lead_contacted", { leadId, outcome: input.outcome });

  return { lead: updated, activity };
}

export async function qualifyLead(
  leadId: string,
  advisorId: string,
  input: { amount?: number; currency?: string }
) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const opportunity = await prisma.opportunity.create({
    data: {
      leadId,
      stage: "QUALIFIED",
      amount: input.amount ?? null,
      currency: input.currency ?? "PEN",
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "QUALIFIED",
      qualifiedAt: new Date(),
    },
  });

  await prisma.activity.create({
    data: {
      leadId,
      type: "NOTE",
      outcome: "QUALIFIED",
      notes: `Convertido a Opportunity ${opportunity.id}`,
      createdBy: advisorId,
    },
  });

  logger.info({ leadId, opportunityId: opportunity.id }, "Lead qualified");
  track("lead_qualified", { leadId, opportunityId: opportunity.id });

  return opportunity;
}