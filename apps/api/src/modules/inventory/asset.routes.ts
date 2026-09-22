import type { FastifyInstance } from "fastify";
import {
  createAssetSchema,
  changeStatusSchema,
  publicAssetsQuerySchema,
} from "./asset.schema";
import {
  listPublicAssets,
  getAssetById,
  listAllAssets,
  createAsset,
  changeAssetStatus,
  getAssetTimeline,
} from "./asset.service";
import { isEnabled } from "../../lib/featureFlags";

export async function assetRoutes(app: FastifyInstance) {
  // ─── Público ─────────────────────────────
  app.get("/public/assets", async (req, reply) => {
    if (!isEnabled("PUBLIC_ASSETS")) {
      return reply.status(503).send({
        error: "FEATURE_DISABLED",
        message: "Catálogo público temporalmente deshabilitado",
      });
    }

    const filters = publicAssetsQuerySchema.parse(req.query);
    return listPublicAssets(filters);
  });

  app.get("/public/assets/:id", async (req: any, reply) => {
    if (!isEnabled("PUBLIC_ASSETS")) {
      return reply.status(503).send({
        error: "FEATURE_DISABLED",
        message: "Catálogo público temporalmente deshabilitado",
      });
    }

    const asset = await getAssetById(req.params.id);
    if (!asset) {
      return reply.status(404).send({ error: "ASSET_NOT_FOUND" });
    }
    return asset;
  });

  // ─── Admin (con JWT) ─────────────────────
  app.get(
    "/assets",
    { preHandler: [(app as any).authenticate] },
    async () => listAllAssets()
  );

  app.post(
    "/assets",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const input = createAssetSchema.parse(req.body);
      const asset = await createAsset(input);
      return reply.status(201).send(asset);
    }
  );

  app.patch(
    "/assets/:id/status",
    { preHandler: [(app as any).authenticate] },
    async (req: any, reply) => {
      const input = changeStatusSchema.parse(req.body);
      try {
        const updated = await changeAssetStatus(
          req.params.id,
          input,
          req.user.sub
        );
        return updated;
      } catch (err: any) {
        if (err.message === "ASSET_NOT_FOUND") {
          return reply.status(404).send({ error: "ASSET_NOT_FOUND" });
        }
        if (err.message.startsWith("INVALID_TRANSITION")) {
          return reply.status(422).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.get(
    "/assets/:id/timeline",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => getAssetTimeline(req.params.id)
  );
}