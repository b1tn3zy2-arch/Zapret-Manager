import { toCountryCode } from "@/lib/geo";
import type { CountryCode } from "@/assets/flags/countryCodes";

const ENDPOINT_HOST = /^[a-z0-9._-]+/i;

const COUNTRY_HINTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\.nl$/i, "NL"],
  [/\.de$/i, "DE"],
  [/\.fi$/i, "FI"],
  [/\.fr$/i, "FR"],
  [/\.gb$/i, "GB"],
  [/\.uk$/i, "UA"],
  [/\.jp$/i, "JP"],
  [/\.by$/i, "BY"],
  [/\.kz$/i, "KZ"],
  [/\.us$/i, "US"],
  [/\.ru$/i, "RU"],
];

const LEADING_CODE = /^([a-z]{2})\d*[._-]/i;

export function endpointHost(endpoint: string): string {
  const trimmed = endpoint.trim();

  if (trimmed === "") {
    return "";
  }

  const withoutBrackets = trimmed.replace(/^\[/, "").replace(/\].*$/, "");
  const withPort = withoutBrackets.split(":")[0] ?? withoutBrackets;

  return ENDPOINT_HOST.exec(withPort)?.[0] ?? "";
}

export function guessCountryCode(endpoint: string): CountryCode | null {
  const host = endpointHost(endpoint);

  if (host === "") {
    return null;
  }

  for (const [pattern, code] of COUNTRY_HINTS) {
    if (pattern.test(host)) {
      return toCountryCode(code);
    }
  }

  const leading = LEADING_CODE.exec(host)?.[1];

  return leading === undefined ? null : toCountryCode(leading);
}

const LINK_SCHEMES = /^(vless|vmess|trojan|ss|socks|socks5):\/\//i;

export function validateVpnSource(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed === "") {
    return "Вставьте ссылку на подписку или конфиг";
  }

  if (trimmed.length > 8 * 1024) {
    return "Ссылка слишком длинная";
  }

  if (/^https?:\/\//i.test(trimmed) || LINK_SCHEMES.test(trimmed)) {
    return null;
  }

  if (trimmed.includes("://")) {
    return null;
  }

  return "Ожидается https-адрес подписки или ссылка vless, vmess, trojan, ss";
}
