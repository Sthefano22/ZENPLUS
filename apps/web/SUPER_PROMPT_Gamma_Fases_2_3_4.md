# SUPER PROMPT — ZENPLUS · Célula Gamma · Cierre de Fases 2 → 3 → 4

> Pégalo completo en tu agente de código (Claude Code recomendado) con el repositorio abierto y las 4 guías (.docx v2.0, v3.0, v4.0, v5.0) disponibles en el workspace.
> Está escrito a partir de una auditoría real del ZIP `zenplus_ola1_ligero_tema_v4`, no de suposiciones.

---

## 0. ROL Y REGLAS DE ORO

Actúas como **ingeniero frontend senior de la Célula Gamma de ZENPLUS OS**. Tu trabajo es llevar el repositorio desde su estado real actual hasta cumplir el Exit Gate de las Fases 2, 3 y 4, **en ese orden**, sin saltarte dependencias.

Reglas innegociables:

1. **No asumas nada.** Antes de tocar código, lee las guías `.docx` (Fase 2, 3 y 4) y el repo. Si algo no está en las guías, en el código o en este prompt, **no lo inventes**: regístralo como dependencia abierta y propone una interfaz temporal explícita.
2. **Contrato antes que improvisación.** Si falta un endpoint, DTO o regla de Alpha/Beta, define un *contrato temporal* en `docs/contracts/` (tipos TS + ejemplo JSON + endpoint propuesto) marcado como `PROPUESTO — pendiente de confirmación`, implementa contra un mock que respete ese contrato y registra la deuda en `docs/DEUDA.md`.
3. **La UI nunca es el mecanismo de autorización.** El frontend refleja permisos que el backend decide. Ocultar un botón no cuenta como seguridad.
4. **Nada de lógica de negocio crítica solo en frontend** (reglas de reserva, montos, estados de operación, cálculo de KPIs).
5. **No se reabre trabajo completado**: los defectos se corrigen con tickets correctivos; no se reescriben módulos sin necesidad.
6. **DONE = demostrable.** Un ticket solo está cerrado si tiene código, tests, documentación y evidencia reproducible. "Se ve bien" no es evidencia.
7. **No hagas cosas fuera del alcance de cada fase** (ver sección 9).
8. **Sé honesto en los reportes**: si algo no se pudo verificar o requiere acción humana, dilo explícitamente. Nunca marques un checkbox del Exit Gate que no puedas demostrar.

---

## 1. FUENTE DE VERDAD

| Documento | Gobierna |
|---|---|
| Guía Gamma v2.0 (Fase 2 — Commercial Engine) | Tickets GAM2-001…012, Exit Gate F2 |
| Guía Gamma v3.0 (Fase 3 — Transaction & Experience) | Tickets GAM3-001…012, Exit Gate F3 |
| Guía Gamma v4.0 (Fase 4 — Data & Management Intelligence) | Tickets GAM4-001…012, Exit Gate F4 |
| Guía Gamma v5.0 (Fase 5 — XENIA Intelligence & AI) | **Solo lectura. NO implementar nada de Fase 5.** |
| `README de coordinación con Alpha y Beta.txt`, `components/README.md`, `docs/DEUDA.md` | Contratos y deuda vigentes |

Si un criterio de aceptación de este prompt contradice una guía, **gana la guía** y lo reportas.

---

## 2. ESTADO REAL VERIFICADO DEL REPOSITORIO (punto de partida)

**Stack:** Next.js 14 (App Router) · React 18 · TypeScript · Tailwind 3 (tokens CSS: `bg-surface`, `text-on-surface`, `border-outline-variant`, `text-primary`, `text-error`…) · `next-intl` (es/en/pt/fr/de) · `motion` · `lucide-react` · Vitest (`environment: 'node'`, alias `@` → raíz).

**Fase 1 — Web pública:** implementada sobre mocks (`lib/api.ts` + flag `NEXT_PUBLIC_USE_REAL_API`). Deuda D-001…D-007 registrada.

**Fase 2 — Commercial Engine (PARCIAL, sobre mocks):**

