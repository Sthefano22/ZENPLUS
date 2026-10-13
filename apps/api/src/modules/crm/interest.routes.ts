import type { FastifyInstance } from "fastify";
import { z } from "zod";
import {
  addAssetInterest,
  listAssetInterests,
  updateInterestStatus,
  removeInterest,
} from "./interest.service";

const addSchema = z.object({
  assetId: z.string().min(1),
  status: z.enum(["SUGGESTED", "SENT", "INTERESTED", "DISCARDED"]).optional(),
  notes: z.string().optional(),
});

const updateSchema = z.object({
  status: z.enum(["SUGGESTED", "SENT", "INTERESTED", "DISCARDED"]),
  notes: z.string().optional(),
});

export async function interestRoutes(app: FastifyInstance) {
  app.post(
    "/opportunities/:opportunityId/interests",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const opportunityId = request.params.opportunityId as string;
      const body = addSchema.parse(request.body);
      const user = request.user;
      const result = await addAssetInterest({
        opportunityId,
        assetId: body.assetId,
        status: body.status,
        notes: body.notes,
        createdBy: user.id,
      });
      return reply.status(201).send(result);
    }
  );

  app.get(
    "/opportunities/:opportunityId/interests",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const opportunityId = request.params.opportunityId as string;
      const result = await listAssetInterests(opportunityId);
      return reply.send(result);
    }
  );

  app.patch(
    "/interests/:id",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const id = request.params.id as string;
      const body = updateSchema.parse(request.body);
      const result = await updateInterestStatus(id, body.status, body.notes);
      return reply.send(result);
    }
  );

  app.delete(
    "/interests/:id",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply) => {
      const id = request.params.id as string;
      await removeInterest(id);
      return reply.status(204).send();
    }
  );
}