import { randomUUID } from "crypto";
import type { FastifyRequest, FastifyReply } from "fastify";

export async function requestIdHook(req: FastifyRequest, reply: FastifyReply) {
  const incoming = req.headers["x-request-id"];
  const requestId =
    typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
  req.id = requestId;
  reply.header("x-request-id", requestId);
}