| Ticket | Estado actual |
|---|---|
| GAM2-001 Workspace | Parcial: `/commercial`, `/commercial/[id]` con tabs (Requirement, Visitas, Oferta, Reserva, Timeline). Falta next action y assets. |
| GAM2-002 Requirement editor | UI completa con validación. No maneja errores server-side comprensibles. |
| GAM2-003 Candidate selector | **NO existe.** Solo `candidateAssetSelection.ts` con `TODO(GAM2-003)`. La propiedad se escribe como slug a mano (VisitaForm, ReservaForm). |
| GAM2-004 Visit scheduler | Solo **crear**. Faltan reprogramar, cancelar, marcar realizada/no show/confirmada. |
| GAM2-005 Visit feedback | `FeedbackForm` existe, pero solo aparece si la visita ya está "Realizada" y la UI no puede llevarla a ese estado. |
| GAM2-006 Offer workspace | Thread + versiones inmutables + "Nueva versión". Faltan aceptar, rechazar, contraoferta, enviar. `creadoPor` está fijo en "Asesor ZENPLUS" (D-015). |
| GAM2-007 Reservation flow | Conflicto/expiración solo visibles; conflicto solo simulado en mock; sin paso de confirmación ni retry controlado. |
| GAM2-008 Timeline | OK (`CommercialTimeline`). |
| GAM2-009 Mobile/a11y | Labels y `aria-live` en formularios. **Tabs sin `role="tablist"`/`aria-selected`/teclado.** Sin evidencia móvil. |
| GAM2-010 Analytics | OK: 5 eventos, sin PII (solo IDs técnicos). |
| GAM2-011 UAT | No existe. |
| GAM2-012 Handover | `components/README.md` **no documenta** ningún componente comercial. Sin Storybook. |

**Infra transversal:**
- `lib/api-commercial.ts`: `fetchBeta` devuelve `null` ante cualquier fallo → se pierde 401/403/404/409/validación.
- Sesión mock por cookie `zenplus_session` (D-001); protección de `/commercial` duplicada en layout y `middleware.ts` solo cubre `/perfil` y `/admin` (D-014). **No hay roles** (D-010).
- Tests: solo `validators.test.ts` y `LeadForm.test.tsx`. **Ningún test del módulo comercial.** No hay jsdom/testing-library, no hay CI, no hay ESLint configurado, no hay Storybook.
- `app/[locale]/xenia/page.tsx` enlaza a `/contacto`, ruta que **no existe** en `app/` (verifica y corrige).
- Mocks con nombres de aspecto real (`Rodrigo Alvarado Quispe`): reemplazar por datos claramente sintéticos.

**Fase 3 — Transaction & Experience:** **0 de 12 tickets.** No existen tipos `Operation`, `Document`, `Obligation`, `Payment`, rutas, componentes ni eventos.

**Fase 4 — Data & Management Intelligence:** **0 de 12 tickets.** No hay dashboards, librería de gráficos, KPIs, filtros globales, export ni insights.

---

## 3. PLAN DE EJECUCIÓN (orden obligatorio)

```
ETAPA 0  Fundaciones transversales        (desbloquea todo)
ETAPA 1  Cerrar Fase 2                     (GAM2-003…012 + correctivos)
ETAPA 2  Fase 3 completa                   (GAM3-001…012)
ETAPA 3  Fase 4 completa                   (GAM4-001…012)
ETAPA 4  Evidencia, handover y reporte     (por fase)
```

**No avances de etapa** si la anterior tiene Must sin cerrar, salvo que registres un bloqueo externo (Alpha/Beta/Security) con owner y decisión pendiente. Al terminar cada etapa, genera el reporte de la sección 10 y **detente a esperar confirmación** antes de continuar.

Convenciones de trabajo:
- Rama por ticket: `feat/GAM2-003-candidate-selector`, `fix/GAM2-D015-creado-por`, etc.
- Commits pequeños, mensaje `GAM2-003: <qué>`.
- IDs de deuda nuevos continúan desde **D-016** en `docs/DEUDA.md` (columnas: ID, Descripción, Impacto, Responsable).
- Idioma de UI del workspace interno: **español**, consistente con lo existente (los componentes comerciales actuales no usan next-intl; no lo migres salvo que se pida). Las pantallas de portal cliente/propietario (F3) **sí** deben usar `next-intl` con claves en los 5 `messages/*.json`.
- Componentes nuevos reutilizan tokens y patrones existentes (`inputClass`, `LoadingRows`, `EmptyState`, `OpportunityBadge`, etc.). No dupliques; extrae a `components/ui/` o `components/commercial/shared/` si hace falta.

