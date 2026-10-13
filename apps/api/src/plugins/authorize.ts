import type { FastifyInstance } from "fastify";

export function registerAuthorize(app: FastifyInstance) {
  app.decorate("authorize", (roles: string[]) => {
    return async (req: any, reply: any) => {
      try {
        await req.jwtVerify();
      } catch (err) {
        return reply.status(401).send({
          error: "UNAUTHORIZED",
          message: "Token inválido o ausente",
          requestId: req.id,
        });
      }

      // Normalizar: exponer user.id = user.sub para compatibilidad con handlers
      if (req.user && req.user.sub && !req.user.id) {
        req.user.id = req.user.sub;
      }

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