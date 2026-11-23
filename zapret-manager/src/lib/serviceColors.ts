// Импортируем зависимости из модуля @/components/ui.
import type { BadgeVariant } from "@/components/ui";
// Импортируем зависимости из модуля @/types.
import type { ServiceType } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SERVICE_COLORS = {
  // Обрабатываем конструкцию: discord.
  discord: "info",
  // Обрабатываем конструкцию: youtube.
  youtube: "error",
  // Обрабатываем конструкцию: outlast-trials.
  "outlast-trials": "accent",
  // Обрабатываем конструкцию: general.
  general: "neutral",
  // Закрываем текущий блок.
} as const satisfies Record<ServiceType, BadgeVariant>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function serviceColor(service: ServiceType): BadgeVariant {
  // Возвращаем результат: SERVICE_COLORS[service] ?? neutral.
  return SERVICE_COLORS[service] ?? "neutral";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
