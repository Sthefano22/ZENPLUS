import type { FastifyInstance } from 'fastify';
import {createRequirementSchema, updateRequirementSchema} from './requirement.schema';
import {createRequirement, getRequirementByOpportunity, updateRequirement, RequirementNotFoundError} from './requirement.service';

export async function requirementRoutes(app: FastifyInstance) {
  app.post('/opportunities/:opportunityId/requirement', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };
    const parsed = createRequirementSchema.safeParse({
      ...(request.body as object),
      opportunityId,
    });

    if (!parsed.success) {
      return reply.status(422).send({
        type: 'about:blank',
        title: 'Validation Error',
        status: 422,
        errors: parsed.error.flatten(),
      });
    }

    try {
      const requirement = await createRequirement(parsed.data);
      return reply.status(201).send(requirement);
    } catch (err) {
      return reply.status(400).send({
        type: 'about:blank',
        title: 'Bad Request',
        status: 400,
        detail: (err as Error).message,
      });
    }
  });

  app.get('/opportunities/:opportunityId/requirement', async (request, reply) => {
    const { opportunityId } = request.params as { opportunityId: string };

    try {
      const requirement = await getRequirementByOpportunity(opportunityId);
      return reply.send(requirement);
    } catch (err) {
      if (err instanceof RequirementNotFoundError) {
        return reply.status(404).send({
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: err.message,
        });
      }
      throw err;
    }
  });

  app.patch('/requirement/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = updateRequirementSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.status(422).send({
        type: 'about:blank',
        title: 'Validation Error',
        status: 422,
        errors: parsed.error.flatten(),
      });
    }

    try {
      const requirement = await updateRequirement(id, parsed.data);
      return reply.send(requirement);
    } catch (err) {
      if (err instanceof RequirementNotFoundError) {
        return reply.status(404).send({
          type: 'about:blank',
          title: 'Not Found',
          status: 404,
          detail: err.message,
        });
      }
      throw err;
    }
  });
}