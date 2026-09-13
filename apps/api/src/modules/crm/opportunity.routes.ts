import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import { track } from "../../lib/analytics";
import { z } from "zod";

const stageChangeSchema = z.object({
  stage: z.enum([
    "NEW",
    "QUALIFIED",
    "VISIT_SCHEDULED",
    "OFFER",
    "RESERVATION",
    "WON",
    "LOST",
  ]),
  closeReason: z.string().max(500).optional(),
});

export async function opportunityRoutes(app: FastifyInstance) {
  app.get(
    "/crm/opportunities",
    { preHandler: [(app as any).authenticate] },
    async () => {
      return prisma.opportunity.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          lead: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              assignedTo: true,
              assetId: true,
            },
          },
        },
      });
    }
  );

  app.get(
    "/crm/opportunities/:id",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const opp = await prisma.opportunity.findUnique({
        where: { id: req.params.id },
        include: {
          lead: {
            include: {
              activities: { orderBy: { createdAt: "desc" } },
              party: true,
            },
          },
        },
      });

      if (!opp) {
        return reply.status(404).send({
          error: "OPPORTUNITY_NOT_FOUND",
          requestId: req.id,
        });
      }

      return opp;
    }
  );

  app.get(
    "/crm/pipeline",
    { preHandler: [(app as any).authenticate] },
    async () => {
      const stages = [
        "NEW",
        "QUALIFIED",
        "VISIT_SCHEDULED",
        "OFFER",
        "RESERVATION",
        "WON",
        "LOST",
      ];

      const counts = await Promise.all(
        stages.map(async (stage) => ({
          stage,
          count: await prisma.opportunity.count({
            where: { stage: stage as any },
          }),
        }))
      );

      const total = counts.reduce((sum, c) => sum + c.count, 0);

      return { stages: counts, total };
    }
  );

  app.patch(
    "/crm/opportunities/:id/stage",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const input = stageChangeSchema.parse(req.body);

      try {
        const opp = await prisma.opportunity.update({
          where: { id: req.params.id },
          data: {
            stage: input.stage,
            closedAt:
              input.stage === "WON" || input.stage === "LOST"
                ? new Date()
                : null,
            closeReason: input.closeReason ?? null,
          },
        });

        logger.info(
          { opportunityId: opp.id, stage: input.stage },
          "Opportunity stage changed"
        );

        track("opportunity_stage_changed", {
          opportunityId: opp.id,
          stage: input.stage,
        });

        if (input.stage === "WON") {
          track("opportunity_won", { opportunityId: opp.id });
        } else if (input.stage === "LOST") {
          track("opportunity_lost", {
            opportunityId: opp.id,
            reason: input.closeReason,
          });
        }

        return opp;
      } catch {
        return reply.status(404).send({
          error: "OPPORTUNITY_NOT_FOUND",
          requestId: req.id,
        });
      }
    }
  );
}