import { describe, it, expect } from "vitest";
import {
  createLeadSchema,
  contactLeadSchema,
  qualifyLeadSchema,
} from "../src/modules/crm/lead.schema";

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

  it("rechaza source invalido", () => {
    const result = createLeadSchema.safeParse({
      source: "INVALID",
      fullName: "Juan Perez",
    });
    expect(result.success).toBe(false);
  });
});

describe("Contact schema", () => {
  it("acepta contacto valido con CALL", () => {
    const result = contactLeadSchema.safeParse({
      outcome: "CONTACTED",
      type: "CALL",
      notes: "Cliente interesado",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza outcome invalido", () => {
    const result = contactLeadSchema.safeParse({
      outcome: "INVALID",
      type: "CALL",
    });
    expect(result.success).toBe(false);
  });

  it("acepta descalificacion", () => {
    const result = contactLeadSchema.safeParse({
      outcome: "DISQUALIFIED",
      type: "CALL",
    });
    expect(result.success).toBe(true);
  });
});

describe("Qualify schema", () => {
  it("acepta qualify con monto", () => {
    const result = qualifyLeadSchema.safeParse({
      amount: 35000,
      currency: "PEN",
    });
    expect(result.success).toBe(true);
  });

  it("acepta qualify sin monto", () => {
    const result = qualifyLeadSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("rechaza monto negativo", () => {
    const result = qualifyLeadSchema.safeParse({ amount: -100 });
    expect(result.success).toBe(false);
  });

  it("rechaza currency distinto a 3 letras", () => {
    const result = qualifyLeadSchema.safeParse({
      amount: 100,
      currency: "PENNESS",
    });
    expect(result.success).toBe(false);
  });
});