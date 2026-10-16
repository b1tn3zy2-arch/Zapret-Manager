import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useDashboardIntro } from "@/hooks/useDashboardIntro";

describe("useDashboardIntro", () => {
  it("проигрывает вступление только при первом открытии главной", () => {
    // Каскад появления блоков при каждом переключении режима выглядел как
    // рывок: поддерево пересоздавалось и анимация шла заново поверх
    // затухания. Флаг живёт в модуле, поэтому следующий mount главной
    // вступления не запускает.
    const first = renderHook(() => useDashboardIntro());
    expect(first.result.current).toBe(true);

    const second = renderHook(() => useDashboardIntro());
    expect(second.result.current).toBe(false);

    const third = renderHook(() => useDashboardIntro());
    expect(third.result.current).toBe(false);
  });
});
