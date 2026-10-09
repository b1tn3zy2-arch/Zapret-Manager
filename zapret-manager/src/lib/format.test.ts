import { describe, expect, it } from "vitest";

import {
  escapeRegExp,
  formatFileSize,
  formatLogTime,
  formatRelativeTime,
} from "@/lib/format";

describe("formatFileSize", () => {
  it("formats bytes, kilobytes and megabytes", () => {
    expect(formatFileSize(0)).toBe("0 Б");
    expect(formatFileSize(1023)).toContain("Б");
    expect(formatFileSize(1024)).toContain("КБ");
    expect(formatFileSize(1024 * 1024)).toContain("МБ");
  });

  it("caps at megabytes", () => {
    expect(formatFileSize(5 * 1024 * 1024 * 1024)).toBe("5120 МБ");
  });
});

describe("formatRelativeTime", () => {
  it("formats past timestamps", () => {
    const now = Date.now();

    expect(formatRelativeTime(now - 5_000)).toBe("только что");
    expect(formatRelativeTime(now - 5 * 60_000)).toContain("минут");
    expect(formatRelativeTime(now - 3 * 3_600_000)).toContain("час");
  });

  it("formats 1 day as вчера", () => {
    const now = Date.now();

    expect(formatRelativeTime(now - 86_400_000)).toBe("вчера");
  });

  it("formats 2..6 days as a weekday name", () => {
    const now = Date.now();

    for (const days of [2, 3, 4, 5, 6]) {
      expect(formatRelativeTime(now - days * 86_400_000)).toMatch(
        /^(в|во) [а-я]+$/
      );
    }
  });

  it("formats 7+ days as a date", () => {
    const now = Date.now();
    const sevenDays = now - 7 * 86_400_000;

    expect(formatRelativeTime(sevenDays)).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });
});

describe("formatLogTime", () => {
  it("returns time in HH:MM:SS.mmm form", () => {
    const value = formatLogTime(Date.UTC(2026, 0, 1, 12, 34, 56, 789));

    expect(value).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
  });
});

describe("escapeRegExp", () => {
  it("escapes metacharacters", () => {
    expect(escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
  });

  it("produces a pattern that matches literally", () => {
    const pattern = new RegExp(escapeRegExp("file (1).bat"));

    expect(pattern.test("file (1).bat")).toBe(true);
    expect(pattern.test("file 1.bat")).toBe(false);
  });
});
