// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/validators.
import {
  // Подключаем именованный импорт MAX_PORT.
  MAX_PORT,
  // Подключаем именованный импорт MIN_PORT.
  MIN_PORT,
  // Подключаем именованный импорт domainError.
  domainError,
  // Подключаем именованный импорт isValidDomain.
  isValidDomain,
  // Подключаем именованный импорт isValidIpRange.
  isValidIpRange,
  // Подключаем именованный импорт isValidIpv4.
  isValidIpv4,
  // Подключаем именованный импорт isValidIpv6.
  isValidIpv6,
  // Подключаем именованный импорт isValidPort.
  isValidPort,
  // Подключаем именованный импорт ipError.
  ipError,
  // Подключаем именованный импорт normalizeDomain.
  normalizeDomain,
  // Подключаем именованный импорт portError.
  portError,
  // Закрываем текущий блок.
} from "@/lib/validators";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("normalizeDomain", () => {
  // Обрабатываем конструкцию: it.
  it("убирает пробелы и приводит к нижнему регистру", () => {
    // Обрабатываем конструкцию: expect.
    expect(normalizeDomain("  Discord.COM ")).toBe("discord.com");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("убирает спецсимволы префикса и хвостовые точки", () => {
    // Обрабатываем конструкцию: expect.
    expect(normalizeDomain("^!Discord.COM...")).toBe("discord.com");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidDomain", () => {
  // Обрабатываем конструкцию: it.
  it("принимает корректные домены", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("discord.com")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("a-b.example.co.uk")).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет некорректные", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("no dot")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("discord.com/path")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("bad_domain.com")).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет метки с дефисом на краях", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("-bad.com")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("bad-.com")).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет слишком длинный домен", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain(`${"a".repeat(300)}.com`)).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidIpv4", () => {
  // Обрабатываем конструкцию: it.
  it("проверяет октеты", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv4("0.0.0.0")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv4("255.255.255.255")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv4("256.0.0.1")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv4("1.1.1")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidIpv6", () => {
  // Обрабатываем конструкцию: it.
  it("проверяет формат", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv6("2606:4700::1111")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv6("::1")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv6("2606:4700:::1")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpv6("1.1.1.1")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidIpRange", () => {
  // Обрабатываем конструкцию: it.
  it("принимает одиночные адреса", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("10.0.0.1")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("2606:4700::1111")).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("принимает диапазоны CIDR", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("10.0.0.0/8")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("10.0.0.0/33")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidPort", () => {
  // Обрабатываем конструкцию: it.
  it("проверяет границы", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidPort(MIN_PORT)).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidPort(MAX_PORT)).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidPort(0)).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isValidPort(MAX_PORT + 1)).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("принимает строки с числами", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidPort("443")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isValidPort("abc")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("сообщения об ошибках", () => {
  // Обрабатываем конструкцию: it.
  it("домен: null для валидного значения", () => {
    // Обрабатываем конструкцию: expect.
    expect(domainError("discord.com")).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("домен: строка для пустого значения", () => {
    // Обрабатываем конструкцию: expect.
    expect(domainError("")).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ip: различает ipv4 и диапазон", () => {
    // Обрабатываем конструкцию: expect.
    expect(ipError("10.0.0.1")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(ipError("10.0.0.0/24")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(ipError("999.0.0.1")).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("порт: null для валидного значения", () => {
    // Обрабатываем конструкцию: expect.
    expect(portError("443")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(portError("70000")).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(portError(" ")).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
