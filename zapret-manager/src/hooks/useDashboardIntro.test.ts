// Импортируем зависимости из модуля @testing-library/react.
import { renderHook } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useDashboardIntro.
import { useDashboardIntro } from "@/hooks/useDashboardIntro";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useDashboardIntro", () => {
  // Обрабатываем конструкцию: it.
  it("проигрывает вступление только при первом открытии главной", () => {
    // Сохраняем пояснение разработчика: // Каскад появления блоков при каждом переключении режима вы…
    // Каскад появления блоков при каждом переключении режима выглядел как
    // Сохраняем пояснение разработчика: // рывок: поддерево пересоздавалось и анимация шла заново по…
    // рывок: поддерево пересоздавалось и анимация шла заново поверх
    // Сохраняем пояснение разработчика: // затухания. Флаг живёт в модуле, поэтому следующий mount г…
    // затухания. Флаг живёт в модуле, поэтому следующий mount главной
    // Сохраняем пояснение разработчика: // вступления не запускает.
    // вступления не запускает.
    // Обрабатываем конструкцию: const first = renderHook(() => useDashboardIntro()).
    const first = renderHook(() => useDashboardIntro());
    // Обрабатываем конструкцию: expect.
    expect(first.result.current).toBe(true);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const second = renderHook(() => useDashboardIntro()).
    const second = renderHook(() => useDashboardIntro());
    // Обрабатываем конструкцию: expect.
    expect(second.result.current).toBe(false);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const third = renderHook(() => useDashboardIntro()).
    const third = renderHook(() => useDashboardIntro());
    // Обрабатываем конструкцию: expect.
    expect(third.result.current).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