---

## 4. ETAPA 0 — FUNDACIONES TRANSVERSALES

### 0.1 Capa API con errores tipados (correctivo, desbloquea GAM2-002/007/009 y GAM3-009)
- Reemplazar `fetchBeta` por un cliente que devuelva un resultado discriminado:
  `{ ok: true, data } | { ok: false, status: 0|400|401|403|404|409|410|422|5xx, code?: string, fieldErrors?: Record<string,string> }`.
- Mantener las firmas públicas actuales de `lib/api-commercial.ts` compatibles (o migrar todos los llamadores en el mismo PR).
- Los mensajes mostrados al usuario **no filtran información sensible**; 403 y 404 de recursos ajenos se muestran con el mismo texto neutro.
- Los mocks deben poder **simular** cada error (parámetro o helper de test), para poder testear estados.

### 0.2 Sesión y roles (cierra parte de D-001/D-010/D-014/D-015 a nivel de abstracción)
- Crear `lib/session.ts` con `Rol = 'asesor' | 'lider' | 'direccion' | 'admin' | 'cliente' | 'propietario'`, `getSession()` (server) y `useSession()` (client). **Hoy lee la cookie mock; mañana lo reemplaza Beta IAM** sin cambiar a los consumidores.
- Unificar la protección de rutas en **un solo punto** (`middleware.ts`) y eliminar la lectura duplicada de cookie en `app/[locale]/commercial/layout.tsx`.
- `createOfertaVersion` debe tomar `creadoPor` de la sesión (cierra D-015), nunca de un literal.
- Helper `can(session, accion, recurso?)` solo para **reflejar** permisos en UI. Documenta en el código y en DEUDA que la autorización real es de Beta.
- Documentar contrato temporal de sesión/roles en `docs/contracts/session.md` (`PROPUESTO`).

### 0.3 Infraestructura de pruebas
- Añadir `jsdom`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom` y una librería de pruebas de accesibilidad con axe compatible con Vitest. Usar `// @vitest-environment jsdom` por archivo (no cambies el entorno global `node` si rompe los tests existentes).
- Script `npm run test` debe seguir en verde. Añadir `npm run typecheck` (`tsc --noEmit`) y configurar ESLint (Next) para que `npm run lint` no sea interactivo.
- Crear workflow de CI (`.github/workflows/ci.yml`): install → typecheck → lint → test → build. Si el repo no usa GitHub, deja el equivalente documentado y registra la dependencia con DevOps.
- Fixtures sintéticos centralizados en `lib/fixtures/` (nombres/teléfonos/emails **obviamente ficticios**, p. ej. `Cliente Demo 01`, `demo01@example.test`). Reemplazar los datos de apariencia real de `lib/mock-commercial.ts`.

### 0.4 Higiene
- Corregir o crear la ruta `/contacto` referenciada en `/xenia`.
- Actualizar `components/README.md` con **todos** los componentes comerciales existentes (props, estados, contrato).

**Criterio de salida Etapa 0:** typecheck, lint, test y build en verde; cliente API tipado en uso; sesión con roles abstraída; ≥1 test de componente jsdom funcionando.

---

## 5. ETAPA 1 — CERRAR FASE 2 (Commercial Engine)

### GAM2-001 Opportunity Workspace (completar)
- Añadir al resumen: **next action** (derivada del último estado/visita/oferta, ver tipos; si no hay dato, mostrar "Sin próxima acción definida", no inventar), y panel de **assets/propiedades candidatas** asociadas.
- Estados loading/empty/error/403/404 con mensajes seguros (usa 0.1).
- Aceptación: navegable en 360 px y desktop; sin overflow horizontal; estados verificados con tests.

