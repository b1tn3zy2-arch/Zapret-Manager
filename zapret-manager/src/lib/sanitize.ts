// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/validators.
import {
  // Подключаем именованный импорт validateDomain.
  validateDomain,
  // Подключаем именованный импорт validateIp.
  validateIp,
  // Подключаем именованный импорт validateIpRange.
  validateIpRange,
  // Подключаем именованный импорт validatePort.
  validatePort,
  // Закрываем текущий блок.
} from "@/lib/validators";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Проверки домена, порта и адреса живут в lib/validators.ts:
 * Проверки домена, порта и адреса живут в `lib/validators.ts`:
 // Сохраняем пояснение разработчика: * раньше здесь была вторая копия правил, которая со временем
 * раньше здесь была вторая копия правил, которая со временем
 // Сохраняем пояснение разработчика: * разошлась с первой и с Rust-частью.
 * разошлась с первой и с Rust-частью.
 // Сохраняем пояснение разработчика: 
 */
// Реэкспортируем значения из модуля export { validateDomain, validateIp, validateIpRange, validatePort };.
export { validateDomain, validateIp, validateIpRange, validatePort };
// — разделитель логических блоков —

// Обрабатываем конструкцию: const VERSION_PATTERN = /^\d+(\.\d+){0,3}$/.
const VERSION_PATTERN = /^\d+(\.\d+){0,3}$/;
// Обрабатываем конструкцию: const MAX_TEXT_FILE_BYTES = 1024 * 1024.
const MAX_TEXT_FILE_BYTES = 1024 * 1024;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ValidationResult {
  // Обрабатываем конструкцию: readonly.
  readonly valid: boolean;
  // Обрабатываем конструкцию: readonly.
  readonly message: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию result.
function result(valid: boolean, message: string | null): ValidationResult {
  // Возвращаем результат: { valid, message }.
  return { valid, message };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const OK: ValidationResult = { valid: true, message: nu….
const OK: ValidationResult = { valid: true, message: null };
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function validateFilePath(value: string): ValidationResult {
  // Обрабатываем конструкцию: const path = value.trim().
  const path = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: path.length === 0.
  if (path.length === 0) {
    // Возвращаем результат: result(false, translateKey(validation.pathEmpty)).
    return result(false, translateKey("validation.pathEmpty"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !/^[a-zA-Z]:[\\/]/.test(path) && !path.startsWith(\\\\).
  if (!/^[a-zA-Z]:[\\/]/.test(path) && !path.startsWith("\\\\")) {
    // Возвращаем результат: result(false, translateKey(validation.pathAbsolute)).
    return result(false, translateKey("validation.pathAbsolute"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: path.includes(..).
  if (path.includes("..")) {
    // Возвращаем результат: result(false, translateKey(validation.pathTraversal)).
    return result(false, translateKey("validation.pathTraversal"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: OK.
  return OK;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function validateVersion(value: string): ValidationResult {
  // Проверяем бизнес-условие: !VERSION_PATTERN.test(value.trim()).
  if (!VERSION_PATTERN.test(value.trim())) {
    // Возвращаем результат: result(false, translateKey(validation.versionFormat)).
    return result(false, translateKey("validation.versionFormat"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: OK.
  return OK;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isWithinSizeLimit(content: string): ValidationResult {
  // Возвращаем результат: content.length <= MAX_TEXT_FILE_BYTES ? OK : result(fal….
  return content.length <= MAX_TEXT_FILE_BYTES
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      OK
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      result(false, translateKey("validation.fileTooLarge"));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function escapeHtml(value: string): string {
  // Возвращаем результат: value .replace(/&/g, &amp;) .replace(/</g, &lt;) .repla….
  return (
    // Продолжаем предыдущую конструкцию.
    value
      // Продолжаем цепочку вызовов.
      .replace(/&/g, "&amp;")
      // Продолжаем цепочку вызовов.
      .replace(/</g, "&lt;")
      // Продолжаем цепочку вызовов.
      .replace(/>/g, "&gt;")
      // Продолжаем цепочку вызовов.
      .replace(/"/g, "&quot;")
      // Продолжаем цепочку вызовов.
      .replace(/'/g, "&#39;")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function redactSecrets(message: string): string {
  // Возвращаем результат: message.replace( /(privatekey|presharedkey|secret|passw….
  return message.replace(
    // Обрабатываем конструкцию: /(privatekey|presharedkey|secret|password|passwd|token|….
    /(privatekey|presharedkey|secret|password|passwd|token|apikey|api_key)\s*=\s*\S+/gi,
    // Обрабатываем конструкцию: $1 = [${.
    `$1 = [${translateKey("validation.redacted")}]`
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
