import { z } from "zod";

export const createAssetSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  assetType: z.enum(["LOT", "APARTMENT", "HOUSE", "COMMERCIAL_SPACE"]),
  areaM2: z.number().positive(),
  currency: z.string().length(3).default("USD"),
  currentPrice: z.number().positive(),
  ownerPartyId: z.string().uuid().optional(),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;

export const changeStatusSchema = z.object({
  nextStatus: z.enum([
    "DRAFT",
    "UNDER_REVIEW",
    "IN_REVIEW",
    "AVAILABLE",
    "RESERVED",
    "SOLD",
  ]),
  notes: z.string().max(500).optional(),
});

export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;

export const publicAssetsQuerySchema = z.object({
  assetType: z.enum(["LOT", "APARTMENT", "HOUSE", "COMMERCIAL_SPACE"]).optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
});