### GAM2-002 Requirement editor (completar)
- Mostrar `fieldErrors` del servidor junto al campo; foco al primer error; `aria-invalid` + `aria-describedby`.
- Validación de rangos numéricos (negativos, min/max coherentes en área y dormitorios), no solo presupuesto.
- Aceptación: tests para validación cliente, error de servidor por campo y error genérico.

### GAM2-003 Property candidate selector (**Must, hoy inexistente**)
- Contrato (de Alpha, `README de coordinación`): `GET /inventory/eligible` con `operacion, tipos[], distritos[], presupuestoMin, presupuestoMax, areaMinM2, dormitoriosMin` y `GET /inventory/{slug}/status`. Implementa `lib/api-inventory-eligible.ts` con flag `NEXT_PUBLIC_USE_COMMERCIAL_API` + `NEXT_PUBLIC_ALPHA_COMMERCIAL_API_URL` (ya en el README de coordinación), y mock determinístico basado en `lib/mock.ts`.
- Componente `CandidateAssetSelector`: prellena filtros desde el `Requirement`, lista elegibles (reutiliza `PropertyCard` o variante compacta), muestra **estado comercial** de cada activo, permite seleccionar uno o varios, soporta teclado y lector de pantalla, estados loading/empty/error.
- **Reemplazar los inputs de slug/título** de `VisitaForm`, `ReservaForm` (y oferta si aplica) por la selección de un candidato. Prohibido seguir pidiendo slug a mano.
- Disparar `candidate_asset_selected` con `{ opportunityId, propiedadSlug }` (ya existe el helper).
- Matching **determinístico** sobre inventario verificado; nada predictivo (XENIA fuera del Critical Path).
- Aceptación: desde una Opportunity, el asesor selecciona un inmueble elegible y lo usa para agendar visita.

### GAM2-004 Visit scheduler (completar)
- Acciones por visita según estado: **reprogramar** (nueva fecha/hora, estado → `Reprogramada`/`Programada`), **cancelar** (con motivo), **confirmar**, **marcar Realizada**, **marcar No Show**. Las transiciones válidas se definen en una tabla única `TRANSICIONES_VISITA` (documentada) y la UI solo ofrece las permitidas; **el backend valida** igualmente.
- Fecha/hora con **timezone explícito** (`America/Lima`) visible en el formulario y en `Visita`; no depender del timezone del navegador.
- Validar solapamiento solo si el contrato lo expone; si no, registrar dependencia con Beta.
- Aceptación: una visita se agenda, reprograma, cancela y completa desde móvil.

### GAM2-005 Visit detail + feedback
- Tras "marcar Realizada", abrir `FeedbackForm` en el mismo flujo (sin fricción, móvil primero). Mantener `siguienteAccion` visible en el workspace.

### GAM2-006 Offer workspace (completar)
- Acciones permitidas por estado (tabla `TRANSICIONES_OFERTA`): enviar, **contraoferta**, aceptar, rechazar. Nunca editar ni borrar versiones previas (histórico inmutable).
- Mostrar versión vigente destacada y diff de monto vs versión anterior.
- `creadoPor` viene de sesión (Etapa 0.2).
- Disparar `offer_action_clicked` con `accion` técnica (`enviar|contraoferta|aceptar|rechazar|nueva_version`), sin textos libres ni montos exactos si Analytics lo desaconseja (usa solo IDs y enumeraciones).

### GAM2-007 Reservation flow (completar)
- Flujo: seleccionar candidato → **paso de confirmación** (resumen: propiedad, monto, expiración) → crear.
- Estados: éxito, **conflicto 409** (mensaje claro + opción de elegir otro activo), **expiración** (estado + CTA "Crear nueva reserva"), error genérico con **retry controlado** (botón reintentar, sin doble envío; idempotencia solicitada a Beta vía header/clave propuesta en contrato temporal).
- No calcular la expiración como regla de negocio: mostrar la que devuelve Beta; si se propone un valor por defecto en UI, etiquetarlo como sugerencia y registrar dependencia (hoy son 7 días fijos en cliente).
- Registrar en DEUDA la dependencia de concurrencia real (D-012) y la sincronización con Inventory (hold/reservado).

