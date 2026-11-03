import { z } from 'zod';

export const ActorSchema = z.object({
  id: z.string(),
  role: z.string(),
});

export const AnalyticsEventSchema = z.object({
  eventId: z.string().uuid(),
  name: z.enum([
    'lead_created', 
    'visit_scheduled', 
    'offer_made', 
    'reservation_completed'
  ]),
  version: z.string().regex(/^v[0-9]+\.[0-9]+$/),
  occurredAt: z.string().datetime(),
  actor: ActorSchema,
  context: z.object({
    source: z.string().optional(),
    campaign: z.string().optional(),
    referrer: z.string().optional(),
  }).optional(),
  payload: z.record(z.any()),
});

export type AnalyticsEventDTO = z.infer<typeof AnalyticsEventSchema>;