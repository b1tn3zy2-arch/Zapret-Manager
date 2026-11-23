// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/sanitize.
import {
  // Подключаем именованный импорт escapeHtml.
  escapeHtml,
  // Подключаем именованный импорт isWithinSizeLimit.
  isWithinSizeLimit,
  // Подключаем именованный импорт redactSecrets.
  redactSecrets,
  // Подключаем именованный импорт validateDomain.
  validateDomain,
  // Подключаем именованный импорт validateFilePath.
  validateFilePath,
  // Подключаем именованный импорт validateIp.
  validateIp,
  // Подключаем именованный импорт validateIpRange.
  validateIpRange,
  // Подключаем именованный импорт validatePort.
  validatePort,
  // Подключаем именованный импорт validateVersion.
  validateVersion,
  // Закрываем текущий блок.
} from "@/lib/sanitize";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateDomain", () => {
  // Обрабатываем конструкцию: it.
  it("accepts normal domains and normalizes case", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("Discord.com").valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("  discord.com  ").message).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects malformed input", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("not a domain").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("-bad.example").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("bad-.example").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("localhost").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateDomain("double..dot.example").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validatePort", () => {
  // Обрабатываем конструкцию: it.
  it("accepts unprivileged ports", () => {
    // Обрабатываем конструкцию: expect.
    expect(validatePort(51820).valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validatePort(443).valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validatePort(1).valid).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects reserved and fractional ports", () => {
    // Обрабатываем конструкцию: expect.
    expect(validatePort(0).valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validatePort(65536).valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validatePort(1.5).valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateIp", () => {
  // Обрабатываем конструкцию: it.
  it("accepts IPv4 and IPv6", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateIp("1.1.1.1").valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validateIp("fe80::1").valid).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects broken addresses", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateIp("256.1.1.1").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateIp("не адрес").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateIpRange", () => {
  // Обрабатываем конструкцию: it.
  it("accepts CIDR notation", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateIpRange("10.0.0.0/8").valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validateIpRange("fd00::/8").valid).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects wrong masks and missing mask", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateIpRange("10.0.0.0/40").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateIpRange("10.0.0.0").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateFilePath", () => {
  // Обрабатываем конструкцию: it.
  it("requires absolute path", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateFilePath("C:\\strategies").valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validateFilePath("strategies").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects traversal", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateFilePath("C:\\..\\Windows").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateVersion", () => {
  // Обрабатываем конструкцию: it.
  it("accepts dotted versions", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateVersion("1.10.3").valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(validateVersion("1.10").valid).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("rejects free text", () => {
    // Обрабатываем конструкцию: expect.
    expect(validateVersion("latest").valid).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(validateVersion("../1.0.0").valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("escapeHtml", () => {
  // Обрабатываем конструкцию: it.
  it("escapes all dangerous characters", () => {
    // Обрабатываем конструкцию: expect.
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      // Обрабатываем конструкцию: &lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/scrip….
      "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("redactSecrets", () => {
  // Обрабатываем конструкцию: it.
  it("hides private keys and passwords", () => {
    // Обрабатываем конструкцию: const message = redactSecrets(PrivateKey = abc123 passw….
    const message = redactSecrets("PrivateKey = abc123 password = qwerty");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(message).not.toContain("abc123");
    // Обрабатываем конструкцию: expect.
    expect(message).not.toContain("qwerty");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("keeps ordinary text", () => {
    // Обрабатываем конструкцию: expect.
    expect(redactSecrets("Найдено стратегий: 22")).toBe(
      // Обрабатываем конструкцию: Найдено стратегий: 22.
      "Найдено стратегий: 22"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isWithinSizeLimit", () => {
  // Обрабатываем конструкцию: it.
  it("accepts small payloads and rejects large ones", () => {
    // Обрабатываем конструкцию: expect.
    expect(isWithinSizeLimit("a".repeat(100)).valid).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isWithinSizeLimit("a".repeat(1024 * 1024 + 1)).valid).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
