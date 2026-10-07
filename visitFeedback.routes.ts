import type { FastifyInstance } from 'fastify';
import { registerVisitFeedbackSchema } from './visitFeedback.schema';
import { registerVisitFeedback, getVisitFeedback } from './visitFeedback.service';
import { VisitNotFoundError } from './visit.service';
import { InvalidStateTransitionError } from './errors';

function handleFeedbackError(err: unknown, reply: any) {
  if (err instanceof VisitNotFoundError) {
    return reply.status(404).send({ type: 'about:blank', title: 'Not Found', status: 404, detail: err.message });
  }
  if (err instanceof InvalidStateTransitionError) {
    return reply.status(409).send({ type: 'about:blank', title: 'Conflict', status: 409, detail: err.message });
  }
  throw err;
}

export async function visitFeedbackRoutes(app: FastifyInstance) {
  app.post('/visits/:id/feedback', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = registerVisitFeedbackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.status(201).send(await registerVisitFeedback(id, parsed.data));
    } catch (err) {
      return handleFeedbackError(err, reply);
    }
  });

  app.get('/visits/:id/feedback', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      return reply.send(await getVisitFeedback(id));
    } catch (err) {
      return handleFeedbackError(err, reply);
    }
  });
}