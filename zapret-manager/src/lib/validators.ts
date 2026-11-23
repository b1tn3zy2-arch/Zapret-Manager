// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Единая реализация проверки доменов, портов и IP-адресов.
 * Единая реализация проверки доменов, портов и IP-адресов.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Раньше в проекте было четыре расходящихся варианта (saniti…
 * Раньше в проекте было четыре расходящихся варианта (`sanitize.ts`,
 // Сохраняем пояснение разработчика: * validators.ts, gameValidation.ts и security/sanitize.rs в …
 * `validators.ts`, `gameValidation.ts` и `security/sanitize.rs` в Rust),
 // Сохраняем пояснение разработчика: * и импорт списка позволял внести порт 80, который Rust зате…
 * и импорт списка позволял внести порт 80, который Rust затем
 // Сохраняем пояснение разработчика: * отвергал. Теперь правила одни и те же в интерфейсе и в бэк…
 * отвергал. Теперь правила одни и те же в интерфейсе и в бэкенде:
 // Сохраняем пояснение разработчика: * порт — от 1024 до 65535, адрес — IPv4 или IPv6.
 * порт — от 1024 до 65535, адрес — IPv4 или IPv6.
 // Сохраняем пояснение разработчика: 
 */
// — разделитель логических блоков —

// Обрабатываем конструкцию: const MAX_DOMAIN_LENGTH = 253.
const MAX_DOMAIN_LENGTH = 253;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const DOMAIN_SHAPE = /^[a-z0-9.-]+$/.
const DOMAIN_SHAPE = /^[a-z0-9.-]+$/;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const IPV4_SHAPE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(….
const IPV4_SHAPE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const IPV6_GROUP = /^[0-9a-f]{1,4}$/.
const IPV6_GROUP = /^[0-9a-f]{1,4}$/;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Диапазон портов. Это порты серверов игры и адресатов обход…
 * Диапазон портов. Это порты серверов игры и адресатов обхода
 // Сохраняем пояснение разработчика: * (443, 27015 и подобные), а не локальные слушающие порты,
 * (`443`, `27015` и подобные), а не локальные слушающие порты,
 // Сохраняем пояснение разработчика: * поэтому нижняя граница — 1. Rust использует то же значение…
 * поэтому нижняя граница — 1. Rust использует то же значение в
 // Сохраняем пояснение разработчика: * constants::MIN_PORT.
 * `constants::MIN_PORT`.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export const MIN_PORT = 1;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const MAX_PORT = 65535;
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

// Обрабатываем конструкцию: const OK: ValidationResult = { valid: true, message: nu….
const OK: ValidationResult = { valid: true, message: null };
// — разделитель логических блоков —

// Объявляем функцию result.
function result(valid: boolean, message: string | null): ValidationResult {
  // Возвращаем результат: { valid, message }.
  return { valid, message };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function normalizeDomain(raw: string): string {
  // Возвращаем результат: raw .trim() .replace(/^[\^|!]+/, ) .toLowerCase() .repl….
  return (
    // Продолжаем предыдущую конструкцию.
    raw
      // Продолжаем цепочку вызовов.
      .trim()
      // Продолжаем цепочку вызовов.
      .replace(/^[\^|!]+/, "")
      // Продолжаем цепочку вызовов.
      .toLowerCase()
      // Продолжаем цепочку вызовов.
      .replace(/\.+$/, "")
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidDomain(raw: string): boolean {
  // Обрабатываем конструкцию: const domain = normalizeDomain(raw).
  const domain = normalizeDomain(raw);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: domain.length === 0 || domain.length > MAX_DOMAIN_LENGT….
  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !domain.includes(.) || !DOMAIN_SHAPE.test(domain).
  if (!domain.includes(".") || !DOMAIN_SHAPE.test(domain)) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: domain .split(.) .every( (label) => label.length > 0 &&….
  return (
    // Продолжаем предыдущую конструкцию.
    domain
      // Продолжаем цепочку вызовов.
      .split(".")
      // Продолжаем цепочку вызовов.
      .every(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (label) =>
          // Обрабатываем конструкцию: label.
          label.length > 0 && !label.startsWith("-") && !label.endsWith("-")
        // Закрываем выражение или список аргументов.
      )
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidIpv4(raw: string): boolean {
  // Обрабатываем конструкцию: const match = IPV4_SHAPE.exec(raw).
  const match = IPV4_SHAPE.exec(raw);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: match === null.
  if (match === null) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: match.slice(1).every((part) => Number(part) <= 255).
  return match.slice(1).every((part) => Number(part) <= 255);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidIpv6(raw: string): boolean {
  // Обрабатываем конструкцию: const doubled = raw.split(::).length - 1.
  const doubled = raw.split("::").length - 1;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: doubled > 1.
  if (doubled > 1) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const segments = raw.split(::).filter((part) => part !=….
  const segments = raw.split("::").filter((part) => part !== "");
  // Обрабатываем конструкцию: const groups = segments.flatMap((part) => part.split(:)….
  const groups = segments.flatMap((part) => part.split(":"));
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: groups.length === 0 || groups.some((group) => !IPV6_GRO….
  if (groups.length === 0 || groups.some((group) => !IPV6_GROUP.test(group))) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: doubled === 1 ? groups.length < 8 : groups.length === 8.
  return doubled === 1 ? groups.length < 8 : groups.length === 8;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidIpRange(raw: string): boolean {
  // Обрабатываем конструкцию: const value = raw.trim().
  const value = raw.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value.length === 0.
  if (value.length === 0) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const segments = value.split(/).
  const segments = value.split("/");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: segments.length > 2.
  if (segments.length > 2) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const address = segments[0] ??.
  const address = segments[0] ?? "";
  // Обрабатываем конструкцию: const prefix = segments[1].
  const prefix = segments[1];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: address.includes(:).
  if (address.includes(":")) {
    // Возвращаем результат: prefix === undefined && isValidIpv6(address).
    return prefix === undefined && isValidIpv6(address);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !isValidIpv4(address).
  if (!isValidIpv4(address)) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: prefix === undefined.
  if (prefix === undefined) {
    // Возвращаем результат: true.
    return true;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !/^\d{1,3}$/.test(prefix).
  if (!/^\d{1,3}$/.test(prefix)) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: Number(prefix) <= 32.
  return Number(prefix) <= 32;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Диапазон в нотации CIDR — с обязательной маской. В настрой…
 * Диапазон в нотации CIDR — с обязательной маской. В настройках
 // Сохраняем пояснение разработчика: * игры и в списках обхода адрес указывается именно так, а од…
 * игры и в списках обхода адрес указывается именно так, а одиночный
 // Сохраняем пояснение разработчика: * адрес без маски допустим только в импортируемых списках.
 * адрес без маски допустим только в импортируемых списках.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function isValidCidr(raw: string): boolean {
  // Обрабатываем конструкцию: const value = raw.trim().
  const value = raw.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !value.includes(/).
  if (!value.includes("/")) {
    // Возвращаем результат: false.
    return false;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isValidIpRange(value).
  return isValidIpRange(value);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isValidPort(raw: string | number): boolean {
  // Обрабатываем конструкцию: const value = typeof raw === number ? raw : Number(raw.….
  const value = typeof raw === "number" ? raw : Number(raw.trim());
  // — разделитель логических блоков —

  // Возвращаем результат: Number.isInteger(value) && value >= MIN_PORT && value <….
  return Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Домен: не длиннее 253 символов, только допустимые символы.
/** Домен: не длиннее 253 символов, только допустимые символы. */
// Обрабатываем конструкцию: export.
export function validateDomain(value: string): ValidationResult {
  // Обрабатываем конструкцию: const domain = normalizeDomain(value).
  const domain = normalizeDomain(value);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: domain.length === 0 || domain.length > MAX_DOMAIN_LENGT….
  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    // Возвращаем результат: result(false, translateKey(validation.domainTooLong)).
    return result(false, translateKey("validation.domainTooLong"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !isValidDomain(domain).
  if (!isValidDomain(domain)) {
    // Возвращаем результат: result(false, translateKey(validation.domainChars)).
    return result(false, translateKey("validation.domainChars"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: OK.
  return OK;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Порт: целое число от 1 до 65535.
/** Порт: целое число от 1 до 65535. */
// Обрабатываем конструкцию: export.
export function validatePort(value: number): ValidationResult {
  // Проверяем бизнес-условие: !Number.isInteger(value).
  if (!Number.isInteger(value)) {
    // Возвращаем результат: result(false, translateKey(validation.portInteger)).
    return result(false, translateKey("validation.portInteger"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: value < MIN_PORT || value > MAX_PORT.
  if (value < MIN_PORT || value > MAX_PORT) {
    // Возвращаем результат: result(false, translateKey(validation.portRange)).
    return result(false, translateKey("validation.portRange"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: OK.
  return OK;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Адрес: IPv4 или IPv6.
/** Адрес: IPv4 или IPv6. */
// Обрабатываем конструкцию: export.
export function validateIp(value: string): ValidationResult {
  // Обрабатываем конструкцию: const address = value.trim().
  const address = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: address.length === 0.
  if (address.length === 0) {
    // Возвращаем результат: result(false, translateKey(validation.ipFamily)).
    return result(false, translateKey("validation.ipFamily"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: isValidIpv4(address).
  if (isValidIpv4(address)) {
    // Возвращаем результат: OK.
    return OK;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: address.includes(:) && isValidIpv6(address).
  if (address.includes(":") && isValidIpv6(address)) {
    // Возвращаем результат: OK.
    return OK;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: result(false, translateKey(validation.ipFamily)).
  return result(false, translateKey("validation.ipFamily"));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Адрес с маской: 10.0.0.0/8 или 2001:db8::/32.
/** Адрес с маской: `10.0.0.0/8` или `2001:db8::/32`. */
// Обрабатываем конструкцию: export.
export function validateIpRange(value: string): ValidationResult {
  // Обрабатываем конструкцию: const address = value.trim().
  const address = value.trim();
  // Обрабатываем конструкцию: const segments = address.split(/).
  const segments = address.split("/");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: segments.length > 2.
  if (segments.length > 2) {
    // Возвращаем результат: result(false, translateKey(validation.cidrExample)).
    return result(false, translateKey("validation.cidrExample"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const host = segments[0] ??.
  const host = segments[0] ?? "";
  // Обрабатываем конструкцию: const prefix = segments[1].
  const prefix = segments[1];
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: host === undefined || host ===.
  if (host === undefined || host === "") {
    // Возвращаем результат: result(false, translateKey(validation.cidrExample)).
    return result(false, translateKey("validation.cidrExample"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const isIpv6 = host.includes(:).
  const isIpv6 = host.includes(":");
  // Обрабатываем конструкцию: const addressCheck = validateIp(host).
  const addressCheck = validateIp(host);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !addressCheck.valid.
  if (!addressCheck.valid) {
    // Возвращаем результат: addressCheck.
    return addressCheck;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: prefix === undefined.
  if (prefix === undefined) {
    // Возвращаем результат: result(false, translateKey(validation.cidrExample)).
    return result(false, translateKey("validation.cidrExample"));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const length = Number(prefix).
  const length = Number(prefix);
  // Обрабатываем конструкцию: const max = isIpv6 ? 128 : 32.
  const max = isIpv6 ? 128 : 32;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !Number.isInteger(length) || length < 0 || length > max.
  if (!Number.isInteger(length) || length < 0 || length > max) {
    // Возвращаем результат: result(false, translateKey(validation.cidrMaskRange, { ….
    return result(false, translateKey("validation.cidrMaskRange", { max }));
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: OK.
  return OK;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function domainError(value: string): string | null {
  // Обрабатываем конструкцию: const trimmed = value.trim().
  const trimmed = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: translateKey(validation.emptyValue).
    return translateKey("validation.emptyValue");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isValidDomain(trimmed) ? null : translateKey(validation….
  return isValidDomain(trimmed)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      null
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      translateKey("validation.invalidDomain");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function ipError(value: string): string | null {
  // Обрабатываем конструкцию: const trimmed = value.trim().
  const trimmed = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: translateKey(validation.emptyValue).
    return translateKey("validation.emptyValue");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isValidIpRange(trimmed) ? null : translateKey(validatio….
  return isValidIpRange(trimmed)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      null
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      translateKey("validation.invalidIpRange");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function portError(value: string): string | null {
  // Обрабатываем конструкцию: const trimmed = value.trim().
  const trimmed = value.trim();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: trimmed ===.
  if (trimmed === "") {
    // Возвращаем результат: translateKey(validation.emptyValue).
    return translateKey("validation.emptyValue");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: isValidPort(trimmed) ? null : translateKey(validation.p….
  return isValidPort(trimmed)
    ? // Обрабатываем конструкцию: ?.
      // Продолжаем предыдущую конструкцию.
      null
    : // Обрабатываем конструкцию: :.
      // Продолжаем предыдущую конструкцию.
      translateKey("validation.portOutOfRange", {
        // Обрабатываем конструкцию: min.
        min: MIN_PORT,
        // Обрабатываем конструкцию: max.
        max: MAX_PORT,
        // Закрываем текущий блок.
      });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
