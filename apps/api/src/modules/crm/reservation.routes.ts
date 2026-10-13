import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  createReservation,
  cancelReservation,
  convertReservation,
  getReservation,
  ReservationConflictError,
  ReservationStateError,
} from "./reservation.service";

const createSchema = z.object({
  opportunityId: z.string().min(1),
  assetId: z.string().min(1),
  offerThreadId: z.string().optional(),
  idempotencyKey: z.string().min(8),
  ttlMinutes: z.number().int().positive().default(15),
});

export async function reservationRoutes(app: FastifyInstance) {
  app.post(
    "/reservations",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const body = createSchema.parse(request.body);
      const user = request.user;
      try {
        const result = await createReservation({
          opportunityId: body.opportunityId,
          assetId: body.assetId,
          offerThreadId: body.offerThreadId,
          idempotencyKey: body.idempotencyKey,
          ttlMinutes: body.ttlMinutes,
          actorId: user.id,
        });
        return reply.status(201).send(result);
      } catch (err) {
        if (
          err instanceof ReservationConflictError ||
          (err as any).statusCode === 409
        ) {
          return reply.status(409).send({ error: (err as Error).message });
        }
        throw err;
      }
    }
  );

  app.post(
    "/reservations/:id/cancel",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const id = request.params.id as string;
      const body = z
        .object({ reason: z.string().optional() })
        .parse(request.body ?? {});
      const user = request.user;
      try {
        const result = await cancelReservation(id, body.reason, user.id);
        return reply.send(result);
      } catch (err) {
        if (err instanceof ReservationStateError) {
          return reply.status(409).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post(
    "/reservations/:id/convert",
    { preHandler: [(app as any).authorize(["ADMIN"])] },
    async (request: any, reply) => {
      const id = request.params.id as string;
      const user = request.user;
      try {
        const result = await convertReservation(id, user.id);
        return reply.status(201).send(result);
      } catch (err) {
        if (err instanceof ReservationStateError) {
          return reply.status(409).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.get(
    "/reservations/:id",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const id = request.params.id as string;
      const result = await getReservation(id);
      return reply.send(result);
    }
  );
}