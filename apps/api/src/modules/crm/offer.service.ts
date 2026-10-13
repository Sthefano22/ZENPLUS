import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

export class OfferStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfferStateError";
  }
}

export async function submitOffer(input: {
  opportunityId: string;
  assetId?: string;
  amount: number;
  currency?: string;
  conditions?: Record<string, unknown>;
  actorId: string;
  actorRole: string;
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    let thread = await tx.offer_threads.findFirst({
      where: {
        opportunity_id: input.opportunityId,
        status: { in: ["DRAFT", "SUBMITTED", "COUNTERED"] },
      },
    });

    if (!thread) {
      thread = await tx.offer_threads.create({
        data: {
          id: randomUUID(),
          opportunity_id: input.opportunityId,
          asset_id: input.assetId ?? null,
          status: "SUBMITTED",
          current_version: 1,
          created_by: input.actorId,
        },
      });
    } else {
      thread = await tx.offer_threads.update({
        where: { id: thread.id },
        data: {
          current_version: thread.current_version + 1,
          status: "SUBMITTED",
        },
      });
    }

    const version = await tx.offer_versions.create({
      data: {
        id: randomUUID(),
        thread_id: thread.id,
        version: thread.current_version,
        amount: input.amount,
        currency: input.currency ?? "USD",
        conditions: (input.conditions ?? {}) as any,
        status: "SUBMITTED",
        actor_id: input.actorId,
        actor_role: input.actorRole,
        notes: input.notes ?? null,
      },
    });

    return { thread, version };
  });
}

export async function counterOffer(input: {
  threadId: string;
  amount: number;
  currency?: string;
  conditions?: Record<string, unknown>;
  actorId: string;
  actorRole: string;
  notes?: string;
}) {
  return prisma.$transaction(async (tx) => {
    const thread = await tx.offer_threads.findUniqueOrThrow({
      where: { id: input.threadId },
    });

    if (thread.status !== "SUBMITTED" && thread.status !== "COUNTERED") {
      throw new OfferStateError(
        `No se puede contrademandar en estado ${thread.status}`
      );
    }

    const previousVersion = await tx.offer_versions.findFirst({
      where: { thread_id: thread.id },
      orderBy: { version: "desc" },
    });

    const updated = await tx.offer_threads.update({
      where: { id: thread.id },
      data: {
        current_version: thread.current_version + 1,
        status: "COUNTERED",
      },
    });

    const version = await tx.offer_versions.create({
      data: {
        id: randomUUID(),
        thread_id: thread.id,
        version: updated.current_version,
        amount: input.amount,
        currency: input.currency ?? previousVersion?.currency ?? "USD",
        conditions: (input.conditions ?? {}) as any,
        status: "COUNTERED",
        actor_id: input.actorId,
        actor_role: input.actorRole,
        parent_version_id: previousVersion?.id ?? null,
        notes: input.notes ?? null,
      },
    });

    return { thread: updated, version };
  });
}

export async function acceptOffer(threadId: string, actorId: string) {
  const thread = await prisma.offer_threads.findUniqueOrThrow({
    where: { id: threadId },
  });
  if (thread.status !== "SUBMITTED" && thread.status !== "COUNTERED") {
    throw new OfferStateError(`No se puede aceptar en estado ${thread.status}`);
  }
  return prisma.offer_threads.update({
    where: { id: threadId },
    data: { status: "ACCEPTED" },
  });
}

export async function rejectOffer(threadId: string, actorId: string) {
  const thread = await prisma.offer_threads.findUniqueOrThrow({
    where: { id: threadId },
  });
  if (thread.status === "ACCEPTED") {
    throw new OfferStateError("No se puede rechazar una oferta aceptada");
  }
  return prisma.offer_threads.update({
    where: { id: threadId },
    data: { status: "REJECTED" },
  });
}

export async function getOfferThread(threadId: string) {
  return prisma.offer_threads.findUniqueOrThrow({
    where: { id: threadId },
    include: { offer_versions: { orderBy: { version: "asc" } } },
  });
}

export async function listOfferThreads(opportunityId: string) {
  return prisma.offer_threads.findMany({
    where: { opportunity_id: opportunityId },
    include: { offer_versions: { orderBy: { version: "asc" } } },
    orderBy: { created_at: "desc" },
  });
}