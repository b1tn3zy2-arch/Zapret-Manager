import type { BadgeVariant } from "@/components/ui";
import type { ServiceType } from "@/types";

export const SERVICE_COLORS = {
  discord: "info",
  youtube: "error",
  "outlast-trials": "accent",
  general: "neutral",
} as const satisfies Record<ServiceType, BadgeVariant>;

export function serviceColor(service: ServiceType): BadgeVariant {
  return SERVICE_COLORS[service] ?? "neutral";
}
