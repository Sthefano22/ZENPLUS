import { z } from "zod";

export const createLeadSchema = z.object({
  source: z.enum(["WEB_FORM", "WHATSAPP", "PHONE", "REFERRAL", "OTHER"]),
  fullName: z.string().min(2).max(200),
  email: z.string().email().optional(),
  phone: z.string().min(6).max(30).optional(),
  message: z.string().max(2000).optional(),
  assetId: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const contactLeadSchema = z.object({
  outcome: z.enum(["CONTACTED", "NO_ANSWER", "WRONG_NUMBER", "DISQUALIFIED"]),
  notes: z.string().max(2000).optional(),
  type: z.enum(["CALL", "EMAIL", "WHATSAPP", "MEETING", "NOTE"]),
});

export const qualifyLeadSchema = z.object({
  amount: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
});