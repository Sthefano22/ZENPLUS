import { describe, it, expect } from "vitest";
import { createLeadSchema } from "../src/modules/crm/lead.schema";

describe("Lead schema", () => {
  it("rechaza payload sin fullName", () => {
    const result = createLeadSchema.safeParse({ source: "WEB_FORM" });
    expect(result.success).toBe(false);
  });

  it("acepta payload minimo valido", () => {
    const result = createLeadSchema.safeParse({
      source: "WEB_FORM",
      fullName: "Juan Perez",
      email: "juan@example.com",
    });
    expect(result.success).toBe(true);
  });
});
