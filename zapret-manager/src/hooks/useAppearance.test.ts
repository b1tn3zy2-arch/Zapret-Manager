// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useAppearance.
import { resolveTheme } from "@/hooks/useAppearance";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Объявляем функцию mockMatchMedia.
function mockMatchMedia(matches: boolean): void {
  // Обрабатываем конструкцию: vi.
  vi.stubGlobal(
    // Обрабатываем конструкцию: matchMedia.
    "matchMedia",
    // Обрабатываем конструкцию: vi.
    vi.fn().mockImplementation((query: string) => ({
      // Передаём поле matches в объект.
      matches,
      // Обрабатываем конструкцию: media.
      media: query,
      // Обрабатываем конструкцию: addEventListener.
      addEventListener: vi.fn(),
      // Обрабатываем конструкцию: removeEventListener.
      removeEventListener: vi.fn(),
      // Закрываем текущий блок.
    }))
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("resolveTheme", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: mockMatchMedia.
    mockMatchMedia(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает явную тему без учёта системы", () => {
    // Обрабатываем конструкцию: mockMatchMedia.
    mockMatchMedia(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(resolveTheme("dark")).toBe("dark");
    // Обрабатываем конструкцию: expect.
    expect(resolveTheme("light")).toBe("light");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("auto следует системной тёмной теме", () => {
    // Обрабатываем конструкцию: mockMatchMedia.
    mockMatchMedia(false);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(resolveTheme("auto")).toBe("dark");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("auto следует системной светлой теме", () => {
    // Обрабатываем конструкцию: mockMatchMedia.
    mockMatchMedia(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(resolveTheme("auto")).toBe("light");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("тема в сторе настроек", () => {
  // Обрабатываем конструкцию: it.
  it("по умолчанию тёмная", () => {
    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.appearance.theme).toBe("dark");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переключается на светлую", () => {
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateAppearance({ theme: "light" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useSettingsStore.getState().settings.appearance.theme).toBe("light");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.getState().updateAppearance({ theme: "dark" });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
