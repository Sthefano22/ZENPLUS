import { z } from 'zod';

export const operationTypeEnum = z.enum(['SALE', 'RENT']);
export const assetTypeEnum = z.enum(['LOT', 'APARTMENT', 'HOUSE', 'COMMERCIAL_SPACE']);

const requirementBaseSchema = z.object({
  opportunityId: z.string().min(1),
  operationType: operationTypeEnum,
  assetType: assetTypeEnum.optional(),
  zones: z.array(z.string()).min(1, 'Debe incluir al menos una zona'),
  budgetMin: z.number().positive().optional(),
  budgetMax: z.number().positive().optional(),
  currency: z.string().default('PEN'),
  areaMin: z.number().positive().optional(),
  areaMax: z.number().positive().optional(),
  attributes: z.record(z.any()).optional(),
  timeHorizon: z.string().optional(),
});

export const createRequirementSchema = requirementBaseSchema.refine(
  (data) => !data.budgetMin || !data.budgetMax || data.budgetMin <= data.budgetMax,
  { message: 'budgetMin no puede ser mayor que budgetMax', path: ['budgetMin'] }
);

export const updateRequirementSchema = requirementBaseSchema
  .omit({ opportunityId: true })
  .partial();

export type CreateRequirementInput = z.infer<typeof createRequirementSchema>;
export type UpdateRequirementInput = z.infer<typeof updateRequirementSchema>;