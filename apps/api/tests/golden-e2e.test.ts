import { describe, it, expect, beforeAll } from "vitest";

const API_URL = process.env.API_URL ?? "http://localhost:3000";
async function isServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/health`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

const serverUp = await isServerRunning();
describe.skipIf(!serverUp)("Golden E2E", () => {
  let token: string;
  let leadId: string;
  let opportunityId: string;

  beforeAll(async () => {
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "advisor@zenplus.pe",
        password: "secret123",
      }),
    });
    const loginData = await loginRes.json();
    token = loginData.token;
    expect(token).toBeTruthy();
  });

  it("1. Crea un Lead desde Web", async () => {
    const res = await fetch(`${API_URL}/public/leads`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "WEB_FORM",
        fullName: "Test E2E",
        email: `test-${Date.now()}@e2e.com`,
        phone: "+51999888777",
        message: "Test Golden E2E",
        assetId: "DEP-ZN-101",
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    leadId = data.id;
    expect(leadId).toBeTruthy();
  });

  it("2. Contacta al Lead", async () => {
    const res = await fetch(`${API_URL}/crm/leads/${leadId}/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        outcome: "CONTACTED",
        type: "CALL",
        notes: "Contactado en test",
      }),
    });
    expect(res.status).toBe(200);
  });

  it("3. Califica el Lead → Opportunity", async () => {
    const res = await fetch(`${API_URL}/crm/leads/${leadId}/qualify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ amount: 100000, currency: "USD" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    opportunityId = data.id;
    expect(opportunityId).toBeTruthy();
  });

  it("4. Verifica el pipeline", async () => {
    const res = await fetch(`${API_URL}/crm/pipeline`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBeGreaterThan(0);
  });

  it("5. Public assets están disponibles", async () => {
    const res = await fetch(`${API_URL}/public/assets`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  });
});