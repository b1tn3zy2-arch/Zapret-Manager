// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/validators.
import {
  // Обрабатываем конструкцию: isValidDomain.
  isValidDomain as isDomain,
  // Обрабатываем конструкцию: isValidCidr.
  isValidCidr as isCidr,
  // Закрываем текущий блок.
} from "@/lib/validators";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Проверки игровых адресов и масок. Правила те же, что и в
 * Проверки игровых адресов и масок. Правила те же, что и в
 // Сохраняем пояснение разработчика: * lib/validators.ts: адрес может быть IPv4 или IPv6, маска —…
 * `lib/validators.ts`: адрес может быть IPv4 или IPv6, маска — от 0
 // Сохраняем пояснение разработчика: * до 32 (для IPv4) или до 128 (для IPv6). В отличие от импор…
 * до 32 (для IPv4) или до 128 (для IPv6). В отличие от импорта
 // Сохраняем пояснение разработчика: * списков, здесь маска обязательна.
 * списков, здесь маска обязательна.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function isValidDomain(value: string): string | null {
  // Обрабатываем конструкцию: const trimmed = value.trim().
  const trimmed = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isDomain(trimmed) ? null : translateKey(validation.doma….
  return isDomain(trimmed) ? null : translateKey("validation.domainLooksWrong");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidIpRange(value: string): string | null {
  // Обрабатываем конструкцию: const trimmed = value.trim().
  const trimmed = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isCidr(trimmed) ? null : translateKey(validation.cidrEx….
  return isCidr(trimmed) ? null : translateKey("validation.cidrExpected");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
