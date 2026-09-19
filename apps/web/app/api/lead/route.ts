import { NextRequest, NextResponse } from "next/server";
import { validarFormularioConsulta } from "@/lib/validators";

const BETA_CRM_LEAD_ENDPOINT = process.env.BETA_CRM_LEAD_ENDPOINT;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nombre, email, telefono, mensaje, propiedadRef } = body ?? {};

  const { valido, errores } = validarFormularioConsulta({
    nombre,
    email,
    telefono,
    mensaje,
  });

  if (!valido) {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos.", errores },
      { status: 400 }
    );
  }

  if (!BETA_CRM_LEAD_ENDPOINT) {
    console.log("[lead:mock]", { nombre, email, telefono, mensaje, propiedadRef });
    return NextResponse.json({ ok: true, data: { id: `mock-${Date.now()}` } });
  }

  try {
    // ✅ ADAPTAR payload al formato de Beta
    const payload = {
      source: "WEB_FORM",
      fullName: nombre,
      email,
      phone: telefono || undefined,
      message: mensaje,
      assetId: propiedadRef || undefined,
    };

    console.log("[lead:to-beta]", payload);

    const res = await fetch(BETA_CRM_LEAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      console.error("[lead:beta-error]", res.status, error);
      return NextResponse.json(
        { ok: false, error: error.message ?? "El CRM rechazó la solicitud." },
        { status: 502 }
      );
    }

    const data = await res.json();
    console.log("[lead:beta-ok]", data);
    return NextResponse.json({ ok: true, data });
  } catch (err) {
    console.error("[lead:fetch-error]", err);
    return NextResponse.json(
      { ok: false, error: "No se pudo contactar al CRM." },
      { status: 502 }
    );
  }
}