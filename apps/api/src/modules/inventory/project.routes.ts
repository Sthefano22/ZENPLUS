import type { FastifyInstance } from "fastify";
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