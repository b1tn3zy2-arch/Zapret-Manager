import { createContext, useContext } from "react";

import type {
  EffectIntensity,
  PostProcessingQuality,
  PostProcessingSettings,
} from "@/types/appearance";

export type DeviceQualityTier = "low" | "mid" | "high";

export interface PostProcessingContextValue {
  settings: PostProcessingSettings;
  intensity: EffectIntensity;
  bloom: EffectIntensity;
  vignette: EffectIntensity;
  decorationsAllowed: boolean;
  chromaticAberration: boolean;
  motionBlur: boolean;
  globalQuality: PostProcessingQuality;
  isReducedMotion: boolean;
  deviceTier: DeviceQualityTier;
}

const DISABLED_POST_PROCESSING: PostProcessingContextValue = {
  settings: {
    bloom: "off",
    vignette: "off",
    filmGrain: false,
    scanlines: false,
    chromaticAberration: false,
    motionBlur: false,
    globalQuality: "low",
  },
  intensity: "off",
  bloom: "off",
  vignette: "off",
  decorationsAllowed: false,
  chromaticAberration: false,
  motionBlur: false,
  globalQuality: "low",
  isReducedMotion: false,
  deviceTier: "mid",
};

export const PostProcessingContext =
  createContext<PostProcessingContextValue | null>(null);

export function usePostProcessing(): PostProcessingContextValue {
  return useContext(PostProcessingContext) ?? DISABLED_POST_PROCESSING;
}
