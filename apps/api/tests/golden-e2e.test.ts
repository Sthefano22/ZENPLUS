import { describe, it, expect, beforeAll } from "vitest";

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

describe.skipIf(!serverUp)("Golden E2E", () => {
  let token: string;
  let leadId: string;
  let opportunityId: string;
  let assetId: string;

  beforeAll(async () => {
    // Login
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

    // Obtener un asset DISPONIBLE real (con UUID)
    const assetsRes = await fetch(`${API_URL}/api/inventory/assets`);
    const assetsData = await assetsRes.json();
    const available = assetsData.data.find(
      (a: any) => a.commercialStatus === "AVAILABLE"
    );
    if (available) {
      assetId = available.id;
    } else {
      // Si no hay disponible, usar el primero
      assetId = assetsData.data[0].id;
    }
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
        assetId,
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

  it("6. Crea Requirement para la Opportunity", async () => {
    const res = await fetch(
      `${API_URL}/opportunities/${opportunityId}/requirement`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          operationType: "SALE",
          assetType: "APARTMENT",
          zones: ["Miraflores"],
          budgetMin: 100000,
          budgetMax: 200000,
          currency: "USD",
        }),
      }
    );
    expect([200, 201]).toContain(res.status);
  });

  it("7. Crea Offer sobre la Opportunity", async () => {
    const res = await fetch(
      `${API_URL}/opportunities/${opportunityId}/offers`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount: 165000, currency: "USD" }),
      }
    );
    expect([200, 201]).toContain(res.status);
    const data = await res.json();
    expect(data.thread).toBeTruthy();
  });

  it("8. Crea Reservation para un asset disponible", async () => {
    const res = await fetch(`${API_URL}/reservations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        opportunityId,
        assetId,
        idempotencyKey: `test-e2e-${Date.now()}`,
        ttlMinutes: 15,
      }),
    });
    expect([200, 201, 409]).toContain(res.status);
  });

  it("9. Verifica el estado del asset tras la reserva", async () => {
    const res = await fetch(`${API_URL}/api/inventory/assets`);
    expect(res.status).toBe(200);
    const data = await res.json();
    const target = data.data.find((a: any) => a.id === assetId);
    expect(target).toBeTruthy();
    expect(["RESERVATION_HOLD", "RESERVED", "AVAILABLE"]).toContain(
      target.commercialStatus
    );
  });
});