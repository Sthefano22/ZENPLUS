import type { FastifyInstance } from "fastify";

export function registerAuthorize(app: FastifyInstance) {
  app.decorate("authorize", (roles: string[]) => {
    return async (req: any, reply: any) => {
      await req.jwtVerify();

      if (!roles.includes(req.user.role)) {
        return reply.status(403).send({
          error: "FORBIDDEN",
          message: "No tienes permiso para esta acción",
          requestId: req.id,
        });
      }
    };
  });
}