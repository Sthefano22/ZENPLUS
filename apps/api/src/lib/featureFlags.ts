type FlagKey =
  | "PUBLIC_ASSETS"
  | "LEAD_INTAKE"
  | "OPPORTUNITY_PIPELINE"
  | "RATE_LIMITING";

const FLAGS: Record<FlagKey, boolean> = {
  PUBLIC_ASSETS: process.env.FF_PUBLIC_ASSETS !== "false",
  LEAD_INTAKE: process.env.FF_LEAD_INTAKE !== "false",
  OPPORTUNITY_PIPELINE: process.env.FF_OPPORTUNITY_PIPELINE !== "false",
  RATE_LIMITING: process.env.FF_RATE_LIMITING !== "false",
};

export function isEnabled(flag: FlagKey): boolean {
  return FLAGS[flag] ?? false;
}

export function getAllFlags(): Record<FlagKey, boolean> {
  return { ...FLAGS };
}