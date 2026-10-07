import { z } from 'zod';

export const eventTypeEnum = z.enum([
  'OPPORTUNITY_CREATED',
  'REQUIREMENT_SET',
  'ASSET_SUGGESTED',
  'VISIT_SCHEDULED',
  'VISIT_COMPLETED',
  'VISIT_CANCELLED',
  'FEEDBACK_REGISTERED',
  'NOTE',
]);

export const createCommercialEventSchema = z.object({
  opportunityId: z.string().min(1),
  type: eventTypeEnum,
  message: z.string().min(1),
  metadata: z.record(z.any()).optional(),
});

export type CreateCommercialEventInput = z.infer<typeof createCommercialEventSchema>;