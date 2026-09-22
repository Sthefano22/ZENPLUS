import type { FastifyInstance } from "fastify";
import { prisma } from "../../lib/prisma";
import { getAllMetrics } from "../../lib/metrics";
import { getAllFlags } from "../../lib/featureFlags";

export async function platformRoutes(app: FastifyInstance) {
  app.get("/health", async () => ({
    status: "ok",
    service: "zenplus-api",
    environment: process.env.NODE_ENV ?? "development",
    timestamp: new Date().toISOString(),
  }));

  app.get("/health/db", async (_req, reply) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: "ok", db: "connected" };
    } catch {
      return reply.status(503).send({ status: "error", db: "unreachable" });
    }
  });

  app.get(
    "/me",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => ({
      userId: req.user.sub,
      role: req.user.role,
    })
  );

  app.get("/metrics", async () => ({
    metrics: getAllMetrics(),
    timestamp: new Date().toISOString(),
  }));

  app.get("/flags", async () => getAllFlags());
}