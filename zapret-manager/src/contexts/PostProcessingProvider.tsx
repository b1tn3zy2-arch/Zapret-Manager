import { useMemo, type ReactNode } from "react";

import {
  PostProcessingContext,
  type DeviceQualityTier,
  type PostProcessingContextValue,
} from "@/contexts/postProcessing";
import { useDeviceTier, usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import { QUALITY_DECORATION_ALLOWED } from "@/lib/postProcessingTokens";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { PostProcessingQuality } from "@/types/appearance";

function resolveQuality(
  requested: PostProcessingQuality,
  deviceTier: DeviceQualityTier
): PostProcessingQuality {
  if (deviceTier === "low") {
    return "low";
  }

  if (requested === "high" && deviceTier === "mid") {
    return "medium";
  }

  return requested;
}

function PostProcessingProvider({ children }: { children: ReactNode }) {
  const settings = useSettingsStore(
    (state) => state.settings.appearance.postProcessing
  );
  const deviceTier = useDeviceTier();
  const isReducedMotion = usePrefersReducedMotion();

  const value = useMemo<PostProcessingContextValue>(() => {
    const globalQuality = resolveQuality(settings.globalQuality, deviceTier);
    const decorationsAllowed =
      QUALITY_DECORATION_ALLOWED[globalQuality] && !isReducedMotion;
    const bloom = isReducedMotion ? "off" : settings.bloom;

    return {
      settings,
      intensity: bloom,
      bloom,
      vignette: settings.vignette,
      decorationsAllowed,
      chromaticAberration: decorationsAllowed && settings.chromaticAberration,
      motionBlur: decorationsAllowed && settings.motionBlur,
      globalQuality,
      isReducedMotion,
      deviceTier,
    };
  }, [settings, deviceTier, isReducedMotion]);

  return (
    <PostProcessingContext.Provider value={value}>
      {children}
    </PostProcessingContext.Provider>
  );
}

export default PostProcessingProvider;
