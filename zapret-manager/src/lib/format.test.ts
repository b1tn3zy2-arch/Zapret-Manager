// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/format.
import {
  // Подключаем именованный импорт escapeRegExp.
  escapeRegExp,
  // Подключаем именованный импорт formatFileSize.
  formatFileSize,
  // Подключаем именованный импорт formatLogTime.
  formatLogTime,
  // Подключаем именованный импорт formatRelativeTime.
  formatRelativeTime,
  // Закрываем текущий блок.
} from "@/lib/format";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatFileSize", () => {
  // Обрабатываем конструкцию: it.
  it("formats bytes, kilobytes and megabytes", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatFileSize(0)).toBe("0 Б");
    // Обрабатываем конструкцию: expect.
    expect(formatFileSize(1023)).toContain("Б");
    // Обрабатываем конструкцию: expect.
    expect(formatFileSize(1024)).toContain("КБ");
    // Обрабатываем конструкцию: expect.
    expect(formatFileSize(1024 * 1024)).toContain("МБ");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("caps at megabytes", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatFileSize(5 * 1024 * 1024 * 1024)).toBe("5120 МБ");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatRelativeTime", () => {
  // Обрабатываем конструкцию: it.
  it("formats past timestamps", () => {
    // Обрабатываем конструкцию: const now = Date.now().
    const now = Date.now();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(formatRelativeTime(now - 5_000)).toBe("только что");
    // Обрабатываем конструкцию: expect.
    expect(formatRelativeTime(now - 5 * 60_000)).toContain("минут");
    // Обрабатываем конструкцию: expect.
    expect(formatRelativeTime(now - 3 * 3_600_000)).toContain("час");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("formats 1 day as вчера", () => {
    // Обрабатываем конструкцию: const now = Date.now().
    const now = Date.now();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(formatRelativeTime(now - 86_400_000)).toBe("вчера");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("formats 2..6 days as a weekday name", () => {
    // Обрабатываем конструкцию: const now = Date.now().
    const now = Date.now();
    // — разделитель логических блоков —

    // Перебираем элементы коллекции [2, 3, 4, 5, 6].
    for (const days of [2, 3, 4, 5, 6]) {
      // Обрабатываем конструкцию: expect.
      expect(formatRelativeTime(now - days * 86_400_000)).toMatch(
        // Обрабатываем конструкцию: /^(в|во) [а-я]+$/.
        /^(в|во) [а-я]+$/
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("formats 7+ days as a date", () => {
    // Обрабатываем конструкцию: const now = Date.now().
    const now = Date.now();
    // Обрабатываем конструкцию: const sevenDays = now - 7 * 86_400_000.
    const sevenDays = now - 7 * 86_400_000;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(formatRelativeTime(sevenDays)).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatLogTime", () => {
  // Обрабатываем конструкцию: it.
  it("returns time in HH:MM:SS.mmm form", () => {
    // Обрабатываем конструкцию: const value = formatLogTime(Date.UTC(2026, 0, 1, 12, 34….
    const value = formatLogTime(Date.UTC(2026, 0, 1, 12, 34, 56, 789));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(value).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3}$/);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("escapeRegExp", () => {
  // Обрабатываем конструкцию: it.
  it("escapes metacharacters", () => {
    // Обрабатываем конструкцию: expect.
    expect(escapeRegExp("a.b*c")).toBe("a\\.b\\*c");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("produces a pattern that matches literally", () => {
    // Обрабатываем конструкцию: const pattern = new RegExp(escapeRegExp(file (1).bat)).
    const pattern = new RegExp(escapeRegExp("file (1).bat"));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pattern.test("file (1).bat")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(pattern.test("file 1.bat")).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
