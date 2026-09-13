import pino from "pino";
export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  base: {
    service: "zenplus-api",
    environment: process.env.NODE_ENV ?? "development",
  },
});
