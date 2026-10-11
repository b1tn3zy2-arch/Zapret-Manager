const DOMAIN_PATTERN =
  /^(?=.{1,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

export function isValidDomain(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  return DOMAIN_PATTERN.test(trimmed)
    ? null
    : translateKey("validation.domainLooksWrong");
}

export function isValidIpRange(value: string): string | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  const [address, prefix, ...rest] = trimmed.split("/");

  if (rest.length > 0 || address === undefined || prefix === undefined) {
    return translateKey("validation.cidrExpected");
  }

  const bits = Number.parseInt(prefix, 10);

  if (
    !Number.isInteger(bits) ||
    bits < 0 ||
    bits > 32 ||
    !IPV4_PATTERN.test(address) ||
    address.split(".").some((octet) => Number.parseInt(octet, 10) > 255)
  ) {
    return translateKey("validation.cidrExpected");
  }

  return null;
}
import { translateKey } from "@/i18n/core";
