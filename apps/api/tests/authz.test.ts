import { describe, it, expect } from "vitest";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

async function isServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, {
      signal: AbortSignal.timeout(2000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

const serverUp = await isServerRunning();

describe.skipIf(!serverUp)("AuthZ · Endpoints protegidos requieren token", () => {
  it("POST /reservations sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it("POST /reservations/:id/convert sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/reservations/fake-id/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),      // ← AÑADIDO
    });
    expect(res.status).toBe(401);
  });

  it("POST /offers/:threadId/accept sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/offers/fake-id/accept`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),      // ← AÑADIDO
    });
    expect(res.status).toBe(401);
  });

  it("GET /crm/opportunities sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/crm/opportunities`);
    expect(res.status).toBe(401);
  });

  it("POST /visits sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/visits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(401);
  });

  it("POST /opportunities/:id/interests sin token retorna 401", async () => {
    const res = await fetch(`${API_URL}/opportunities/fake-id/interests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetId: "DEP-MIRA-101" }),
    });
    expect(res.status).toBe(401);
  });
});