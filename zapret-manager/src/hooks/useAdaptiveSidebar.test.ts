import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";

import { useAdaptiveSidebar } from "@/hooks/useAdaptiveSidebar";
import { useAppStore } from "@/stores/useAppStore";

function setWidth(width: number): void {
  Object.defineProperty(window, "innerWidth", {
    value: width,
    configurable: true,
    writable: true,
  });
}

describe("useAdaptiveSidebar", () => {
  beforeEach(() => {
    useAppStore.setState({ sidebarCollapsed: false });
    setWidth(1280);
  });

  it("определяет текущий breakpoint", () => {
    setWidth(1000);
    const { result } = renderHook(() => useAdaptiveSidebar());

    expect(result.current.breakpoint).toBe("md");
  });

  it("автоматически сворачивает сайдбар ниже lg", () => {
    setWidth(800);
    const { result } = renderHook(() => useAdaptiveSidebar());

    expect(result.current.isCollapsed).toBe(true);
  });

  it("автоматически разворачивает сайдбар от xl", () => {
    useAppStore.setState({ sidebarCollapsed: true });
    setWidth(1440);
    const { result } = renderHook(() => useAdaptiveSidebar());

    expect(result.current.isCollapsed).toBe(false);
  });

  it("ручное переключение меняет состояние", () => {
    setWidth(1440);
    const { result } = renderHook(() => useAdaptiveSidebar());

    act(() => {
      result.current.toggle();
    });

    expect(result.current.isCollapsed).toBe(true);
  });
});
