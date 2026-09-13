import { describe, it, expect } from "vitest";
import { z } from "zod";

// Schema inline (debe coincidir con opportunity.routes.ts)
const stageChangeSchema = z.object({
  stage: z.enum([
    "NEW",
    "QUALIFIED",
    "VISIT_SCHEDULED",
    "OFFER",
    "RESERVATION",
    "WON",
    "LOST",
  ]),
  closeReason: z.string().max(500).optional(),
});

describe("Opportunity stage schema", () => {
  it("acepta stage valido", () => {
    const result = stageChangeSchema.safeParse({ stage: "WON" });
    expect(result.success).toBe(true);
  });

  it("rechaza stage invalido", () => {
    const result = stageChangeSchema.safeParse({ stage: "INVALID" });
    expect(result.success).toBe(false);
  });

  it("acepta closeReason al cerrar", () => {
    const result = stageChangeSchema.safeParse({
      stage: "LOST",
      closeReason: "Cliente no interesado",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza closeReason muy largo", () => {
    const result = stageChangeSchema.safeParse({
      stage: "WON",
      closeReason: "a".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("acepta todos los stages del pipeline", () => {
    const stages = [
      "NEW",
      "QUALIFIED",
      "VISIT_SCHEDULED",
      "OFFER",
      "RESERVATION",
      "WON",
      "LOST",
    ];
    stages.forEach((stage) => {
      const result = stageChangeSchema.safeParse({ stage });
      expect(result.success).toBe(true);
    });
  });
});