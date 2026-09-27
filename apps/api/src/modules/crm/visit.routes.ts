import type { FastifyInstance } from 'fastify';
import {scheduleVisitSchema, rescheduleVisitSchema, cancelVisitSchema, completeVisitSchema, noShowVisitSchema} from './visit.schema';
import {scheduleVisit, getVisit, rescheduleVisit, cancelVisit, completeVisit, markNoShow, VisitNotFoundError, InvalidVisitTransitionError} from './visit.service';

function handleVisitError(err: unknown, reply: any) {
  if (err instanceof VisitNotFoundError) {
    return reply.status(404).send({
      type: 'about:blank', title: 'Not Found', status: 404, detail: err.message,
    });
  }
  if (err instanceof InvalidVisitTransitionError) {
    return reply.status(409).send({
      type: 'about:blank', title: 'Conflict', status: 409, detail: err.message,
    });
  }
  return reply.status(400).send({
    type: 'about:blank', title: 'Bad Request', status: 400, detail: (err as Error).message,
  });
}

export async function visitRoutes(app: FastifyInstance) {
  app.post('/visits', async (request, reply) => {
    const parsed = scheduleVisitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({
        type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten(),
      });
    }
    const createdBy = (request as any).user?.id ?? 'system';
    try {
      const visit = await scheduleVisit(parsed.data, createdBy);
      return reply.status(201).send(visit);
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });

  app.get('/visits/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      return reply.send(await getVisit(id));
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });

  app.post('/visits/:id/reschedule', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = rescheduleVisitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.send(await rescheduleVisit(id, parsed.data));
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });

  app.post('/visits/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = cancelVisitSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.send(await cancelVisit(id, parsed.data));
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });

  app.post('/visits/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = completeVisitSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.send(await completeVisit(id, parsed.data));
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });

  app.post('/visits/:id/no-show', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parsed = noShowVisitSchema.safeParse(request.body ?? {});
    if (!parsed.success) {
      return reply.status(422).send({ type: 'about:blank', title: 'Validation Error', status: 422, errors: parsed.error.flatten() });
    }
    try {
      return reply.send(await markNoShow(id, parsed.data));
    } catch (err) {
      return handleVisitError(err, reply);
    }
  });
}