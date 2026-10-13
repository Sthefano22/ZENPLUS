import { prisma } from "../../lib/prisma";
import { randomUUID } from "crypto";
import { logger } from "../../lib/logger";
import type { CreateProjectInput, CreateUnitInput } from "./project.schema";

export async function listPublicProjects() {
  return prisma.projects.findMany({
    where: { status: { in: ["ACTIVE", "PRE_SALE", "CONSTRUCTION", "DELIVERED"] } },
    orderBy: { created_at: "desc" },
    include: {
      assets: true,
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.projects.findUnique({
    where: { id },
    include: { assets: true },
  });
}

export async function listAllProjects() {
  return prisma.projects.findMany({
    orderBy: { created_at: "desc" },
    include: { assets: true },
  });
}

export async function createProject(input: CreateProjectInput) {
  const project = await prisma.projects.create({
    data: {
      id: randomUUID(),
      name: input.name.trim(),
      description: input.description ?? null,
      location: input.district
        ? `${input.district}${input.city ? `, ${input.city}` : ""}`
        : null,
      status: input.status ?? "ACTIVE",
    },
  });
  logger.info({ projectId: project.id, name: project.name }, "Project created");
  return project;
}

export async function createUnit(input: CreateUnitInput) {
  // En Neon, units cuelga de assets, no de projects.
  // Buscamos el primer asset del proyecto para asociar la unit.
  const asset = await prisma.assets.findFirst({
    where: { project_id: input.projectId },
  });

  if (!asset) {
    throw new Error(
      `No existe ningún asset en el proyecto ${input.projectId} para asociar la unidad`
    );
  }

  const unit = await prisma.units.create({
    data: {
      id: randomUUID(),
      asset_id: asset.id,
      code: input.code.toUpperCase().trim(),
      floor: input.bedrooms ?? 0,
      price: input.currentPrice ?? null,
      status: input.status ?? "AVAILABLE",
    },
  });
  logger.info({ unitId: unit.id, code: unit.code }, "Unit created");
  return unit;
}