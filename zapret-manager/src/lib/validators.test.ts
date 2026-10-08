import { describe, expect, it } from "vitest";

import {
  MAX_PORT,
  MIN_PORT,
  domainError,
  isValidDomain,
  isValidIpRange,
  isValidIpv4,
  isValidIpv6,
  isValidPort,
  ipError,
  normalizeDomain,
  portError,
} from "@/lib/validators";

describe("normalizeDomain", () => {
  it("убирает пробелы и приводит к нижнему регистру", () => {
    expect(normalizeDomain("  Discord.COM ")).toBe("discord.com");
  });

  it("убирает спецсимволы префикса и хвостовые точки", () => {
    expect(normalizeDomain("^!Discord.COM...")).toBe("discord.com");
  });
});

describe("isValidDomain", () => {
  it("принимает корректные домены", () => {
    expect(isValidDomain("discord.com")).toBe(true);
    expect(isValidDomain("a-b.example.co.uk")).toBe(true);
  });

  it("отклоняет некорректные", () => {
    expect(isValidDomain("")).toBe(false);
    expect(isValidDomain("no dot")).toBe(false);
    expect(isValidDomain("discord.com/path")).toBe(false);
    expect(isValidDomain("bad_domain.com")).toBe(false);
  });

  it("отклоняет метки с дефисом на краях", () => {
    expect(isValidDomain("-bad.com")).toBe(false);
    expect(isValidDomain("bad-.com")).toBe(false);
  });

  it("отклоняет слишком длинный домен", () => {
    expect(isValidDomain(`${"a".repeat(300)}.com`)).toBe(false);
  });
});

describe("isValidIpv4", () => {
  it("проверяет октеты", () => {
    expect(isValidIpv4("0.0.0.0")).toBe(true);
    expect(isValidIpv4("255.255.255.255")).toBe(true);
    expect(isValidIpv4("256.0.0.1")).toBe(false);
    expect(isValidIpv4("1.1.1")).toBe(false);
  });
});

describe("isValidIpv6", () => {
  it("проверяет формат", () => {
    expect(isValidIpv6("2606:4700::1111")).toBe(true);
    expect(isValidIpv6("::1")).toBe(true);
    expect(isValidIpv6("2606:4700:::1")).toBe(false);
    expect(isValidIpv6("1.1.1.1")).toBe(false);
  });
});

describe("isValidIpRange", () => {
  it("принимает одиночные адреса", () => {
    expect(isValidIpRange("10.0.0.1")).toBe(true);
    expect(isValidIpRange("2606:4700::1111")).toBe(true);
  });

  it("принимает диапазоны CIDR", () => {
    expect(isValidIpRange("10.0.0.0/8")).toBe(true);
    expect(isValidIpRange("10.0.0.0/33")).toBe(false);
  });
});

describe("isValidPort", () => {
  it("проверяет границы", () => {
    expect(isValidPort(MIN_PORT)).toBe(true);
    expect(isValidPort(MAX_PORT)).toBe(true);
    expect(isValidPort(0)).toBe(false);
    expect(isValidPort(MAX_PORT + 1)).toBe(false);
  });

  it("принимает строки с числами", () => {
    expect(isValidPort("443")).toBe(true);
    expect(isValidPort("abc")).toBe(false);
  });
});

describe("сообщения об ошибках", () => {
  it("домен: null для валидного значения", () => {
    expect(domainError("discord.com")).toBeNull();
  });

  it("домен: строка для пустого значения", () => {
    expect(domainError("")).toBeTypeOf("string");
  });

  it("ip: различает ipv4 и диапазон", () => {
    expect(ipError("10.0.0.1")).toBeNull();
    expect(ipError("10.0.0.0/24")).toBeNull();
    expect(ipError("999.0.0.1")).toBeTypeOf("string");
  });

  it("порт: null для валидного значения", () => {
    expect(portError("443")).toBeNull();
    expect(portError("70000")).toBeTypeOf("string");
    expect(portError(" ")).toBeTypeOf("string");
  });
});
