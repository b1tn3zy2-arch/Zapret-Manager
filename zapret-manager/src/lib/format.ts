import type { LogEntry, ServiceType } from "@/types";

const SERVICE_LABELS = {
  discord: "Discord",
  youtube: "YouTube",
  "outlast-trials": "Outlast Trials",
  general: "General",
} as const satisfies Record<ServiceType, string>;

export function capitalizeService(service: ServiceType): string {
  return SERVICE_LABELS[service] ?? service;
}

const KB = 1024;
const MB = KB * 1024;

export function formatFileSize(bytes: number): string {
  if (bytes < KB) {
    return `${bytes} Б`;
  }
  if (bytes < MB) {
    return `${(bytes / KB).toFixed(1).replace(".0", "")} КБ`;
  }
  return `${(bytes / MB).toFixed(1).replace(".0", "")} МБ`;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const WEEKDAY_OFFSET: Record<number, string> = {
  0: "в воскресенье",
  1: "в понедельник",
  2: "во вторник",
  3: "в среду",
  4: "в четверг",
  5: "в пятницу",
  6: "в субботу",
};

function plural(count: number, one: string, few: string, many: string): string {
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) {
    return many;
  }
  const mod10 = count % 10;
  if (mod10 === 1) {
    return one;
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return few;
  }
  return many;
}

export function formatCount(
  count: number,
  one: string,
  few: string,
  many: string
): string {
  return `${count} ${plural(count, one, few, many)}`;
}

export function formatRelativeTime(ms: number): string {
  const delta = Date.now() - ms;

  if (delta < MINUTE) {
    return "только что";
  }

  if (delta < HOUR) {
    const minutes = Math.floor(delta / MINUTE);
    return `${minutes} ${plural(minutes, "минуту", "минуты", "минут")} назад`;
  }

  if (delta < DAY) {
    const hours = Math.floor(delta / HOUR);
    return `${hours} ${plural(hours, "час", "часа", "часов")} назад`;
  }

  const days = Math.floor(delta / DAY);

  if (days === 1) {
    return "вчера";
  }

  if (days < 7) {
    return WEEKDAY_OFFSET[new Date(ms).getDay()] ?? `${days} дней назад`;
  }

  return new Date(ms).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function pad(value: number, size: number): string {
  return value.toString().padStart(size, "0");
}

export function formatLogTime(timestamp: number): string {
  const date = new Date(timestamp);

  return `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(
    date.getSeconds(),
    2
  )}.${pad(date.getMilliseconds(), 3)}`;
}

export function formatLogLine(entry: LogEntry): string {
  return `[${formatLogTime(entry.timestamp)}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}`;
}

const REGEXP_SPECIALS = /[.*+?^${}()|[\]\\]/g;

export function escapeRegExp(value: string): string {
  return value.replace(REGEXP_SPECIALS, "\\$&");
}

export function buildSearchMatcher(query: string): RegExp | null {
  const trimmed = query.trim();

  if (trimmed === "") {
    return null;
  }

  return new RegExp(`(${escapeRegExp(trimmed)})`, "gi");
}
