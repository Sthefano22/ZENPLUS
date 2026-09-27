import { z } from 'zod';

export const visitStatusEnum = z.enum([
  'SCHEDULED',
  'COMPLETED',
  'CANCELLED',
  'NO_SHOW',
]);

export const scheduleVisitSchema = z.object({
  opportunityId: z.string().min(1),
  assetId: z.string().min(1),
  scheduledAt: z.coerce.date(),
  notes: z.string().optional(),
});

export const rescheduleVisitSchema = z.object({
  scheduledAt: z.coerce.date(),
  reason: z.string().optional(),
});

export const cancelVisitSchema = z.object({
  reason: z.string().min(1, 'Debes indicar el motivo de cancelación'),
});

export const completeVisitSchema = z.object({
  notes: z.string().optional(),
});

export const noShowVisitSchema = z.object({
  notes: z.string().optional(),
});

export type ScheduleVisitInput = z.infer<typeof scheduleVisitSchema>;
export type RescheduleVisitInput = z.infer<typeof rescheduleVisitSchema>;
export type CancelVisitInput = z.infer<typeof cancelVisitSchema>;
export type CompleteVisitInput = z.infer<typeof completeVisitSchema>;
export type NoShowVisitInput = z.infer<typeof noShowVisitSchema>;