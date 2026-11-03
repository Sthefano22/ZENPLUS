import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";

export class ReservationConflictError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "ReservationConflictError";
  }
}

export class ReservationStateError extends Error {
  statusCode = 409;
  constructor(message: string) {
    super(message);
    this.name = "ReservationStateError";
  }
}

export async function createReservation(input: {
  opportunityId: string;
  assetId: string;
  offerThreadId?: string;
  idempotencyKey: string;
  ttlMinutes?: number;
  actorId: string;
}) {
  const existing = await prisma.reservations.findUnique({
    where: { idempotency_key: input.idempotencyKey },
  });
  if (existing) return existing;

  const ttl = input.ttlMinutes ?? 15;

  return prisma.$transaction(async (tx) => {
    const locked = await tx.$queryRaw<
      Array<{ id: string; commercial_status: string }>
    >`SELECT id, commercial_status FROM inventory.assets WHERE id = ${input.assetId}::text FOR UPDATE`;

    if (locked.length === 0) {
      throw Object.assign(new Error("ASSET_NOT_FOUND"), { statusCode: 404 });
    }

    const current = locked[0].commercial_status;

    const activeHold = await tx.asset_active_holds.findFirst({
      where: {
        asset_id: input.assetId,
        expires_at: { gt: new Date() },
      },
    });

    if (current !== "AVAILABLE" || activeHold) {
      throw new ReservationConflictError("El activo no está disponible para reserva");
    }

    const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
    const reservationId = randomUUID();

    await tx.asset_active_holds.upsert({
      where: { asset_id: input.assetId },
      create: {
        asset_id: input.assetId,
        reservation_id: reservationId,
        expires_at: expiresAt,
      },
      update: {
        reservation_id: reservationId,
        expires_at: expiresAt,
      },
    });

    await tx.assets.update({
      where: { id: input.assetId },
      data: { commercial_status: "RESERVATION_HOLD" },
    });

    const reservation = await tx.reservations.create({
      data: {
        id: reservationId,
        opportunity_id: input.opportunityId,
        asset_id: input.assetId,
        offer_thread_id: input.offerThreadId ?? null,
        idempotency_key: input.idempotencyKey,
        status: "ACTIVE",
        expires_at: expiresAt,
        created_by: input.actorId,
      },
    });

    await tx.asset_timelines.create({
      data: {
        id: randomUUID(),
        asset_id: input.assetId,
        previous_status: "AVAILABLE",
        new_status: "RESERVATION_HOLD",
        action_type: "RESERVATION_CREATED",
        details: JSON.stringify({
          reservationId: reservation.id,
          actorId: input.actorId,
        }),
      },
    });

    await tx.inventory_domain_events.create({
      data: {
        id: randomUUID(),
        event_type: "reservation_created",
        aggregate_type: "ASSET",
        aggregate_id: input.assetId,
        payload: {
          reservationId: reservation.id,
          opportunityId: input.opportunityId,
          assetId: input.assetId,
          expiresAt: expiresAt.toISOString(),
        } as any,
      },
    });

    return reservation;
  });
}

export async function cancelReservation(
  id: string,
  reason: string | undefined,
  actorId: string
) {
  return prisma.$transaction(async (tx) => {
    const r = await tx.reservations.findUniqueOrThrow({ where: { id } });
    if (r.status !== "ACTIVE") {
      throw new ReservationStateError(`No se puede cancelar en estado ${r.status}`);
    }

    const updated = await tx.reservations.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelled_at: new Date(),
        cancellation_reason: reason ?? null,
      },
    });

    await tx.asset_active_holds.deleteMany({ where: { asset_id: r.asset_id } });

    await tx.assets.update({
      where: { id: r.asset_id },
      data: { commercial_status: "AVAILABLE" },
    });

    await tx.asset_timelines.create({
      data: {
        id: randomUUID(),
        asset_id: r.asset_id,
        previous_status: "RESERVATION_HOLD",
        new_status: "AVAILABLE",
        action_type: "RESERVATION_CANCELLED",
        details: JSON.stringify({ reservationId: id, reason, actorId }),
      },
    });

    return updated;
  });
}

