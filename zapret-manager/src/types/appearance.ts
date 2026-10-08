export type EffectIntensity = "off" | "subtle" | "normal" | "strong";

export type BloomColor =
  "primary" | "secondary" | "danger" | "warning" | "neutral";

export type PostProcessingQuality = "low" | "medium" | "high";

export interface PostProcessingSettings {
  bloom: EffectIntensity;
  vignette: EffectIntensity;
  filmGrain: boolean;
  scanlines: boolean;
  chromaticAberration: boolean;
  motionBlur: boolean;
  globalQuality: PostProcessingQuality;
}
