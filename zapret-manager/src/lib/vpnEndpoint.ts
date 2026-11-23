// Импортируем зависимости из модуля @/lib/geo.
import { toCountryCode } from "@/lib/geo";
// Импортируем зависимости из модуля @/assets/flags/countryCodes.
import type { CountryCode } from "@/assets/flags/countryCodes";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const ENDPOINT_HOST = /^[a-z0-9._-]+/i.
const ENDPOINT_HOST = /^[a-z0-9._-]+/i;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const COUNTRY_HINTS: ReadonlyArray<readonly [RegExp, st….
const COUNTRY_HINTS: ReadonlyArray<readonly [RegExp, string]> = [
  // Открываем массив.
  [/\.nl$/i, "NL"],
  // Открываем массив.
  [/\.de$/i, "DE"],
  // Открываем массив.
  [/\.fi$/i, "FI"],
  // Открываем массив.
  [/\.fr$/i, "FR"],
  // Открываем массив.
  [/\.gb$/i, "GB"],
  // Открываем массив.
  [/\.uk$/i, "UA"],
  // Открываем массив.
  [/\.jp$/i, "JP"],
  // Открываем массив.
  [/\.by$/i, "BY"],
  // Открываем массив.
  [/\.kz$/i, "KZ"],
  // Открываем массив.
  [/\.us$/i, "US"],
  // Открываем массив.
  [/\.ru$/i, "RU"],
  // Закрываем массив или список.
];
// — разделитель логических блоков —

// Обрабатываем конструкцию: const LEADING_CODE = /^([a-z]{2})\d*[._-]/i.
const LEADING_CODE = /^([a-z]{2})\d*[._-]/i;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function endpointHost(endpoint: string): string {
  // Обрабатываем конструкцию: const trimmed = endpoint.trim().
  const trimmed = endpoint.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: .
    return "";
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const withoutBrackets = trimmed.replace(/^\[/, ).replac….
  const withoutBrackets = trimmed.replace(/^\[/, "").replace(/\].*$/, "");
  // Обрабатываем конструкцию: const withPort = withoutBrackets.split(:)[0] ?? without….
  const withPort = withoutBrackets.split(":")[0] ?? withoutBrackets;
  // — разделитель логических блоков —

  // Возвращаем результат: ENDPOINT_HOST.exec(withPort)?.[0] ??.
  return ENDPOINT_HOST.exec(withPort)?.[0] ?? "";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function guessCountryCode(endpoint: string): CountryCode | null {
  // Обрабатываем конструкцию: const host = endpointHost(endpoint).
  const host = endpointHost(endpoint);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: host ===.
  if (host === "") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Перебираем элементы коллекции COUNTRY_HINTS.
  for (const [pattern, code] of COUNTRY_HINTS) {
    // Проверяем бизнес-условие: pattern.test(host).
    if (pattern.test(host)) {
      // Возвращаем результат: toCountryCode(code).
      return toCountryCode(code);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const leading = LEADING_CODE.exec(host)?.[1].
  const leading = LEADING_CODE.exec(host)?.[1];
  // — разделитель логических блоков —

  // Возвращаем результат: leading === undefined ? null : toCountryCode(leading).
  return leading === undefined ? null : toCountryCode(leading);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
