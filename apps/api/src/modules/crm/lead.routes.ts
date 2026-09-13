import type { FastifyInstance } from "fastify";
import {
  createLeadSchema,
  contactLeadSchema,
  qualifyLeadSchema,
} from "./lead.schema";
import {
  createLead,
  listMyLeads,
  registerContact,
  qualifyLead,
} from "./lead.service";

export async function leadRoutes(app: FastifyInstance) {
  app.post("/public/leads", async (req, reply) => {
    const input = createLeadSchema.parse(req.body);
    const lead = await createLead(input);
    return reply.status(201).send({
      id: lead.id,
      status: lead.status,
      assignedTo: lead.assignedTo,
      slaDueAt: lead.slaDueAt,
    });
  });

  app.get(
    "/crm/leads/me",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => listMyLeads(req.user.sub)
  );

  app.post(
    "/crm/leads/:id/contact",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const input = contactLeadSchema.parse(req.body);
      try {
        return await registerContact(req.params.id, req.user.sub, input);
      } catch (err: any) {
        if (err.message === "LEAD_NOT_FOUND") {
          return reply.status(404).send({
            error: "LEAD_NOT_FOUND",
            requestId: req.id,
          });
        }
        throw err;
      }
    }
  );

  app.post(
    "/crm/leads/:id/qualify",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const input = qualifyLeadSchema.parse(req.body);
      try {
        return await qualifyLead(req.params.id, req.user.sub, input);
      } catch (err: any) {
        if (err.message === "LEAD_NOT_FOUND") {
          return reply.status(404).send({
            error: "LEAD_NOT_FOUND",
            requestId: req.id,
          });
        }
        throw err;
      }
    }
  );
}