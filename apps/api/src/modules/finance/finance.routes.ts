import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { FinanceService } from "./finance.service";

const simulateSchema = z.object({
  assetId: z.string().optional(),
  totalPrice: z.number().positive(),
  downPayment: z.number().min(0),
  installments: z.number().int().positive(),
  annualInterestRate: z.number().min(0),
  startDate: z.string().optional(),
});

export async function financeRoutes(app: FastifyInstance) {
  app.post(
    "/api/finance/simulate",
    { preHandler: [(app as any).authorize(["ADMIN", "ADVISOR"])] },
    async (request: any, reply: any) => {
      try {
        const input = simulateSchema.parse(request.body);
        const result = FinanceService.calculateFrenchSchedule(input);
        return reply.send(result);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return reply.status(422).send({
            error: "VALIDATION_ERROR",
            details: error.flatten(),
          });
        }
        return reply.status(400).send({
          error: error.message || "Error al calcular el cronograma",
        });
      }
    }
  );
}