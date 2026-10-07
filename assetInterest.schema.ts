import { z } from 'zod';

export const interestStatusEnum = z.enum([
  'SUGGESTED',
  'SENT',
  'INTERESTED',
  'DISCARDED',
]);

export const createAssetInterestSchema = z.object({
  opportunityId: z.string().min(1),
  assetId: z.string().min(1),
  status: interestStatusEnum.default('SUGGESTED'),
  notes: z.string().optional(),
});

export const updateAssetInterestSchema = z.object({
  status: interestStatusEnum,
  notes: z.string().optional(),
});

export type CreateAssetInterestInput = z.infer<typeof createAssetInterestSchema>;
export type UpdateAssetInterestInput = z.infer<typeof updateAssetInterestSchema>;