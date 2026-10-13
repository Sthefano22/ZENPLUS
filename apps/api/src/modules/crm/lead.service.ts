import { prisma } from "../../lib/prisma";
import { pickAdvisor } from "./assignment.service";
import { resolveParty } from "./party.service";
import type { CreateLeadInput } from "./lead.schema";
import { logger } from "../../lib/logger";
import { track } from "../../lib/analytics";
import { randomUUID } from "crypto";

export async function createLead(input: CreateLeadInput) {
  const assignedTo = pickAdvisor();

  const { partyId, isNew } = await resolveParty({
    email: input.email,
    phone: input.phone,
    fullName: input.fullName,
  });

  const lead = await prisma.leads.create({
    data: {
      id: randomUUID(),
      source: input.source,
      full_name: input.fullName,
      email: input.email,
      phone: input.phone,
      message: input.message,
      asset_id: input.assetId ?? null,
      party_id: partyId,
      assigned_to: assignedTo,
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
  return prisma.leads.findMany({
    where: { assigned_to_id: advisorId },
    orderBy: { created_at: "desc" },
    include: { activities: true, opportunities: true, parties: true },
  });
}

export async function registerContact(
  leadId: string,
  advisorId: string,
  input: { outcome: string; notes?: string; type: string }
) {
  const lead = await prisma.leads.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const activity = await prisma.activities.create({
    data: {
      id: randomUUID(),
      lead_id: leadId,
      type: input.type,
      outcome: input.outcome,
      notes: input.notes,
      created_by: advisorId,
    },
  });

  const newStatus =
    input.outcome === "DISQUALIFIED"
      ? "DISQUALIFIED"
      : input.outcome === "CONTACTED"
      ? "CONTACTED"
      : lead.status;

  const updated = await prisma.leads.update({
    where: { id: leadId },
    data: { status: newStatus },
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
  const lead = await prisma.leads.findUnique({ where: { id: leadId } });
  if (!lead) throw new Error("LEAD_NOT_FOUND");

  const opportunity = await prisma.opportunities.create({
    data: {
      id: randomUUID(),
      lead_id: leadId,
      title: lead.full_name ?? "Oportunidad sin título",
      stage: "QUALIFIED",
      amount: input.amount ?? null,
      currency: input.currency ?? "PEN",
    },
  });

  await prisma.leads.update({
    where: { id: leadId },
    data: { status: "QUALIFIED" },
  });

  await prisma.activities.create({
    data: {
      lead_id: leadId,
      type: "NOTE",
      outcome: "QUALIFIED",
      notes: `Convertido a Opportunity ${opportunity.id}`,
      created_by: advisorId,
    },
  });

  logger.info({ leadId, opportunityId: opportunity.id }, "Lead qualified");
  track("lead_qualified", { leadId, opportunityId: opportunity.id });

  return opportunity;
}