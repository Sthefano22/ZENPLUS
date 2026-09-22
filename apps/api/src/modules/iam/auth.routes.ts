import type { FastifyInstance } from "fastify";
import { loginSchema, registerSchema } from "./auth.schema";
import { loginUser, registerUser, getCurrentUser } from "./auth.service";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", async (req, reply) => {
    const input = registerSchema.parse(req.body);
    try {
      const user = await registerUser(input);
      return reply.status(201).send(user);
    } catch (err: any) {
      if (err.message === "EMAIL_ALREADY_EXISTS") {
        return reply.status(409).send({ error: "EMAIL_ALREADY_EXISTS" });
      }
      throw err;
    }
  });

  app.post("/auth/login", async (req, reply) => {
    const input = loginSchema.parse(req.body);
    try {
      const result = await loginUser(input);
      return result;
    } catch (err: any) {
      if (err.message === "INVALID_CREDENTIALS") {
        return reply.status(401).send({ error: "INVALID_CREDENTIALS" });
      }
      throw err;
    }
  });

  app.get(
    "/auth/me",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => getCurrentUser(req.user.sub)
  );
}