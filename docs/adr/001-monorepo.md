# ADR-001: Monorepo ZENPLUS OS

## Estado
Aceptado

## Fecha
2026-09-20

## Contexto
El Technical Architecture Brief (Doc 10A) define "GitHub + monorepo" como modelo oficial. El DevOps Master (Doc 13) prohíbe repositorios paralelos sin decisión formal.

## Decisión
Monorepo plano:
- `apps/api` (Beta: Fastify + Prisma)
- `apps/web` (Gamma: Next.js)
- `modules/` (core, iam, crm, inventory)
- `packages/` (compartido)
- `database/` (migraciones + seeds)
- `docs/` (architecture, api, security, adr, reports)

Repo: https://github.com/Sthefano22/ZENPLUS
Ownership: Beta
Branch: `main` (protegido)
Flujo: feature → PR → review → merge

## Consecuencias
Positivas: cumple Doc 10A, evita duplicar, un solo CI/CD.
Negativas: requiere colaboradores, el repo crece.

## Referencias
- Doc 10A: secciones 03 y 05
- Doc 13: sección 05
- Doc 20: sección 04