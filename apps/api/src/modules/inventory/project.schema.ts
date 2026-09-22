import { z } from "zod";

export const createProjectSchema = z.object({
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  description: z.string().optional(),
  status: z.enum(["PLANNING", "PRE_SALE", "CONSTRUCTION", "DELIVERED"]).default("PLANNING"),
  district: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

export const createUnitSchema = z.object({
  projectId: z.string().uuid(),
  code: z.string().min(2).max(50),
  name: z.string().min(2).max(150),
  unitType: z.string().min(2).max(50),
  areaM2: z.number().positive(),
  bedrooms: z.number().int().nonnegative().default(0),
  bathrooms: z.number().int().nonnegative().default(0),
  currentPrice: z.number().positive(),
  status: z.enum(["AVAILABLE", "RESERVED", "SOLD"]).default("AVAILABLE"),
});

export type CreateUnitInput = z.infer<typeof createUnitSchema>;