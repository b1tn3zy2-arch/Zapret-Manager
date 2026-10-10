import { beforeEach, describe, expect, it, vi } from "vitest";

import { resolveTheme } from "@/hooks/useAppearance";
import { useSettingsStore } from "@/stores/useSettingsStore";

function mockMatchMedia(matches: boolean): void {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }))
  );
}

describe("resolveTheme", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });

  it("возвращает явную тему без учёта системы", () => {
    mockMatchMedia(true);

    expect(resolveTheme("dark")).toBe("dark");
    expect(resolveTheme("light")).toBe("light");
  });

  it("auto следует системной тёмной теме", () => {
    mockMatchMedia(false);

    expect(resolveTheme("auto")).toBe("dark");
  });

  it("auto следует системной светлой теме", () => {
    mockMatchMedia(true);

    expect(resolveTheme("auto")).toBe("light");
  });
});

describe("тема в сторе настроек", () => {
  it("по умолчанию тёмная", () => {
    expect(useSettingsStore.getState().settings.appearance.theme).toBe("dark");
  });

  it("переключается на светлую", () => {
    useSettingsStore.getState().updateAppearance({ theme: "light" });

    expect(useSettingsStore.getState().settings.appearance.theme).toBe("light");

    useSettingsStore.getState().updateAppearance({ theme: "dark" });
  });
});
