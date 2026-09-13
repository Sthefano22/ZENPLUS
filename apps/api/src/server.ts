import Fastify from "fastify";
import cors from "@fastify/cors";
import { requestIdHook } from "./lib/requestId";
import { registerAuth } from "./plugins/auth";
import { registerErrorHandler } from "./plugins/errorHandler";
import { platformRoutes } from "./modules/platform/health";
import { leadRoutes } from "./modules/crm/lead.routes";
import { opportunityRoutes } from "./modules/crm/opportunity.routes";

async function main() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL ?? "info" } });

  await app.register(cors, { origin: true });
  await registerAuth(app);
  app.addHook("onRequest", requestIdHook);
  registerErrorHandler(app);

  await app.register(platformRoutes);
  await app.register(leadRoutes);
  await app.register(opportunityRoutes);

  const port = Number(process.env.PORT ?? 3000);
  await app.listen({ port, host: "0.0.0.0" });
  console.log(`ZENPLUS API on :${port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});