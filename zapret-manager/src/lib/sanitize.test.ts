import { describe, expect, it } from "vitest";

import {
  escapeHtml,
  isWithinSizeLimit,
  redactSecrets,
  validateDomain,
  validateFilePath,
  validateIp,
  validateIpRange,
  validatePort,
  validateTextFilePath,
  validateVersion,
} from "@/lib/sanitize";

describe("validateDomain", () => {
  it("accepts normal domains and normalizes case", () => {
    expect(validateDomain("Discord.com").valid).toBe(true);
    expect(validateDomain("  discord.com  ").message).toBeNull();
  });

  it("rejects malformed input", () => {
    expect(validateDomain("not a domain").valid).toBe(false);
    expect(validateDomain("-bad.example").valid).toBe(false);
    expect(validateDomain("bad-.example").valid).toBe(false);
    expect(validateDomain("localhost").valid).toBe(false);
    expect(validateDomain("").valid).toBe(false);
    expect(validateDomain("double..dot.example").valid).toBe(false);
  });
});

describe("validatePort", () => {
  it("accepts unprivileged ports", () => {
    expect(validatePort(51820).valid).toBe(true);
    expect(validatePort(1024).valid).toBe(true);
  });

  it("rejects reserved and fractional ports", () => {
    expect(validatePort(80).valid).toBe(false);
    expect(validatePort(0).valid).toBe(false);
    expect(validatePort(1.5).valid).toBe(false);
  });
});

describe("validateIp", () => {
  it("accepts IPv4 and IPv6", () => {
    expect(validateIp("1.1.1.1").valid).toBe(true);
    expect(validateIp("fe80::1").valid).toBe(true);
  });

  it("rejects broken addresses", () => {
    expect(validateIp("256.1.1.1").valid).toBe(false);
    expect(validateIp("не адрес").valid).toBe(false);
  });
});

describe("validateIpRange", () => {
  it("accepts CIDR notation", () => {
    expect(validateIpRange("10.0.0.0/8").valid).toBe(true);
    expect(validateIpRange("fd00::/8").valid).toBe(true);
  });

  it("rejects wrong masks and missing mask", () => {
    expect(validateIpRange("10.0.0.0/40").valid).toBe(false);
    expect(validateIpRange("10.0.0.0").valid).toBe(false);
  });
});

describe("validateFilePath", () => {
  it("requires absolute path", () => {
    expect(validateFilePath("C:\\strategies").valid).toBe(true);
    expect(validateFilePath("strategies").valid).toBe(false);
  });

  it("rejects traversal", () => {
    expect(validateFilePath("C:\\..\\Windows").valid).toBe(false);
  });
});

describe("validateTextFilePath", () => {
  it("allows only text-like extensions", () => {
    expect(validateTextFilePath("C:\\temp\\config.json").valid).toBe(true);
    expect(validateTextFilePath("C:\\temp\\wire.conf").valid).toBe(true);
    expect(validateTextFilePath("C:\\temp\\run.bat").valid).toBe(false);
    expect(validateTextFilePath("C:\\temp\\evil.exe").valid).toBe(false);
  });
});

describe("validateVersion", () => {
  it("accepts dotted versions", () => {
    expect(validateVersion("1.10.3").valid).toBe(true);
    expect(validateVersion("1.10").valid).toBe(true);
  });

  it("rejects free text", () => {
    expect(validateVersion("latest").valid).toBe(false);
    expect(validateVersion("../1.0.0").valid).toBe(false);
  });
});

describe("escapeHtml", () => {
  it("escapes all dangerous characters", () => {
    expect(escapeHtml(`<script>"x" & 'y'</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/script&gt;"
    );
  });
});

describe("redactSecrets", () => {
  it("hides private keys and passwords", () => {
    const message = redactSecrets("PrivateKey = abc123 password = qwerty");

    expect(message).not.toContain("abc123");
    expect(message).not.toContain("qwerty");
  });

  it("keeps ordinary text", () => {
    expect(redactSecrets("Найдено стратегий: 22")).toBe(
      "Найдено стратегий: 22"
    );
  });
});

describe("isWithinSizeLimit", () => {
  it("accepts small payloads and rejects large ones", () => {
    expect(isWithinSizeLimit("a".repeat(100)).valid).toBe(true);
    expect(isWithinSizeLimit("a".repeat(1024 * 1024 + 1)).valid).toBe(false);
  });
});
