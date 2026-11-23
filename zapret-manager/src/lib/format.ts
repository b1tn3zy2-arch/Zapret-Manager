// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { Language } from "@/types";
// Импортируем зависимости из модуля @/types.
import type { LogEntry, ServiceType } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SERVICE_LABELS = { discord: Discord, youtube: You….
const SERVICE_LABELS = {
  // Обрабатываем конструкцию: discord.
  discord: "Discord",
  // Обрабатываем конструкцию: youtube.
  youtube: "YouTube",
  // Обрабатываем конструкцию: outlast-trials.
  "outlast-trials": "Outlast Trials",
  // Обрабатываем конструкцию: general.
  general: "General",
  // Закрываем текущий блок.
} as const satisfies Record<ServiceType, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function capitalizeService(service: ServiceType): string {
  // Возвращаем результат: SERVICE_LABELS[service] ?? service.
  return SERVICE_LABELS[service] ?? service;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KB = 1024.
const KB = 1024;
// Обрабатываем конструкцию: const MB = KB * 1024.
const MB = KB * 1024;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MINUTE = 60_000.
const MINUTE = 60_000;
// Обрабатываем конструкцию: const HOUR = 60 * MINUTE.
const HOUR = 60 * MINUTE;
// Обрабатываем конструкцию: const DAY = 24 * HOUR.
const DAY = 24 * HOUR;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const BYTE_UNITS: Record<Language, readonly [string, st….
const BYTE_UNITS: Record<Language, readonly [string, string, string]> = {
  // Обрабатываем конструкцию: ru.
  ru: ["Б", "КБ", "МБ"],
  // Обрабатываем конструкцию: en.
  en: ["B", "KB", "MB"],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const JUST_NOW: Record<Language, string> = { ru: только….
const JUST_NOW: Record<Language, string> = {
  // Обрабатываем конструкцию: ru.
  ru: "только что",
  // Обрабатываем конструкцию: en.
  en: "just now",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const AGO: Record<Language, string> = { ru: назад, en: ….
const AGO: Record<Language, string> = {
  // Обрабатываем конструкцию: ru.
  ru: "назад",
  // Обрабатываем конструкцию: en.
  en: "ago",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const YESTERDAY: Record<Language, string> = { ru: вчера….
const YESTERDAY: Record<Language, string> = {
  // Обрабатываем конструкцию: ru.
  ru: "вчера",
  // Обрабатываем конструкцию: en.
  en: "yesterday",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MINUTE_FORMS: Record<Language, readonly [string, ….
const MINUTE_FORMS: Record<Language, readonly [string, string, string]> = {
  // Обрабатываем конструкцию: ru.
  ru: ["минуту", "минуты", "минут"],
  // Обрабатываем конструкцию: en.
  en: ["minute", "minutes", "minutes"],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const HOUR_FORMS: Record<Language, readonly [string, st….
const HOUR_FORMS: Record<Language, readonly [string, string, string]> = {
  // Обрабатываем конструкцию: ru.
  ru: ["час", "часа", "часов"],
  // Обрабатываем конструкцию: en.
  en: ["hour", "hours", "hours"],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DAY_FORMS: Record<Language, readonly [string, str….
const DAY_FORMS: Record<Language, readonly [string, string, string]> = {
  // Обрабатываем конструкцию: ru.
  ru: ["день", "дня", "дней"],
  // Обрабатываем конструкцию: en.
  en: ["day", "days", "days"],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const WEEKDAYS: Record<Language, readonly string[]> = {….
const WEEKDAYS: Record<Language, readonly string[]> = {
  // Обрабатываем конструкцию: ru.
  ru: [
    // Обрабатываем конструкцию: в воскресенье.
    "в воскресенье",
    // Обрабатываем конструкцию: в понедельник.
    "в понедельник",
    // Обрабатываем конструкцию: во вторник.
    "во вторник",
    // Обрабатываем конструкцию: в среду.
    "в среду",
    // Обрабатываем конструкцию: в четверг.
    "в четверг",
    // Обрабатываем конструкцию: в пятницу.
    "в пятницу",
    // Обрабатываем конструкцию: в субботу.
    "в субботу",
    // Закрываем массив или список.
  ],
  // Обрабатываем конструкцию: en.
  en: [
    // Обрабатываем конструкцию: on Sunday.
    "on Sunday",
    // Обрабатываем конструкцию: on Monday.
    "on Monday",
    // Обрабатываем конструкцию: on Tuesday.
    "on Tuesday",
    // Обрабатываем конструкцию: on Wednesday.
    "on Wednesday",
    // Обрабатываем конструкцию: on Thursday.
    "on Thursday",
    // Обрабатываем конструкцию: on Friday.
    "on Friday",
    // Обрабатываем конструкцию: on Saturday.
    "on Saturday",
    // Закрываем массив или список.
  ],
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LOCALES: Record<Language, string> = { ru: ru-RU, ….
const LOCALES: Record<Language, string> = {
  // Обрабатываем конструкцию: ru.
  ru: "ru-RU",
  // Обрабатываем конструкцию: en.
  en: "en-US",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function currentLanguage(): Language {
  // Возвращаем результат: useSettingsStore.getState().settings.general.language.
  return useSettingsStore.getState().settings.general.language;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatFileSize(bytes: number): string {
  // Обрабатываем конструкцию: const units = BYTE_UNITS[currentLanguage()].
  const units = BYTE_UNITS[currentLanguage()];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: bytes < KB.
  if (bytes < KB) {
    // Возвращаем результат: ${bytes} ${units[0]}.
    return `${bytes} ${units[0]}`;
    // Закрываем текущий блок.
  }
  // Проверяем бизнес-условие: bytes < MB.
  if (bytes < MB) {
    // Возвращаем результат: ${(bytes / KB).toFixed(1).replace(.0, )} ${units[1]}.
    return `${(bytes / KB).toFixed(1).replace(".0", "")} ${units[1]}`;
    // Закрываем текущий блок.
  }
  // Возвращаем результат: ${(bytes / MB).toFixed(1).replace(.0, )} ${units[2]}.
  return `${(bytes / MB).toFixed(1).replace(".0", "")} ${units[2]}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию plural.
function plural(
  // Обрабатываем конструкцию: count.
  count: number,
  // Обрабатываем конструкцию: forms.
  forms: readonly [string, string, string]
  // Закрываем выражение или список аргументов.
): string {
  // Обрабатываем конструкцию: const mod100 = count % 100.
  const mod100 = count % 100;
  // Проверяем бизнес-условие: mod100 >= 11 && mod100 <= 14.
  if (mod100 >= 11 && mod100 <= 14) {
    // Возвращаем результат: forms[2].
    return forms[2];
    // Закрываем текущий блок.
  }
  // Обрабатываем конструкцию: const mod10 = count % 10.
  const mod10 = count % 10;
  // Проверяем бизнес-условие: mod10 === 1.
  if (mod10 === 1) {
    // Возвращаем результат: forms[0].
    return forms[0];
    // Закрываем текущий блок.
  }
  // Проверяем бизнес-условие: mod10 >= 2 && mod10 <= 4.
  if (mod10 >= 2 && mod10 <= 4) {
    // Возвращаем результат: forms[1].
    return forms[1];
    // Закрываем текущий блок.
  }
  // Возвращаем результат: forms[2].
  return forms[2];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatRelativeTime(ms: number): string {
  // Обрабатываем конструкцию: const language = currentLanguage().
  const language = currentLanguage();
  // Обрабатываем конструкцию: const delta = Date.now() - ms.
  const delta = Date.now() - ms;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: delta < MINUTE.
  if (delta < MINUTE) {
    // Возвращаем результат: JUST_NOW[language].
    return JUST_NOW[language];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: delta < HOUR.
  if (delta < HOUR) {
    // Обрабатываем конструкцию: const minutes = Math.floor(delta / MINUTE).
    const minutes = Math.floor(delta / MINUTE);
    // Возвращаем результат: ${minutes} ${plural(minutes, MINUTE_FORMS[language])} $….
    return `${minutes} ${plural(minutes, MINUTE_FORMS[language])} ${AGO[language]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: delta < DAY.
  if (delta < DAY) {
    // Обрабатываем конструкцию: const hours = Math.floor(delta / HOUR).
    const hours = Math.floor(delta / HOUR);
    // Возвращаем результат: ${hours} ${plural(hours, HOUR_FORMS[language])} ${AGO[l….
    return `${hours} ${plural(hours, HOUR_FORMS[language])} ${AGO[language]}`;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const days = Math.floor(delta / DAY).
  const days = Math.floor(delta / DAY);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: days === 1.
  if (days === 1) {
    // Возвращаем результат: YESTERDAY[language].
    return YESTERDAY[language];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: days < 7.
  if (days < 7) {
    // Обрабатываем конструкцию: const weekday = WEEKDAYS[language][new Date(ms).getDay(….
    const weekday = WEEKDAYS[language][new Date(ms).getDay()];
    // Возвращаем результат: ( weekday ?? ${days} ${plural(days, DAY_FORMS[language]….
    return (
      // Обрабатываем конструкцию: weekday.
      weekday ?? `${days} ${plural(days, DAY_FORMS[language])} ${AGO[language]}`
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: new Date(ms).toLocaleDateString(LOCALES[language], { da….
  return new Date(ms).toLocaleDateString(LOCALES[language], {
    // Обрабатываем конструкцию: day.
    day: "2-digit",
    // Обрабатываем конструкцию: month.
    month: "2-digit",
    // Обрабатываем конструкцию: year.
    year: "numeric",
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию pad.
function pad(value: number, size: number): string {
  // Возвращаем результат: value.toString().padStart(size, 0).
  return value.toString().padStart(size, "0");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatLogTime(timestamp: number): string {
  // Обрабатываем конструкцию: const date = new Date(timestamp).
  const date = new Date(timestamp);
  // — разделитель логических блоков —

  // Возвращаем результат: ${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}….
  return `${pad(date.getHours(), 2)}:${pad(date.getMinutes(), 2)}:${pad(
    // Продолжаем предыдущую конструкцию.
    date.getSeconds(),
    // Продолжаем предыдущую конструкцию.
    2
    // Продолжаем предыдущую конструкцию.
  )}.${pad(date.getMilliseconds(), 3)}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function formatLogLine(entry: LogEntry): string {
  // Возвращаем результат: [${formatLogTime(entry.timestamp)}] [${entry.level.toUp….
  return `[${formatLogTime(entry.timestamp)}] [${entry.level.toUpperCase()}] [${entry.source}] ${entry.message}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const REGEXP_SPECIALS = /[.*+?^${}()|[\]\\]/g.
const REGEXP_SPECIALS = /[.*+?^${}()|[\]\\]/g;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function escapeRegExp(value: string): string {
  // Возвращаем результат: value.replace(REGEXP_SPECIALS, \\$&).
  return value.replace(REGEXP_SPECIALS, "\\$&");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: // Кэш регулярных выражений: подсветка логов вызывается для …
// Кэш регулярных выражений: подсветка логов вызывается для каждой видимой строки,
// Сохраняем пояснение разработчика: // а запрос поиска меняется только при вводе пользователя.
// а запрос поиска меняется только при вводе пользователя.
// Обрабатываем конструкцию: const searchMatcherCache = new Map<string, RegExp>().
const searchMatcherCache = new Map<string, RegExp>();
// Обрабатываем конструкцию: const searchTesterCache = new Map<string, RegExp>().
const searchTesterCache = new Map<string, RegExp>();
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildSearchMatcher(query: string): RegExp | null {
  // Обрабатываем конструкцию: const trimmed = query.trim().
  const trimmed = query.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const cached = searchMatcherCache.get(trimmed).
  const cached = searchMatcherCache.get(trimmed);
  // Проверяем бизнес-условие: cached !== undefined.
  if (cached !== undefined) {
    // Возвращаем результат: cached.
    return cached;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const matcher = new RegExp((${escapeRegExp(trimmed)}), ….
  const matcher = new RegExp(`(${escapeRegExp(trimmed)})`, "gi");
  // Обрабатываем конструкцию: searchMatcherCache.
  searchMatcherCache.set(trimmed, matcher);
  // Возвращаем результат: matcher.
  return matcher;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: // Отдельное регулярное выражение без флага g: его test() не…
// Отдельное регулярное выражение без флага g: его test() не меняет lastIndex,
// Сохраняем пояснение разработчика: // поэтому его безопасно вызывать для каждой части строки.
// поэтому его безопасно вызывать для каждой части строки.
// Обрабатываем конструкцию: export.
export function buildSearchTester(query: string): RegExp | null {
  // Обрабатываем конструкцию: const trimmed = query.trim().
  const trimmed = query.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const cached = searchTesterCache.get(trimmed).
  const cached = searchTesterCache.get(trimmed);
  // Проверяем бизнес-условие: cached !== undefined.
  if (cached !== undefined) {
    // Возвращаем результат: cached.
    return cached;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const tester = new RegExp((${escapeRegExp(trimmed)}), i….
  const tester = new RegExp(`(${escapeRegExp(trimmed)})`, "i");
  // Обрабатываем конструкцию: searchTesterCache.
  searchTesterCache.set(trimmed, tester);
  // Возвращаем результат: tester.
  return tester;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
