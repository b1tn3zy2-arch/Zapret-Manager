import type { CountryCode } from "@/assets/flags/countryCodes";

import { COUNTRY_CODES } from "@/assets/flags/countryCodes";

const FLAG_URLS = import.meta.glob("/src/assets/flags/*.svg", {
  eager: true,
  query: "?url",
  import: "default",
}) as Record<string, string>;

const FALLBACK_FLAG = "/src/assets/flags/xx.svg";

const KNOWN_CODES = new Set<string>(COUNTRY_CODES);

export function isKnownCountryCode(code: string): code is CountryCode {
  return KNOWN_CODES.has(code.toUpperCase());
}

export function toCountryCode(code: string): CountryCode | null {
  const upper = code.trim().toUpperCase();

  return isKnownCountryCode(upper) ? upper : null;
}

export function countryCodeToFlagSrc(code: string): string {
  const normalized = toCountryCode(code);

  if (normalized === null) {
    return FLAG_URLS[FALLBACK_FLAG] ?? FALLBACK_FLAG;
  }

  return (
    FLAG_URLS[`/src/assets/flags/${normalized.toLowerCase()}.svg`] ??
    FALLBACK_FLAG
  );
}

export function hasFlagAsset(code: string): boolean {
  const normalized = toCountryCode(code);

  return (
    normalized !== null &&
    FLAG_URLS[`/src/assets/flags/${normalized.toLowerCase()}.svg`] !== undefined
  );
}

export function getGreeting(date: Date = new Date()): string {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Доброе утро";
  }

  if (hour >= 12 && hour < 18) {
    return "Добрый день";
  }

  if (hour >= 18 && hour < 23) {
    return "Добрый вечер";
  }

  return "Доброй ночи";
}
