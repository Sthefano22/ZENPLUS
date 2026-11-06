# Componentes — ZENPLUS.pe (Célula Gamma)

## 1. Tabla de componentes (Web Pública - Fase 1)

| Componente | Ubicación | Descripción |
|---|---|---|
| `PropertyCard` | `components/ui/PropertyCard.tsx` | Tarjeta de una propiedad (imagen, precio, estado, ubicación, área/dorm/baños), enlaza a `/propiedad/[slug]`. |
| `ProjectCard` | `components/ui/ProjectCard.tsx` | Tarjeta de un proyecto inmobiliario (avance de construcción, precio desde, CAP rate), enlaza a `/proyectos/[slug]`. |
| `Badge` | `components/ui/Badge.tsx` | Etiqueta visual del `EstadoPropiedad` (p. ej. "Venta Exclusiva", "Disponible"). |
| `Skeleton` | `components/ui/Skeleton.tsx` | Placeholder de carga con la misma forma que `PropertyCard`. |
| `LeadForm` | `components/forms/LeadForm.tsx` | Formulario de consulta ("quiero más información") asociado opcionalmente a una propiedad y con origen parametrizable. |
| `ChatWidget` | `components/chat/ChatWidget.tsx` | Widget flotante de chat con el asistente virtual "Xenia" (usa el hook `useChat`). |
| `Header` | `components/layout/Header.tsx` | Cabecera del sitio con navegación principal y menú móvil. |
| `Footer` | `components/layout/Footer.tsx` | Pie de página con enlaces institucionales y formulario de newsletter. |
| `HeroSearch` | `components/layout/HeroSearch.tsx` | Hero de la home con selector rápido de operación/distrito/tipo que redirige a `/buscar`. |
| `SiteChrome` | `components/layout/SiteChrome.tsx` | Envoltorio que muestra/oculta `Header`/`Footer` según la ruta. |
| `GoogleAnalytics` | `components/analytics/GoogleAnalytics.tsx` | Carga el script de GA4 si `NEXT_PUBLIC_GA_ID` está definido. |

---

## 2. Componentes Comerciales (Commercial Engine - Fase 2)

| Componente | Ubicación | Descripción y Estados |
|---|---|---|
| `OpportunityTabs` | `components/commercial/OpportunityTabs.tsx` | Contenedor principal de pestañas (Requirement, Visitas, Oferta, Reserva, Timeline). Accesible vía teclado y WAI-ARIA tablist. |
| `OpportunityBadge` | `components/commercial/OpportunityBadge.tsx` | Indicador visual de estado de oportunidad (Nueva, En Proceso, Oferta Enviada, Reserva Activa, Ganada, Perdida). |
| `RequirementForm` | `components/commercial/RequirementForm.tsx` | Editor de requerimiento de compra/alquiler con validación de rangos numéricos y soporte de fieldErrors de servidor. |
| `CandidateAssetSelector` | `components/commercial/CandidateAssetSelector.tsx` | Buscador determinístico de inmuebles elegibles de Alpha para asociar a visitas y ofertas. |
| `VisitaCard` | `components/commercial/VisitaCard.tsx` | Ficha resumen de visita agendada con hora, propiedad, estado y acciones de transición. |
| `VisitaForm` | `components/commercial/VisitaForm.tsx` | Programador de visitas con timezone explícito (`America/Lima`) y selección asistida de activo. |
| `VisitaBadge` | `components/commercial/VisitaBadge.tsx` | Badge de estado de visita (Programada, Confirmada, Realizada, No Show, Cancelada, Reprogramada). |
| `FeedbackForm` | `components/commercial/FeedbackForm.tsx` | Captura de feedback posterior a visita realizada (nivel de interés, comentarios, próxima acción). |
| `OfertaWorkspace` | `components/commercial/OfertaWorkspace.tsx` | Hilo de versiones de oferta inmutables con diff de monto vs versión anterior y acciones (enviar, contraoferta, aceptar, rechazar). |
| `OfertaVersionForm` | `components/commercial/OfertaVersionForm.tsx` | Formulario para registrar una nueva versión o contraoferta con autor tomado de sesión activa. |
| `OfertaBadge` | `components/commercial/OfertaBadge.tsx` | Badge de estado de oferta (Borrador, Enviada, Contraoferta, Aceptada, Rechazada). |
| `ReservaPanel` | `components/commercial/ReservaPanel.tsx` | Panel de reserva activa con cálculo de expiración, montos y estado de hold. |
| `ReservaForm` | `components/commercial/ReservaForm.tsx` | Flujo de confirmación de reserva con validación de concurrencia (409) y retry controlado. |
| `CommercialTimeline` | `components/commercial/CommercialTimeline.tsx` | Línea de tiempo cronológica auditable con sanitización de texto y semántica de lista accesible. |
| `EmptyState` | `components/commercial/EmptyState.tsx` | Estado vacío reutilizable con mensaje seguro y CTA. |
| `LoadingRows` | `components/commercial/LoadingRows.tsx` | Esqueleto de carga accesible con `aria-busy="true"`. |

---

## 3. Componentes de Inteligencia y Gestión (Fase 4)

| Componente | Ubicación | Descripción |
|---|---|---|
| `DashboardShell` | `components/dashboard/DashboardShell.tsx` | Shell con navegación lateral, título y selector global de periodo. |
| `DashboardFiltersBar`| `components/dashboard/DashboardFiltersBar.tsx` | Filtros globales por periodo, zona, asesor y fuente. |
| `KPICard` | `components/dashboard/KPICard.tsx` | Tarjeta de métrica con valor, tendencia, estado de frescura y tooltip accesible con fórmula. |
| `KPITooltip` | `components/dashboard/KPITooltip.tsx` | Diálogo accesible que explica propósito, fórmula, numerador, denominador y timezone de la métrica. |
| `FunnelChart` | `components/dashboard/FunnelChart.tsx` | Embudo de conversión comercial con numerador/denominador visibles y alternativa accesible en tabla. |
| `MiniBarChart` | `components/dashboard/MiniBarChart.tsx` | Gráfico de barras ligero accesible con soporte de teclado y tabla complementaria. |
| `DataTable` | `components/dashboard/DataTable.tsx` | Tabla paginada accesible con ordenamiento y estados vacíos. |
| `InsightCard` | `components/dashboard/InsightCard.tsx` | Superficie de insights de XENIA estrictamente con fuente aprobada, fecha, alcance y certeza. |
| `StaleDataBadge` | `components/dashboard/StaleDataBadge.tsx` | Indicador visual de datos con antigüedad mayor al SLA de frescura. |

---

## 4. Contratos y Seguridad en Componentes
1. Ningún componente almacena PII, credenciales ni tokens en `localStorage` o `sessionStorage`.
2. Las llamadas de mutación usan identificadores técnicos (`opportunityId`, `propiedadSlug`).
3. Todos los inputs de texto libre se renderizan escapados en React para evitar inyección XSS.
