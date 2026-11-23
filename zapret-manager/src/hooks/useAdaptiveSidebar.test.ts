// Импортируем зависимости из модуля @testing-library/react.
import { act, renderHook } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useAdaptiveSidebar.
import { useAdaptiveSidebar } from "@/hooks/useAdaptiveSidebar";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// — разделитель логических блоков —

// Объявляем функцию setWidth.
function setWidth(width: number): void {
  // Обрабатываем конструкцию: Object.
  Object.defineProperty(window, "innerWidth", {
    // Обрабатываем конструкцию: value.
    value: width,
    // Обрабатываем конструкцию: configurable.
    configurable: true,
    // Обрабатываем конструкцию: writable.
    writable: true,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useAdaptiveSidebar", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.setState({ sidebarCollapsed: false });
    // Обрабатываем конструкцию: setWidth.
    setWidth(1280);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("определяет текущий breakpoint", () => {
    // Обрабатываем конструкцию: setWidth.
    setWidth(1000);
    // Обрабатываем конструкцию: const { result } = renderHook(() => useAdaptiveSidebar(….
    const { result } = renderHook(() => useAdaptiveSidebar());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.breakpoint).toBe("md");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("автоматически сворачивает сайдбар ниже lg", () => {
    // Обрабатываем конструкцию: setWidth.
    setWidth(800);
    // Обрабатываем конструкцию: const { result } = renderHook(() => useAdaptiveSidebar(….
    const { result } = renderHook(() => useAdaptiveSidebar());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.isCollapsed).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("автоматически разворачивает сайдбар от xl", () => {
    // Обрабатываем конструкцию: useAppStore.
    useAppStore.setState({ sidebarCollapsed: true });
    // Обрабатываем конструкцию: setWidth.
    setWidth(1440);
    // Обрабатываем конструкцию: const { result } = renderHook(() => useAdaptiveSidebar(….
    const { result } = renderHook(() => useAdaptiveSidebar());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.isCollapsed).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ручное переключение меняет состояние", () => {
    // Обрабатываем конструкцию: setWidth.
    setWidth(1440);
    // Обрабатываем конструкцию: const { result } = renderHook(() => useAdaptiveSidebar(….
    const { result } = renderHook(() => useAdaptiveSidebar());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: act.
    act(() => {
      // Обрабатываем конструкцию: result.
      result.current.toggle();
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.isCollapsed).toBe(true);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