### GAM2-008 Timeline
- Añadir `aria-label`/semántica de lista temporal y soporte para nuevos tipos de evento. Verificar que renderiza texto no confiable **escapado** (notas/comentarios).

### GAM2-009 Mobile/accessibility hardening
- Tabs de `OpportunityTabs` con patrón WAI-ARIA: `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, navegación con flechas/Home/End y foco visible.
- Revisar contraste de tokens usados, tamaño táctil ≥ 44 px, foco visible en todos los controles, orden de tab lógico, `aria-live` para resultados de acciones.
- Pruebas axe en: lista, detalle, cada formulario, cada estado vacío/error.
- Evidencia: capturas a 360×800 y 1280×800.

### GAM2-010 Analytics
- Verificar con test que ningún evento contiene nombre, email, teléfono ni texto libre. Documentar la taxonomía en `docs/analytics-events.md`.

### GAM2-011 UAT Golden E2E (parte automatizable)
- Golden F2: *Opportunity calificada → Requirement → inmueble elegible → visita agendada → visita realizada → oferta → contraoferta/aceptación → reserva → Inventory refleja hold/reservado → Operation mínima creada.*
- Implementa un **test de integración del recorrido completo contra mocks/contract mocks** (Vitest+RTL o Playwright en modo mock). Genera `docs/uat/F2-escenarios.md` con los escenarios, resultado y defectos P0/P1.
- El paso "Operation mínima creada" depende de Beta: registrar contrato temporal.

### GAM2-012 Frontend handover
- Documentar en `components/README.md` y `docs/handover/F2.md`: mapa de componentes, estados soportados, contratos con Alpha/Beta, flags de entorno, deuda conocida. Storybook es lo que pide la guía: **propón** añadirlo (decisión del Líder) y, si se aprueba, crea stories para los estados críticos.

**Exit Gate F2 — qué puede demostrar el agente vs. qué no**
- ✅ Agente: selector, transiciones, estados, a11y, tests, analytics, docs, UAT sobre mocks.
- ⛔ Humano/otras células: API real de Beta/Alpha en Staging, Golden E2E en Staging, UAT con asesor y líder reales, firma GO/NO-GO.

---

## 6. ETAPA 2 — FASE 3 (Transaction & Experience)

Prerrequisito: Etapa 1 cerrada (o bloqueos registrados). Rutas internas bajo `/commercial/operations/...`; portales bajo `/portal/cliente` y `/portal/propietario`.

### Tipos y contratos temporales (crear primero, `types/` + `docs/contracts/transaction.md`, `PROPUESTO`)
`Operation` (id, codigo, etapa, estado, opportunityId, reservaId, partes, activos, proximaAccion, actualizadoEn), `OperationParty` (rol: comprador/vendedor/…, **sin datos innecesarios**), `OperationAsset`, `TransactionMilestone`, `DocumentRequirement` (checklist), `DocumentItem` + `DocumentVersion` (estado: Pendiente/Cargado/En revisión/Aprobado/Rechazado/Vencido), `ContractStatus` (estado + referencia, **sin contenido jurídico**), `Obligation` (monto, moneda, vencimiento, estado), `Payment` (monto, fecha, aplicación a obligación). Endpoints propuestos a Beta: `GET /operations`, `GET /operations/{id}`, `GET /operations/{id}/timeline`, `GET /operations/{id}/documents`, `POST /operations/{id}/documents/upload-intent`, `GET /documents/{id}/access-link`, `GET /operations/{id}/obligations`, `GET /operations/{id}/payments`, `GET /portal/me/operations`. **Son una propuesta**: confírmalos con Beta antes de conectar; mientras tanto, mocks con flag.

### Tickets
- **GAM3-001 Operation Workspace:** resumen, estado, partes, activo, **próxima acción**, timeline. Información mínima y jerarquía clara, no pantallas sobrecargadas. Se crea desde una Reserva confirmada (enlace desde `ReservaPanel`/estado `Convertida`).
- **GAM3-002 Transaction Timeline:** reutiliza/extiende `CommercialTimeline` (no dupliques), hitos y eventos auditables legibles.
- **GAM3-003 Document Center:** checklist de requeridos, cargados, **versiones**, estados y **acciones permitidas** por rol y estado. Descarga mediante **enlace firmado de corta duración solicitado al hacer clic**; prohibido guardar o exponer URLs permanentes.
- **GAM3-004 Secure upload UX:** selección/arrastre accesible, validación de tipo y tamaño (valores desde contrato, no hardcodeados), **barra de progreso** (XHR/fetch con progreso), mensajes de error seguros, **cancelar y reintentar**, estados de fallo. No mostrar ni registrar el nombre del archivo en analytics ni logs. No persistir archivos/PII en storage del navegador.
- **GAM3-005 Contract status UI:** estado + referencia como registro operativo, con aviso explícito "no es asesoría legal ni editor de contrato".
- **GAM3-006 Obligations & Payments UI:** montos/moneda/vencimientos y pagos aplicados **solo si el rol lo permite**; ocultar o redactar según permiso; formato monetario consistente (hoy existe `formatearMonto` duplicado en 2 componentes: unifícalo).
- **GAM3-007 Client Portal basic / GAM3-008 Owner Portal basic:** navegación mínima, estado de la operación y **documentos autorizados únicamente**. Reutilizan componentes pero con **Data Scope distinto** (el propietario nunca ve datos del comprador y viceversa salvo lo autorizado). `next-intl` en los 5 idiomas. Mobile-first, Android-first.
- **GAM3-009 Permission/error states:** pantallas 401 (login), 403, 404, **enlace expirado**, archivo no disponible y operación cerrada. **403 y 404 de recursos ajenos muestran el mismo mensaje neutro** (no revelar existencia). Componente único `AccessState` reutilizable.
- **GAM3-010 Mobile/accessibility hardening:** journeys P0 transaccionales en móvil/desktop/teclado; axe en todas las pantallas y estados.
- **GAM3-011 Transaction analytics:** `operation_workspace_viewed`, `operation_timeline_viewed`, `document_upload_started`, `document_upload_completed`, `document_status_viewed`, `obligation_viewed`, `portal_session_started`. Solo IDs técnicos y contexto mínimo (etapa, tipo de documento como enumeración). **Prohibido** nombres, DNI, teléfonos, emails, nombres de archivo, contenido. Test automático que falla si un payload contiene campos de una lista de PII.
- **GAM3-012 UAT + handover:** escenarios, defectos, docs (`docs/handover/F3.md`, `docs/uat/F3-escenarios.md`).

### Golden E2E F3 (automatizable sobre mocks; Staging lo valida un humano)
Reservation confirmada → Operation creada → partes/activos vinculados → checklist documental → documento cargado/versionado → obligación creada → pago registrado/aplicado → operación avanza de etapa → cliente/propietario ve solo lo autorizado → operación cerrada → estado comercial del activo sincronizado.

**Regresión obligatoria:** los tests de Opportunity/Reservation de Fase 2 siguen en verde.

---

## 7. ETAPA 3 — FASE 4 (Data & Management Intelligence)

Prerrequisito: Etapas 1 y 2 cerradas (o bloqueos registrados). **No empieces por gráficos.**

### Paso 0 — Metric Contracts (obligatorio antes de diseñar tarjetas)
Crea `docs/metrics/_TEMPLATE.md` con: nombre visible, propósito, **fórmula con numerador y denominador**, grano, fuente (dataset/API de Beta), **timezone (America/Lima)**, filtros, exclusiones, sensibilidad/PII, owner, freshness. Redacta **borradores** de los KPI P0 (leads, conversión por etapa del funnel, visitas, reservas, operaciones por etapa, tiempo de cierre, disponibilidad/rotación de inventario, rendimiento por fuente) marcados **`BORRADOR — pendiente de aprobación de Dirección/Líder General`**. **No inventes cifras ni umbrales**; si falta una definición, es una pregunta abierta, no una decisión tuya.

### Contratos temporales (`docs/contracts/analytics.md`, `PROPUESTO`)
APIs de Beta: respuesta con `{ data, meta: { lastUpdated, freshnessSlaMinutes, partial: boolean, definitionId, filtersApplied, scope } }`. Dataset sintético controlado en `lib/fixtures/analytics/` con **resultados esperados calculados de forma independiente** para reconciliar.

### Tickets
- **GAM4-001 Direction dashboard shell:** layout, **filtros globales** (periodo, ciudad/zona, fuente, asesor), refresh y estado de datos. Ruta `/dashboard/direccion` (rol `direccion`/`lider`).
- **GAM4-002 Commercial funnel:** Lead → Qualified → Opportunity → Visit → Reservation → Operation, **con numerador/denominador y periodo visibles** en cada paso; si un paso no tiene dato, se muestra "sin dato", no cero inventado.
- **GAM4-003 Inventory dashboard:** disponibilidad, publicación, propiedades más consultadas, rotación básica.
- **GAM4-004 Advisor dashboard:** asignados, sin responder, tareas, visitas, conversión. **Solo el scope del propio asesor** (Data Scope validado en backend; la UI solo lo refleja). Ruta `/dashboard/asesor`.
- **GAM4-005 Source performance:** leads/conversión por source/campaign con **aviso de límites de atribución** visible.
- **GAM4-006 Transaction dashboard:** operaciones por etapa, cierre y tiempos básicos.
- **GAM4-007 Data confidence UX:** componente `KpiCard` con valor, **definición y tooltip/diálogo accesible**, periodo, `last updated`, y estados **stale / error / empty / partial** comprensibles. Evento `kpi_definition_opened`.
- **GAM4-008 Filters & drilldown:** combinaciones de filtros, periodos vacíos, **privacidad por defecto** en drilldowns y tablas detalladas (agregados antes que PII). Evento `dashboard_filter_applied`.
- **GAM4-009 Controlled export UX (Should):** el botón solo se renderiza si la API lo permite para el rol; mostrar advertencias y estado (solicitado/generando/listo/denegado). **Ocultar con CSS no cuenta**: el backend decide. Evento `controlled_export_requested`.
- **GAM4-010 Accessibility & performance:** cada gráfico con **alternativa en tabla**, navegable por teclado, contraste suficiente, no depender solo del color; carga con dataset realista (cientos/miles de filas sintéticas) y métricas de rendimiento registradas. Elige una librería de gráficos ligera y accesible o SVG propio; **justifica la elección** en el PR y compara peso del bundle. Mobile-first.
- **GAM4-011 XENIA Insights surface (Should):** componente `InsightCard` que **solo renderiza** insights recibidos de una fuente aprobada con campos obligatorios `{ insight, source/provenance, fecha, alcance, nivelDeCerteza }`. Si falta cualquiera → no se renderiza y se registra. **Prohibido** generar conclusiones, usar IA generativa/predictiva o mostrar documentos/prompts internos. Evento `xenia_insight_viewed`. Ver restricciones de Fase 5 abajo.
- **GAM4-012 Analytics UX QA:** instrumentación (`dashboard_viewed` + los eventos anteriores), UAT con Dirección y un perfil de asesor, **reconciliación visual**: test por cada KPI P0 que compara el valor renderizado con el resultado esperado del dataset/API.

### Mapa KPI → componente → API/dataset
Mantén `docs/metrics/KPI_MAP.md` actualizado: KPI | Metric Contract | componente | endpoint/dataset | test de reconciliación.

### Golden E2E F4
Evento/estado operacional → contrato analítico → dataset gobernado → reconciliación → KPI service → dashboard autorizado → decisión → agregado/insight XENIA-ready con provenance.

**Regla del Líder General:** no existe GO si un dashboard muestra un número que el equipo no puede explicar y reconciliar con su fuente.

---

## 8. SEGURIDAD, PRIVACIDAD Y CALIDAD (aplican a todas las etapas)

Seguridad:
- Sin tokens, PII ni documentos en `localStorage`/`sessionStorage`/IndexedDB. (El único uso permitido hoy es la preferencia de tema.)
- Sin secretos en el repo; variables sensibles nunca con prefijo `NEXT_PUBLIC_`.
- Contenido no confiable (notas, comentarios, nombres) siempre escapado; **prohibido `dangerouslySetInnerHTML`** salvo el JSON-LD existente.
- Errores de autorización sin información sensible.
- No incluir PII real en fixtures, logs, screenshots ni documentación.
- Revisa `next.config.mjs` (headers de seguridad) y propone CSP si no existe.

Calidad (por cada ticket):
- Component tests de estados críticos: loading, empty, error, 401/403/404, conflicto, expirado, fallo de upload, stale/partial.
- Accesibilidad P0 (axe + teclado + labels + foco).
- Responsive 360 px y desktop.
- `typecheck`, `lint`, `test`, `build` en verde antes de declarar DONE.

Definition of Ready: no empieces un ticket sin criterios de aceptación verificables, dependencias identificadas, contrato disponible o decisión registrada, y datos sintéticos. Si no se cumple, **pregunta o registra el bloqueo**.

---

## 9. FUERA DE ALCANCE (no lo hagas)

- Fase 5 (XENIA IA/chatbot/RAG/generativa/predictiva) y cualquier "copiloto" comercial autónomo.
- Rediseñar la web pública de Fase 1 sin necesidad.
- Firma digital avanzada, portal completo con funciones futuras, editor jurídico de contratos.
- Reglas de negocio críticas en frontend (reserva, montos, estados, KPIs).
- Dashboards sobre queries directas al OLTP no gobernadas.
- Rankings o comparaciones sin denominador, periodo y contexto.
- Exponer PII o datos de otros asesores por conveniencia visual.
- Inventar endpoints "como si existieran": todo lo no confirmado es `PROPUESTO` + mock + deuda.

---

## 10. LO QUE EL AGENTE NO PUEDE CERRAR (acción humana obligatoria)

Marca explícitamente estos ítems como **PENDIENTE HUMANO** en cada reporte; nunca los des por cumplidos:

- APIs reales de Alpha y Beta publicadas y confirmadas contra los contratos temporales.
- Despliegue y ejecución del **Golden E2E en Staging** (F2, F3, F4).
- UAT con usuarios reales (asesor, líder, Dirección, usuario de portal).
- Figma/flows aprobados, capturas/video de Staging.
- Aprobación de **Metric Contracts** por Dirección/Líder General.
- Autenticación/IAM real y autorización por rol del backend (Beta).
- Configuración de CI en la plataforma real (DevOps) y Storybook si se aprueba.
- Firmas GO/NO-GO (Líder Gamma, Líder General, Dirección, Security/QA).
- Tracker (owner/reviewer por ticket) y reportes semanales.

---

## 11. FORMATO DE REPORTE (al cerrar cada etapa y cada ticket)

Para cada **ticket**:
```
TICKET: GAMx-00y — <nombre>
Estado: DONE | PARCIAL | BLOQUEADO
Qué se hizo: <resumen y archivos clave>
Criterios de aceptación: <cada uno ✅/❌ con evidencia: test, captura, comando>
Tests añadidos: <lista> · Resultado de typecheck/lint/test/build: <verde/rojo>
Seguridad/privacidad revisada: <sí/no, notas>
Contratos tocados: <docs/contracts/...>
Deuda nueva: <D-0xx ...>
Pendiente humano / dependencia externa: <...>
```

Para cada **etapa**, además:
```
RESUMEN DE ETAPA
Must DONE: x/y · Should DONE: x/y
Exit Gate (checkbox por checkbox): ✅ demostrado / ❌ no cumple / ⛔ requiere humano (indicar por qué)
Defectos Blocker/Critical abiertos: <...>
Riesgos y decisiones requeridas del Líder: <...>
Próximos 3 compromisos: 1) 2) 3)
```

Nunca escribas "completado" sin evidencia reproducible.

---

## 12. PRIMERA INSTRUCCIÓN (empieza aquí)

1. Lee las 4 guías y el repositorio completo. No modifiques nada todavía.
2. Verifica que el estado de la sección 2 coincide con lo que ves; **lista cualquier discrepancia** (puede haber cambiado el repo).
3. Entrega un **plan detallado de la Etapa 0** (archivos a crear/modificar, orden de PRs, riesgos) y una lista de **preguntas bloqueantes** (máximo 8, las que realmente impidan avanzar).
4. Espera mi confirmación y luego ejecuta la Etapa 0. Continúa etapa por etapa con el formato de reporte de la sección 11.
