import type { FastifyInstance } from 'fastify';
import { createCommercialEventSchema } from './commercialEvent.schema';
import { logCommercialEvent, getTimelineByOpportunity } from './commercialEvent.service';
import { OpportunityNotFoundError } from './errors';

export async function commercialEventRoutes(app: FastifyInstance) {
  app.post('/opportunities/:opportunityId/events', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };
    const parsed = createCommercialEventSchema.safeParse({ ...(request.body as object), opportunityId });
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.status(201).send(await logCommercialEvent(parsed.data));
    } catch (err) {
      if (err instanceof OpportunityNotFoundError) {
        return reply.status(404).send({ type: 'about:blank', title: 'Not Found', status: 404, detail: err.message });
      }
      throw err;
    }
  });

  app.get('/opportunities/:opportunityId/events', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };
    return reply.send(await getTimelineByOpportunity(opportunityId));
  });
}