import { FastifyInstance } from "fastify";
import { z } from "zod";
import { randomUUID } from "crypto";
import { prisma } from "../../lib/prisma";

const ListAssetsQuery = z.object({
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  commercialStatus: z
    .enum(["AVAILABLE", "RESERVATION_HOLD", "RESERVED", "SOLD", "UNAVAILABLE"])
    .optional(),
});

const HoldBody = z.object({
  reservationId: z.string().min(1),
  actorId: z.string().optional(),
  ttlMinutes: z.number().int().positive().default(15),
});

export async function availabilityRoutes(app: FastifyInstance) {
  // GET /api/inventory/assets — listado con proyección de hold
  app.get("/api/inventory/assets", async (request, reply) => {
    const q = ListAssetsQuery.parse(request.query ?? {});

    const assets = await prisma.assets.findMany({
      where: {
        ...(q.minPrice ? { price: { gte: q.minPrice } } : {}),
        ...(q.maxPrice ? { price: { lte: q.maxPrice } } : {}),
        ...(q.commercialStatus
          ? { commercial_status: q.commercialStatus }
          : {}),
      },
      include: { active_hold: true },
      orderBy: { price: "asc" },
    });

    const now = new Date();
    const data = assets.map((a) => {
      const holdActive =
        a.active_hold && a.active_hold.expires_at > now;
      return {
        id: a.id,
        code: a.code,
        title: a.title,
        details: a.details,
        price: a.price,
        area: a.area,
        commercialStatus: holdActive ? "RESERVATION_HOLD" : a.commercial_status,
        publicationStatus: a.publication_status,
        holdExpiresAt: holdActive ? a.active_hold!.expires_at : null,
      };
    });

    return reply.send({ success: true, total: data.length, data });
  });

  // POST /api/inventory/assets/:id/hold — transacción atómica
  app.post("/api/inventory/assets/:id/hold", async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = HoldBody.parse(request.body);

    try {
      const result = await prisma.$transaction(async (tx) => {
        // Bloqueo pesimista usando SQL raw
        const locked = await tx.$queryRaw<
          Array<{ id: string; commercial_status: string }>
        >`SELECT id, commercial_status FROM inventory.assets WHERE id = ${id}::text FOR UPDATE`;

        if (locked.length === 0) {
          throw Object.assign(new Error("ASSET_NOT_FOUND"), { statusCode: 404 });
        }

        const current = locked[0].commercial_status;

        // Verificar hold activo
        const activeHold = await tx.asset_active_holds.findFirst({
          where: {
            asset_id: id,
            expires_at: { gt: new Date() },
          },
        });

        if (current !== "AVAILABLE" || activeHold) {
          throw Object.assign(new Error("ASSET_NOT_AVAILABLE"), {
            statusCode: 409,
          });
        }

        const expiresAt = new Date(Date.now() + body.ttlMinutes * 60 * 1000);

        await tx.asset_active_holds.upsert({
          where: { asset_id: id },
          create: {
            asset_id: id,
            reservation_id: body.reservationId,
            expires_at: expiresAt,
          },
          update: {
            reservation_id: body.reservationId,
            expires_at: expiresAt,
          },
        });

        await tx.assets.update({
          where: { id },
          data: { commercial_status: "RESERVATION_HOLD" },
        });

        // Historial
        await tx.asset_timelines.create({
          data: {
            id: randomUUID(),
            asset_id: id,
            previous_status: "AVAILABLE",
            new_status: "RESERVATION_HOLD",
            action_type: "HOLD_RESERVATION_CREATED",
            details: JSON.stringify({
              reservationId: body.reservationId,
              actorId: body.actorId,
            }),
          },
        });

        // Domain event
        await tx.inventory_domain_events.create({
          data: {
            id: randomUUID(),
            event_type: "asset_availability_changed",
            aggregate_type: "ASSET",
            aggregate_id: id,
            payload: {
              assetId: id,
              reservationId: body.reservationId,
              previousStatus: "AVAILABLE",
              newStatus: "RESERVATION_HOLD",
              reason: "HOLD_RESERVATION_CREATED",
              holdExpiresInMinutes: body.ttlMinutes,
              actorId: body.actorId ?? null,
              occurredAt: new Date().toISOString(),
            } as any,
          },
        });

        return {
          assetId: id,
          reservationId: body.reservationId,
          status: "RESERVATION_HOLD",
          expiresInMinutes: body.ttlMinutes,
        };
      });

      return reply.status(201).send({ success: true, data: result });
    } catch (err: any) {
      const statusCode = err.statusCode ?? 500;
      const message = err.message ?? "Error al procesar la reserva";
      return reply
        .status(codeFromError(statusCode))
        .send({ success: false, error: message });
    }
  });
}

function codeFromError(statusCode: number): number {
  return statusCode === 404 || statusCode === 409 ? statusCode : 500;
}