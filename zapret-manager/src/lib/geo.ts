// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/assets/flags/countryCodes.
import type { CountryCode } from "@/assets/flags/countryCodes";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/assets/flags/countryCodes.
import { COUNTRY_CODES } from "@/assets/flags/countryCodes";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FLAG_URLS = import.meta.glob(/src/assets/flags/*.….
const FLAG_URLS = import.meta.glob("/src/assets/flags/*.svg", {
  // Обрабатываем конструкцию: eager.
  eager: true,
  // Обрабатываем конструкцию: query.
  query: "?url",
  // Обрабатываем конструкцию: import.
  import: "default",
  // Закрываем текущий блок.
}) as Record<string, string>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const FALLBACK_FLAG = /src/assets/flags/xx.svg.
const FALLBACK_FLAG = "/src/assets/flags/xx.svg";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const KNOWN_CODES = new Set<string>(COUNTRY_CODES).
const KNOWN_CODES = new Set<string>(COUNTRY_CODES);
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isKnownCountryCode(code: string): code is CountryCode {
  // Возвращаем результат: KNOWN_CODES.has(code.toUpperCase()).
  return KNOWN_CODES.has(code.toUpperCase());
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function toCountryCode(code: string): CountryCode | null {
  // Обрабатываем конструкцию: const upper = code.trim().toUpperCase().
  const upper = code.trim().toUpperCase();
  // — разделитель логических блоков —

  // Возвращаем результат: isKnownCountryCode(upper) ? upper : null.
  return isKnownCountryCode(upper) ? upper : null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function countryCodeToFlagSrc(code: string): string {
  // Обрабатываем конструкцию: const normalized = toCountryCode(code).
  const normalized = toCountryCode(code);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: normalized === null.
  if (normalized === null) {
    // Возвращаем результат: FLAG_URLS[FALLBACK_FLAG] ?? FALLBACK_FLAG.
    return FLAG_URLS[FALLBACK_FLAG] ?? FALLBACK_FLAG;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: ( FLAG_URLS[/src/assets/flags/${normalized.toLowerCase(….
  return (
    // Обрабатываем конструкцию: FLAG_URLS.
    FLAG_URLS[`/src/assets/flags/${normalized.toLowerCase()}.svg`] ??
    // Обрабатываем конструкцию: FALLBACK_FLAG.
    FALLBACK_FLAG
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function hasFlagAsset(code: string): boolean {
  // Обрабатываем конструкцию: const normalized = toCountryCode(code).
  const normalized = toCountryCode(code);
  // — разделитель логических блоков —

  // Возвращаем результат: ( normalized !== null && FLAG_URLS[/src/assets/flags/${….
  return (
    // Обрабатываем конструкцию: normalized.
    normalized !== null &&
    // Обрабатываем конструкцию: FLAG_URLS.
    FLAG_URLS[`/src/assets/flags/${normalized.toLowerCase()}.svg`] !== undefined
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function getGreeting(date: Date = new Date()): string {
  // Обрабатываем конструкцию: const hour = date.getHours().
  const hour = date.getHours();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: hour >= 5 && hour < 12.
  if (hour >= 5 && hour < 12) {
    // Возвращаем результат: translateKey(geo.morning).
    return translateKey("geo.morning");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: hour >= 12 && hour < 18.
  if (hour >= 12 && hour < 18) {
    // Возвращаем результат: translateKey(geo.afternoon).
    return translateKey("geo.afternoon");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: hour >= 18 && hour < 23.
  if (hour >= 18 && hour < 23) {
    // Возвращаем результат: translateKey(geo.evening).
    return translateKey("geo.evening");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: translateKey(geo.night).
  return translateKey("geo.night");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
