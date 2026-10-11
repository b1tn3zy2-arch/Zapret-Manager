import { useSettingsStore } from "@/stores/useSettingsStore";
import type { Language } from "@/types";
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

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const BYTE_UNITS: Record<Language, readonly [string, string, string]> = {
  ru: ["Б", "КБ", "МБ"],
  en: ["B", "KB", "MB"],
};

const JUST_NOW: Record<Language, string> = {
  ru: "только что",
  en: "just now",
};

const AGO: Record<Language, string> = {
  ru: "назад",
  en: "ago",
};

const YESTERDAY: Record<Language, string> = {
  ru: "вчера",
  en: "yesterday",
};

const MINUTE_FORMS: Record<Language, readonly [string, string, string]> = {
  ru: ["минуту", "минуты", "минут"],
  en: ["minute", "minutes", "minutes"],
};

const HOUR_FORMS: Record<Language, readonly [string, string, string]> = {
  ru: ["час", "часа", "часов"],
  en: ["hour", "hours", "hours"],
};

const DAY_FORMS: Record<Language, readonly [string, string, string]> = {
  ru: ["день", "дня", "дней"],
  en: ["day", "days", "days"],
};

const WEEKDAYS: Record<Language, readonly string[]> = {
  ru: [
    "в воскресенье",
    "в понедельник",
    "во вторник",
    "в среду",
    "в четверг",
    "в пятницу",
    "в субботу",
  ],
  en: [
    "on Sunday",
    "on Monday",
    "on Tuesday",
    "on Wednesday",
    "on Thursday",
    "on Friday",
    "on Saturday",
  ],
};

const LOCALES: Record<Language, string> = {
  ru: "ru-RU",
  en: "en-US",
};

export function currentLanguage(): Language {
  return useSettingsStore.getState().settings.general.language;
}

export function formatFileSize(bytes: number): string {
  const units = BYTE_UNITS[currentLanguage()];

  if (bytes < KB) {
    return `${bytes} ${units[0]}`;
  }
  if (bytes < MB) {
    return `${(bytes / KB).toFixed(1).replace(".0", "")} ${units[1]}`;
  }
  return `${(bytes / MB).toFixed(1).replace(".0", "")} ${units[2]}`;
}

function plural(
  count: number,
  forms: readonly [string, string, string]
): string {
  const mod100 = count % 100;
  if (mod100 >= 11 && mod100 <= 14) {
    return forms[2];
  }
  const mod10 = count % 10;
  if (mod10 === 1) {
    return forms[0];
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return forms[1];
  }
  return forms[2];
}

export function formatRelativeTime(ms: number): string {
  const language = currentLanguage();
  const delta = Date.now() - ms;

  if (delta < MINUTE) {
    return JUST_NOW[language];
  }

  if (delta < HOUR) {
    const minutes = Math.floor(delta / MINUTE);
    return `${minutes} ${plural(minutes, MINUTE_FORMS[language])} ${AGO[language]}`;
  }

  if (delta < DAY) {
    const hours = Math.floor(delta / HOUR);
    return `${hours} ${plural(hours, HOUR_FORMS[language])} ${AGO[language]}`;
  }

  const days = Math.floor(delta / DAY);

  if (days === 1) {
    return YESTERDAY[language];
  }

  if (days < 7) {
    const weekday = WEEKDAYS[language][new Date(ms).getDay()];
    return (
      weekday ?? `${days} ${plural(days, DAY_FORMS[language])} ${AGO[language]}`
    );
  }

  return new Date(ms).toLocaleDateString(LOCALES[language], {
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
