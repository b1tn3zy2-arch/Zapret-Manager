const MAX_DOMAIN_LENGTH = 253;

const DOMAIN_SHAPE = /^[a-z0-9.-]+$/;

const IPV4_SHAPE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

const IPV6_GROUP = /^[0-9a-f]{1,4}$/;

export const MIN_PORT = 1;

export const MAX_PORT = 65535;

export function normalizeDomain(raw: string): string {
  return raw
    .trim()
    .replace(/^[\^|!]+/, "")
    .toLowerCase()
    .replace(/\.+$/, "");
}

export function isValidDomain(raw: string): boolean {
  const domain = normalizeDomain(raw);

  if (domain.length === 0 || domain.length > MAX_DOMAIN_LENGTH) {
    return false;
  }

  if (!domain.includes(".") || !DOMAIN_SHAPE.test(domain)) {
    return false;
  }

  return domain
    .split(".")
    .every(
      (label) =>
        label.length > 0 && !label.startsWith("-") && !label.endsWith("-")
    );
}

export function isValidIpv4(raw: string): boolean {
  const match = IPV4_SHAPE.exec(raw);

  if (match === null) {
    return false;
  }

  return match.slice(1).every((part) => Number(part) <= 255);
}

export function isValidIpv6(raw: string): boolean {
  const doubled = raw.split("::").length - 1;

  if (doubled > 1) {
    return false;
  }

  const segments = raw.split("::").filter((part) => part !== "");
  const groups = segments.flatMap((part) => part.split(":"));

  if (groups.length === 0 || groups.some((group) => !IPV6_GROUP.test(group))) {
    return false;
  }

  return doubled === 1 ? groups.length < 8 : groups.length === 8;
}

export function isValidIpRange(raw: string): boolean {
  const value = raw.trim();

  if (value.length === 0) {
    return false;
  }

  const segments = value.split("/");

  if (segments.length > 2) {
    return false;
  }

  const address = segments[0] ?? "";
  const prefix = segments[1];

  if (address.includes(":")) {
    return prefix === undefined && isValidIpv6(address);
  }

  if (!isValidIpv4(address)) {
    return false;
  }

  if (prefix === undefined) {
    return true;
  }

  if (!/^\d{1,2}$/.test(prefix)) {
    return false;
  }

  return Number(prefix) <= 32;
}

export function isValidPort(raw: string | number): boolean {
  const value = typeof raw === "number" ? raw : Number(raw.trim());

  return Number.isInteger(value) && value >= MIN_PORT && value <= MAX_PORT;
}

export function domainError(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return translateKey("validation.emptyValue");
  }

  return isValidDomain(trimmed)
    ? null
    : translateKey("validation.invalidDomain");
}

export function ipError(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return translateKey("validation.emptyValue");
  }

  return isValidIpRange(trimmed)
    ? null
    : translateKey("validation.invalidIpRange");
}

export function portError(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return translateKey("validation.emptyValue");
  }

  return isValidPort(trimmed)
    ? null
    : translateKey("validation.portOutOfRange", {
        min: MIN_PORT,
        max: MAX_PORT,
      });
}
import { translateKey } from "@/i18n/core";
