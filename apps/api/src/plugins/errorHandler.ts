import type { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import { logger } from "../lib/logger";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, req, reply) => {
    const requestId = req.id;
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: error.flatten(),
        requestId,
      });
    }
    logger.error({ err: error, requestId }, "Unhandled error");
    return reply.status(error.statusCode ?? 500).send({
      error: "INTERNAL_ERROR",
      message: "Unexpected error",
      requestId,
    });
  });
}
