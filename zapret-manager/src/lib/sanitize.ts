const DOMAIN_PATTERN =
  /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.(?!-)[a-z0-9-]{1,63}(?<!-))+$/;
const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_PATTERN = /^[0-9a-f:]{2,45}$/i;
const VERSION_PATTERN = /^\d+(\.\d+){0,3}$/;
const TEXT_EXTENSIONS = [".txt", ".json", ".conf", ".log"];
const MAX_TEXT_FILE_BYTES = 1024 * 1024;

export interface ValidationResult {
  readonly valid: boolean;
  readonly message: string | null;
}

function result(valid: boolean, message: string | null): ValidationResult {
  return { valid, message };
}

const OK: ValidationResult = { valid: true, message: null };

export function validateDomain(value: string): ValidationResult {
  const domain = value.trim().toLowerCase();

  if (domain.length === 0 || domain.length > 253) {
    return result(
      false,
      "Домен не должен быть пустым или длиннее 253 символов"
    );
  }

  if (!DOMAIN_PATTERN.test(domain)) {
    return result(
      false,
      "Домен должен состоять из латинских букв, цифр и дефисов"
    );
  }

  return OK;
}

export function validatePort(value: number): ValidationResult {
  if (!Number.isInteger(value)) {
    return result(false, "Порт должен быть целым числом");
  }

  if (value < 1024 || value > 65535) {
    return result(false, "Порт должен быть в диапазоне 1024–65535");
  }

  return OK;
}

export function validateIp(value: string): ValidationResult {
  const address = value.trim();

  if (IPV4_PATTERN.test(address)) {
    const octets = address.split(".").map(Number);

    if (octets.some((octet) => octet > 255)) {
      return result(false, "Октет адреса больше 255");
    }

    return OK;
  }

  if (address.includes(":") && IPV6_PATTERN.test(address)) {
    return OK;
  }

  return result(false, "Адрес должен быть IPv4 или IPv6");
}

export function validateIpRange(value: string): ValidationResult {
  const [address, prefix] = value.trim().split("/");

  if (address === undefined || prefix === undefined) {
    return result(false, "Укажите адрес с маской, например 10.0.0.0/8");
  }

  const addressCheck = validateIp(address);
  if (!addressCheck.valid) {
    return addressCheck;
  }

  const length = Number(prefix);
  const max = address.includes(":") ? 128 : 32;

  if (!Number.isInteger(length) || length < 0 || length > max) {
    return result(false, `Маска должна быть числом от 0 до ${max}`);
  }

  return OK;
}

export function validateFilePath(value: string): ValidationResult {
  const path = value.trim();

  if (path.length === 0) {
    return result(false, "Путь не может быть пустым");
  }

  if (!/^[a-zA-Z]:[\\/]/.test(path) && !path.startsWith("\\\\")) {
    return result(false, "Нужен полный путь, например C:\\strategies");
  }

  if (path.includes("..")) {
    return result(false, "Путь не должен содержать переходов между папками");
  }

  return OK;
}

export function validateVersion(value: string): ValidationResult {
  if (!VERSION_PATTERN.test(value.trim())) {
    return result(false, "Версия должна выглядеть как 1.10.3");
  }

  return OK;
}

export function validateTextFilePath(value: string): ValidationResult {
  const pathCheck = validateFilePath(value);

  if (!pathCheck.valid) {
    return pathCheck;
  }

  const lower = value.trim().toLowerCase();
  const allowed = TEXT_EXTENSIONS.some((extension) =>
    lower.endsWith(extension)
  );

  return allowed
    ? OK
    : result(false, `Поддерживаются только ${TEXT_EXTENSIONS.join(", ")}`);
}

export function isWithinSizeLimit(content: string): ValidationResult {
  return content.length <= MAX_TEXT_FILE_BYTES
    ? OK
    : result(false, "Файл больше 1 МБ");
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function redactSecrets(message: string): string {
  return message.replace(
    /(privatekey|presharedkey|secret|password|passwd|token|apikey|api_key)\s*=\s*\S+/gi,
    "$1 = [скрыто]"
  );
}
