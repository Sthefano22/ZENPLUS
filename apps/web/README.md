# ZENPLUS OS — Célula Gamma (Frontend)

Web pública de ZENPLUS.pe (inmobiliaria): búsqueda y ficha de propiedades, proyectos con unidades, formularios de lead (consulta y propietario) y el asistente virtual Xenia.

## Stack

- [Next.js 14](https://nextjs.org/) (App Router) — `^14.2.0`
- [React](https://react.dev/) `^18.3.0` / `react-dom` `^18.3.0`
- TypeScript `^5.4.0`
- [Tailwind CSS](https://tailwindcss.com/) `^3.4.0` (con `postcss` y `autoprefixer`)
- [motion](https://motion.dev/) `^11.0.0` (animaciones)

## Setup

1. Clonar el repo.
2. `npm install`
3. Copiar `.env.example` a `.env.local` y completar las variables necesarias (ver tabla abajo).
4. `npm run dev`

La app queda disponible en `http://localhost:3000`.

## Variables de entorno

Definidas en `.env.example`:

| Variable | Descripción | Requerida |
|---|---|---|
| `NEXT_PUBLIC_USE_REAL_API` | `true` = `lib/api.ts` consume la API real de Alpha; `false` o vacío = usa los datos de `lib/mock.ts`. | No (default `false`) |
| `NEXT_PUBLIC_ALPHA_API_URL` | URL base de la API de Alpha (inventario de propiedades/proyectos), sin slash final. | Solo si `NEXT_PUBLIC_USE_REAL_API=true` |
| `BETA_CRM_LEAD_ENDPOINT` | URL del endpoint POST de Beta que recibe los leads (`app/api/lead/route.ts` reenvía ahí). Vacío = modo mock, solo hace `console.log` del lead sin PII. | No (recomendada en producción) |
| `NEXT_PUBLIC_CHAT_DEMO` | `true` = muestra el aviso de "modo demo" en el widget de chat y en `/xenia`. | No (default `true`) |
| `AI_CHAT_ENDPOINT` | Endpoint server-side del servicio de IA para el chat (`app/api/chat/route.ts`). Vacío = respuestas mock. | No |
| `AI_CHAT_API_KEY` | API key del servicio de IA. Nunca debe llevar el prefijo `NEXT_PUBLIC_` (no debe exponerse al cliente). | No |
| `NEXT_PUBLIC_GA_ID` | ID de Google Analytics 4 (ej. `G-XXXXXXXXXX`). Vacío = no carga el script de GA4. | No |

## Scripts disponibles

| Script | Comando | Descripción |
|---|---|---|
| `npm run dev` | `next dev` | Levanta el servidor de desarrollo con hot reload. |
| `npm run build` | `next build` | Compila la aplicación para producción. |
| `npm run start` | `next start` | Sirve la build de producción ya compilada. |
| `npm run lint` | `next lint` | Corre ESLint. **Nota:** el proyecto aún no tiene ESLint configurado; la primera ejecución pedirá elegir una configuración de forma interactiva. |

## Estructura del proyecto

```
app/
  page.tsx                    # Home
  layout.tsx                  # Layout raíz
  globals.css                 # Tokens CSS del design system
  sitemap.ts / robots.ts      # SEO
  buscar/                     # Búsqueda de propiedades
  propiedad/[slug]/           # Ficha de propiedad
  proyectos/                  # Listado de proyectos
  proyectos/[slug]/           # Detalle de proyecto + unidades
  publicar/                   # Formulario de propietario
  xenia/                      # Página del asistente virtual
  (auth)/login, (auth)/registro  # Autenticación (sesión mock)
  api/lead/route.ts           # Reenvía leads al CRM de Beta
  api/chat/route.ts           # Backend del chat de Xenia

components/
  ui/                         # PropertyCard, ProjectCard, Badge, Skeleton
  forms/                      # LeadForm
  chat/                       # ChatWidget + hook useChat
  layout/                     # Header, Footer, HeroSearch, SiteChrome
  analytics/                  # GoogleAnalytics (carga GA4)
  README.md                   # Documentación de componentes (props, contratos)

lib/
  api.ts                      # Capa de datos (mock hoy, API real de Alpha detrás de un flag)
  mock.ts                     # Datos de ejemplo: propiedades, proyectos, unidades
  validators.ts                # Validaciones de formularios
  analytics.ts                 # trackEvent (eventos GA4)
  chat.ts                      # Constantes y helpers del chat

types/
  index.ts                    # Tipos compartidos: Propiedad, Proyecto, Unidad, formularios, etc.

middleware.ts                 # Protege /perfil y /admin (redirige a /login sin sesión)
next.config.mjs               # Imágenes remotas (Unsplash) + headers de seguridad
```

## Estado actual

- **Datos mock:** todo el catálogo de propiedades, proyectos y unidades viene de `lib/mock.ts` a través de `lib/api.ts`. Esto es intencional mientras Alpha no publique su API.
- **Se activa con variables de entorno:**
  - `NEXT_PUBLIC_USE_REAL_API=true` + `NEXT_PUBLIC_ALPHA_API_URL` → `lib/api.ts` deja de usar el mock y hace `fetch` real a Alpha (`GET /properties`, `/properties/{slug}`, `/properties?destacada=true`, `/projects`, `/projects/{slug}`, `/projects/{slug}/units`). Si Alpha responde con error o no hay red, las funciones devuelven `[]` o `null` en vez de romper la página.
  - `BETA_CRM_LEAD_ENDPOINT` → si está vacío, `app/api/lead/route.ts` solo registra el lead en consola (sin datos personales) y responde OK simulado; si se define, reenvía el lead real a Beta.
  - `NEXT_PUBLIC_CHAT_DEMO` → controla el aviso de "modo demo" en el chat y en `/xenia`.
  - `NEXT_PUBLIC_GA_ID` → si está vacío, `GoogleAnalytics.tsx` no carga ningún script.
- **Qué espera de Alpha:** el contrato completo está documentado en `components/README.md` (sección "Contratos con otros equipos") y en `types/index.ts` (`Propiedad`, `PropiedadResumen`, `Proyecto`, `Unidad`). Cuando Alpha publique su endpoint, activar `NEXT_PUBLIC_USE_REAL_API=true` no debería requerir tocar ningún componente — solo que la forma de la respuesta JSON coincida con esos tipos.
- **Qué espera de Beta:** `app/api/lead/route.ts` reenvía a `BETA_CRM_LEAD_ENDPOINT` un JSON con `{ nombre, email, telefono, mensaje, propiedadRef, origen }` (`origen` es `'web'` para consultas de ficha o `'propietario'` para el formulario de `/publicar`). Beta debe responder `200` con JSON; cualquier otro código se trata como rechazo y el usuario ve un mensaje de error.
