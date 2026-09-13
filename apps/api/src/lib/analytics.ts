import { logger } from "./logger";

export type AnalyticsEvent =
  | "lead_created"
  | "lead_assigned"
  | "lead_contacted"
  | "lead_qualified"
  | "opportunity_stage_changed"
  | "opportunity_won"
  | "opportunity_lost";

export function track(event: AnalyticsEvent, payload: Record<string, any>) {
  logger.info({ analytics: true, event, ...payload }, `analytics:${event}`);
}