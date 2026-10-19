import { useMemo } from "react";

import { resolveTheme } from "@/hooks/useAppearance";
import { useDeviceTier, type DeviceTier } from "@/hooks/useDeviceTier";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import type { FlameIntensity, FlameSpeed } from "@/lib/flamePresets";
import { useSettingsStore } from "@/stores/useSettingsStore";

export interface FlameState {
  enabled: boolean;
  still: boolean;
  intensity: FlameIntensity;
  speed: FlameSpeed;
  chromatic: boolean;
  lightTheme: boolean;
  tier: DeviceTier;
}

export function useFlame(): FlameState {
  const flame = useSettingsStore((state) => state.settings.appearance.flame);
  const theme = useSettingsStore((state) => state.settings.appearance.theme);
  const animations = useSettingsStore(
    (state) => state.settings.appearance.animations
  );
  const tier = useDeviceTier();
  const prefersLight = useMediaQuery("(prefers-color-scheme: light)");
  const prefersReduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const lightTheme =
    theme === "auto" ? prefersLight : resolveTheme(theme) === "light";

  return useMemo(() => {
    const allowed = flame.enabled && (tier !== "low" || flame.forceOn);

    return {
      enabled: allowed,
      still: !animations || prefersReduced,
      intensity: flame.intensity,
      speed: flame.speed,
      chromatic: flame.chromatic,
      lightTheme,
      tier,
    };
  }, [animations, flame, lightTheme, prefersReduced, tier]);
}
