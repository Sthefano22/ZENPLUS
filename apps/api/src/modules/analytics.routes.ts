import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { AnalyticsEventSchema } from './analytics.schema';
import { AnalyticsService } from './analytics.service';
const analyticsService = new AnalyticsService();

export async function analyticsRoutes(fastify: FastifyInstance) {
  fastify.post('/events', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // 1. Validar contra el contrato P0
      const validationResult = AnalyticsEventSchema.safeParse(request.body);
      
      if (!validationResult.success) {
        return reply.status(400).send({
          status: 'error',
          message: 'Invalid analytics event contract',
          errors: validationResult.error.format(),
        });
      }

      const event = validationResult.data;

      // 2. Procesar con control de idempotencia
      const result = await analyticsService.ingestEvent(event);

      if (result.status === 'ignored') {
        return reply.status(200).send({ 
          status: 'ignored', 
          message: 'Event already processed' 
        });
      }

      return reply.status(201).send({
        status: 'success',
        eventId: event.eventId,
        timestamp: event.occurredAt,
      });
    } catch (error) {
      return reply.status(500).send({
        status: 'error',
        message: 'Internal server error during event ingestion',
      });
    }
  });
}