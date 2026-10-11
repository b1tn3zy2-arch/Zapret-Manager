import { useEffect } from "react";

import { DENSITY_SCALE } from "@/lib/settingsConstants";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { DensityMode, ThemeMode } from "@/types";

export function resolveTheme(theme: ThemeMode): "dark" | "light" {
  if (theme !== "auto") {
    return theme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

function applyTheme(theme: ThemeMode): void {
  document.documentElement.dataset.theme = resolveTheme(theme);
}

function applyDensity(density: DensityMode): void {
  const root = document.documentElement;
  root.dataset.density = density;
  root.style.setProperty("--density-scale", String(DENSITY_SCALE[density]));
}

function applyMotion(animations: boolean): void {
  document.documentElement.dataset.animations = animations ? "on" : "off";
}

export function useAppearance(): void {
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const density = useSettingsStore(
    (state) => state.settings.appearance.density
  );
  const animations = useSettingsStore(
    (state) => state.settings.appearance.animations
  );
  useEffect(() => {
    applyTheme(theme);

    if (theme !== "auto") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: light)");
    const listener = (): void => {
      applyTheme("auto");
    };

    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [theme]);

  useEffect(() => {
    applyDensity(density);
  }, [density]);

  useEffect(() => {
    applyMotion(animations);
  }, [animations]);
}
