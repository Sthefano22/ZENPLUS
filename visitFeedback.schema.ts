import { z } from 'zod';

export const visitOutcomeEnum = z.enum([
  'INTERESTED',
  'NOT_INTERESTED',
  'NEEDS_FOLLOWUP',
  'READY_TO_OFFER',
]);

export const registerVisitFeedbackSchema = z.object({
  outcome: visitOutcomeEnum,
  interestLevel: z.number().int().min(1).max(5).optional(),
  nextAction: z.string().optional(),
  nextActionAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type RegisterVisitFeedbackInput = z.infer<typeof registerVisitFeedbackSchema>;