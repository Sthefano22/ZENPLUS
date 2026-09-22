import { prisma } from "../../lib/prisma";
import { logger } from "../../lib/logger";
import type { CreateProjectInput, CreateUnitInput } from "./project.schema";

export async function listPublicProjects() {
  return prisma.project.findMany({
    where: { status: { in: ["PRE_SALE", "CONSTRUCTION", "DELIVERED"] } },
    orderBy: { createdAt: "desc" },
    include: {
      units: {
        where: { status: "AVAILABLE" },
        orderBy: { currentPrice: "asc" },
      },
    },
  });
}

export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { units: true },
  });
}

export async function listAllProjects() {
  return prisma.project.findMany({
    orderBy: { createdAt: "desc" },
    include: { units: true },
  });
}

export async function createProject(input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      code: input.code.toUpperCase().trim(),
      name: input.name.trim(),
      description: input.description,
      status: input.status,
      district: input.district,
      city: input.city,
    },
  });
  logger.info({ projectId: project.id, code: project.code }, "Project created");
  return project;
}

export async function createUnit(input: CreateUnitInput) {
  const unit = await prisma.unit.create({
    data: {
      projectId: input.projectId,
      code: input.code.toUpperCase().trim(),
      name: input.name.trim(),
      unitType: input.unitType,
      areaM2: input.areaM2,
      bedrooms: input.bedrooms,
      bathrooms: input.bathrooms,
      currentPrice: input.currentPrice,
      status: input.status,
    },
  });
  logger.info({ unitId: unit.id, code: unit.code }, "Unit created");
  return unit;
}