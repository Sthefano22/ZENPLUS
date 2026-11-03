import { expireDueReservations } from "./reservation.service";
import { logger } from "../../lib/logger";

let timer: ReturnType<typeof setInterval> | undefined;
let running = false;

export function startReservationExpirationScheduler(): void {
  if (process.env.RESERVATION_EXPIRATION_ENABLED !== "true") {
    logger.info(
      "[reservations] Vencimiento automático desactivado (RESERVATION_EXPIRATION_ENABLED != true)"
    );
    return;
  }

  if (timer) {
    logger.info("[reservations] Scheduler ya está corriendo");
    return;
  }

  const intervalMs = 60_000;

  timer = setInterval(async () => {
    if (running) return;

    running = true;

    try {
      const result = await expireDueReservations();

      if (result.expiredReservations > 0 || result.releasedAssets > 0) {
        logger.info(
          {
            expiredReservations: result.expiredReservations,
            releasedAssets: result.releasedAssets,
          },
          "[reservations] Vencimiento procesado"
        );
      }
    } catch (error) {
      logger.error({ error }, "[reservations] Error en el vencimiento automático");
    } finally {
      running = false;
    }
  }, intervalMs);

  logger.info(
    { intervalMs },
    "[reservations] Scheduler configurado: intervalo de 60 segundos"
  );
}

export function stopReservationExpirationScheduler(): void {
  if (timer) {
    clearInterval(timer);
    timer = undefined;
    logger.info("[reservations] Scheduler detenido");
  }
}