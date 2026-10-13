import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { createProjectSchema, createUnitSchema } from "./project.schema";
import {
  listPublicProjects,
  getProjectById,
  listAllProjects,
  createProject,
  createUnit,
} from "./project.service";

export async function projectRoutes(app: FastifyInstance) {
  // ─── Público ─────────────────────────────
  app.get("/public/projects", async () => listPublicProjects());

  app.get("/api/inventory/projects/aggregated", async (_request, reply) => {
    const projects = await prisma.projects.findMany({
      include: { units: true },
    });

    const data = await Promise.all(
      projects.map(async (p) => {
        const assets = await prisma.assets.findMany({
          where: { code: { startsWith: p.code ?? "" } },
          include: { active_hold: true },
        });

        const now = new Date();
        const totalUnits = assets.length;
        const availableUnits = assets.filter(
          (a) =>
            a.commercial_status === "AVAILABLE" &&
            (!a.active_hold || a.active_hold.expires_at <= now)
        ).length;
        const reservedUnits = assets.filter(
          (a) =>
            a.commercial_status === "RESERVATION_HOLD" ||
            (a.active_hold && a.active_hold.expires_at > now) ||
            a.commercial_status === "RESERVED"
        ).length;
        const soldUnits = assets.filter(
          (a) => a.commercial_status === "SOLD"
        ).length;
        const prices = assets.map((a) => Number(a.price));

        return {
          projectId: p.id,
          projectName: p.name,
          projectCode: p.code,
          district: p.district,
          city: p.city,
          totalUnits,
          availableUnits,
          reservedUnits,
          soldUnits,
          minPrice: prices.length ? Math.min(...prices) : 0,
          maxPrice: prices.length ? Math.max(...prices) : 0,
          availabilityPercentage:
            totalUnits > 0
              ? Math.round((availableUnits / totalUnits) * 10000) / 100
              : 0,
        };
      })
    );

    return reply.send({ success: true, total: data.length, data });
  });

  app.get("/public/projects/:id", async (req: any, reply) => {
    const project = await getProjectById(req.params.id);
    if (!project) {
      return reply.status(404).send({ error: "PROJECT_NOT_FOUND" });
    }
    return project;
  });

  // ─── Admin (JWT ADMIN) ───────────────────
  app.get(
    "/projects",
    { preHandler: [(app as any).authorize(["ADMIN"])] },
    async () => listAllProjects()
  );

  app.post(
    "/projects",
    { preHandler: [(app as any).authorize(["ADMIN"])] },
    async (req: any, reply) => {
      const input = createProjectSchema.parse(req.body);
      const project = await createProject(input);
      return reply.status(201).send(project);
    }
  );

  app.post(
    "/projects/:id/units",
    { preHandler: [(app as any).authorize(["ADMIN"])] },
    async (req: any, reply) => {
      const input = createUnitSchema.parse({
        ...req.body,
        projectId: req.params.id,
      });
      const unit = await createUnit(input);
      return reply.status(201).send(unit);
    }
  );
}