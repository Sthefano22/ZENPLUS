import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  submitOffer,
  counterOffer,
  acceptOffer,
  rejectOffer,
  getOfferThread,
  listOfferThreads,
  OfferStateError,
} from "./offer.service";

const submitSchema = z.object({
  assetId: z.string().optional(),
  amount: z.number().positive(),
  currency: z.string().default("USD"),
  conditions: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

const counterSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().optional(),
  conditions: z.record(z.any()).optional(),
  notes: z.string().optional(),
});

export async function offerRoutes(app: FastifyInstance) {
  app.post(
    "/opportunities/:opportunityId/offers",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const opportunityId = request.params.opportunityId as string;
      const body = submitSchema.parse(request.body);
      const user = request.user;
      const actorId = user.sub ?? user.id;
      const result = await submitOffer({
        opportunityId,
        assetId: body.assetId,
        amount: body.amount,
        currency: body.currency,
        conditions: body.conditions,
        actorId,
        actorRole: user.role,
        notes: body.notes,
      });
      return reply.status(201).send(result);
    }
  );

  app.post(
    "/offers/:threadId/counter",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const threadId = request.params.threadId as string;
      const body = counterSchema.parse(request.body);
      const user = request.user;
      const actorId = user.sub ?? user.id;
      try {
        const result = await counterOffer({
          threadId,
          amount: body.amount,
          currency: body.currency,
          conditions: body.conditions,
          actorId,
          actorRole: user.role,
          notes: body.notes,
        });
        return reply.send(result);
      } catch (err) {
        if (err instanceof OfferStateError) {
          return reply.status(409).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post(
    "/offers/:threadId/accept",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const threadId = request.params.threadId as string;
      const user = request.user;
      const actorId = user.sub ?? user.id;
      try {
        const result = await acceptOffer(threadId, actorId);
        return reply.send(result);
      } catch (err) {
        if (err instanceof OfferStateError) {
          return reply.status(409).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post(
    "/offers/:threadId/reject",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const threadId = request.params.threadId as string;
      const user = request.user;
      const actorId = user.sub ?? user.id;
      try {
        const result = await rejectOffer(threadId, actorId);
        return reply.send(result);
      } catch (err) {
        if (err instanceof OfferStateError) {
          return reply.status(409).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.get(
    "/offers/:threadId",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const threadId = request.params.threadId as string;
      const result = await getOfferThread(threadId);
      return reply.send(result);
    }
  );

  app.get(
    "/opportunities/:opportunityId/offers",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const opportunityId = request.params.opportunityId as string;
      const result = await listOfferThreads(opportunityId);
      return reply.send(result);
    }
  );
}