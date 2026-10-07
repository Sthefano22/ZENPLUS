import type { FastifyInstance } from 'fastify';
import { createAssetInterestSchema, updateAssetInterestSchema } from './assetInterest.schema';
import { createAssetInterest, listAssetInterestsByOpportunity, updateAssetInterest } from './assetInterest.service';
import { OpportunityNotFoundError, NotFoundError } from './errors';

function handleCrmError(err: unknown, reply: any) {
  if (err instanceof OpportunityNotFoundError || err instanceof NotFoundError) {
    return reply.status(404).send({ type: 'about:blank', title: 'Not Found', status: 404, detail: err.message });
  }
  return reply.status(400).send({ type: 'about:blank', title: 'Bad Request', status: 400, detail: (err as Error).message });
}

export async function assetInterestRoutes(app: FastifyInstance) {
  app.post('/opportunities/:opportunityId/asset-interests', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };
    const parsed = createAssetInterestSchema.safeParse({ ...(request.body as object), opportunityId });
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.status(201).send(await createAssetInterest(parsed.data));
    } catch (err) {
      return handleCrmError(err, reply);
    }
  });

  app.get('/opportunities/:opportunityId/asset-interests', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };
    return reply.send(await listAssetInterestsByOpportunity(opportunityId));
  });

  app.patch('/asset-interests/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateAssetInterestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.send(await updateAssetInterest(id, parsed.data));
    } catch (err) {
      return handleCrmError(err, reply);
    }
  });
}