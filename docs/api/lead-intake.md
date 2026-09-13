# POST /public/leads

Endpoint publico que consume Gamma desde el formulario web.

## Request

    {
      "source": "WEB_FORM",
      "fullName": "Juan Perez",
      "email": "juan@example.com",
      "phone": "+51999999999",
      "message": "Quiero info del Lote Residencial A-12",
      "assetId": "LOT-ZN-001"
    }

## Campos

- source: enum (WEB_FORM, WHATSAPP, PHONE, REFERRAL, OTHER) - obligatorio
- fullName: string (2-200) - obligatorio
- email: string (email) - opcional
- phone: string (6-30) - opcional
- message: string (max 2000) - opcional
- assetId: string - opcional (codigo del Asset de Alpha)

## Response 201

    {
      "id": "cmtz5rv560000kicd6tp31ski",
      "status": "ASSIGNED",
      "assignedTo": "advisor-1",
      "slaDueAt": "2026-09-13T03:51:52.051Z"
    }

## Errores

- 400 VALIDATION_ERROR - payload invalido
- 500 INTERNAL_ERROR - error inesperado

## Ejemplo con fetch (Gamma)

    const res = await fetch("http://localhost:3000/public/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: "WEB_FORM",
        fullName: "Juan Perez",
        email: "juan@example.com",
        phone: "+51999999999",
        message: "Quiero info del Lote Residencial A-12",
        assetId: "LOT-ZN-001",
      }),
    });
    const data = await res.json();
    console.log(data);

## Notas para Gamma

- El endpoint es publico, no requiere autenticacion.
- El campo assetId es opcional pero recomendado, para que el Lead tenga contexto de la propiedad consultada.
- Si el formulario no incluye assetId, el Lead se crea igual pero sin referencia al activo.
- El status inicial siempre es ASSIGNED y assignedTo es un asesor asignado por round-robin.
- El slaDueAt indica cuando debe ocurrir el primer contacto (2 horas desde la creacion).