export async function convertReservation(id: string, actorId: string) {
  return prisma.$transaction(async (tx) => {
    const r = await tx.reservations.findUniqueOrThrow({ where: { id } });
    if (r.status !== "ACTIVE") {
      throw new ReservationStateError(`No se puede convertir en estado ${r.status}`);
    }

    await tx.reservations.update({
      where: { id },
      data: { status: "CONVERTED", converted_at: new Date() },
    });

    // Calcular monto: primero oferta aceptada, luego oportunidad
    let agreedAmount = 0;
    let currency = "USD";

    if (r.offer_thread_id) {
      const acceptedOffer = await tx.offer_versions.findFirst({
        where: {
          thread_id: r.offer_thread_id,
          status: "ACCEPTED",
        },
        orderBy: { version: "desc" },
      });
      if (acceptedOffer) {
        agreedAmount = Number(acceptedOffer.amount);
        currency = acceptedOffer.currency;
      }
    }

    if (agreedAmount === 0) {
      const opp = await tx.opportunities.findUnique({
        where: { id: r.opportunity_id },
      });
      if (opp?.amount) {
        agreedAmount = Number(opp.amount);
        currency = opp.currency ?? "USD";
      }
    }

    const operationId = randomUUID();
    const opCode = `OP-${Date.now()}`;

    const operation = await tx.operations.create({
      data: {
        id: operationId,
        code: opCode,
        operation_type: "SALE",
        stage: "RESERVATION_HANDOFF",
        agreed_amount: agreedAmount,
        currency,
        reservation_id: id,
      },
    });

    await tx.assets.update({
      where: { id: r.asset_id },
      data: { commercial_status: "SOLD" },
    });

    await tx.asset_active_holds.deleteMany({ where: { asset_id: r.asset_id } });

    await tx.asset_timelines.create({
      data: {
        id: randomUUID(),
        asset_id: r.asset_id,
        previous_status: "RESERVATION_HOLD",
        new_status: "SOLD",
        action_type: "RESERVATION_CONVERTED",
        details: JSON.stringify({
          reservationId: id,
          operationId: operation.id,
          actorId,
        }),
      },
    });

    await tx.inventory_domain_events.create({
      data: {
        id: randomUUID(),
        event_type: "operation_created",
        aggregate_type: "ASSET",
        aggregate_id: r.asset_id,
        payload: {
          reservationId: id,
          operationId: operation.id,
          opportunityId: r.opportunity_id,
        } as any,
      },
    });

    return operation;
  });
}

export async function getReservation(id: string) {
  return prisma.reservations.findUniqueOrThrow({
    where: { id },
    include: {
      opportunities: true,
      offer_threads: true,
    },
  });
}

export async function expireDueReservations(): Promise<{
  expiredReservations: number;
  releasedAssets: number;
}> {
  return prisma.$transaction(async (tx) => {
    // 1. Bloquear los assets que tienen reservas vencidas (SKIP LOCKED)
    const assetsWithExpiredReservations = await tx.$queryRaw<
      Array<{ id: string }>
    >`
      SELECT a.id
      FROM inventory.assets a
      WHERE EXISTS (
        SELECT 1
        FROM crm.reservations r
        WHERE r.asset_id = a.id
          AND r.status = 'ACTIVE'
          AND r.expires_at <= CURRENT_TIMESTAMP
      )
      ORDER BY a.id
      FOR UPDATE OF a SKIP LOCKED
    `;

    const assetIds = assetsWithExpiredReservations.map((row) => row.id);

    if (assetIds.length === 0) {
      return { expiredReservations: 0, releasedAssets: 0 };
    }

    // 2. Marcar reservas vencidas como EXPIRED
    const expiredReservations = await tx.reservations.updateMany({
      where: {
        asset_id: { in: assetIds },
        status: "ACTIVE",
        expires_at: { lte: new Date() },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // 3. Liberar assets (commercial_status = AVAILABLE)
    const releasedResult = await tx.$executeRaw`
      UPDATE inventory.assets a
      SET commercial_status = 'AVAILABLE',
          updated_at = CURRENT_TIMESTAMP
      WHERE a.id = ANY(${assetIds}::text[])
        AND a.status = 'AVAILABLE'
        AND NOT EXISTS (
          SELECT 1
          FROM crm.reservations r
          WHERE r.asset_id = a.id
            AND r.status = 'ACTIVE'
            AND r.expires_at > CURRENT_TIMESTAMP
        )
    `;
    const releasedAssets = { count: releasedResult };

    // 4. Borrar holds activos
    await tx.asset_active_holds.deleteMany({
      where: { asset_id: { in: assetIds } },
    });

    // 5. Timeline + domain events para cada asset
    for (const assetId of assetIds) {
      await tx.asset_timelines.create({
        data: {
          id: randomUUID(),
          asset_id: assetId,
          previous_status: "RESERVATION_HOLD",
          new_status: "AVAILABLE",
          action_type: "RESERVATION_EXPIRED",
          details: JSON.stringify({
            reason: "Reserva vencida automáticamente",
            expiredAt: new Date().toISOString(),
          }),
        },
      });

      await tx.inventory_domain_events.create({
        data: {
          id: randomUUID(),
          event_type: "reservation_expired",
          aggregate_type: "ASSET",
          aggregate_id: assetId,
          payload: {
            reason: "Reserva vencida automáticamente",
            expiredAt: new Date().toISOString(),
          } as any,
        },
      });
    }

    return {
      expiredReservations: expiredReservations.count,
      releasedAssets: releasedAssets.count,
    };
  });
}