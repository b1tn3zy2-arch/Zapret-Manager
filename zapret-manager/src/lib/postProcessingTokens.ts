import type {
  BloomColor,
  EffectIntensity,
  PostProcessingQuality,
} from "@/types/appearance";

export interface BloomLayer {
  blur: number;
  alpha: number;
}

export interface BloomProfile {
  layers: readonly [BloomLayer, BloomLayer, BloomLayer];
}

export const BLOOM_COLOR_VARS: Record<BloomColor, string> = {
  primary: "--color-accent-primary-rgb",
  secondary: "--color-accent-secondary-rgb",
  danger: "--color-accent-danger-rgb",
  warning: "--color-accent-warning-rgb",
  neutral: "--color-text-primary-rgb",
};

export function rgbVar(color: BloomColor, alpha: number): string {
  return `rgb(var(${BLOOM_COLOR_VARS[color]} / ${alpha}))`;
}

export const QUALITY_DECORATION_ALLOWED: Record<
  PostProcessingQuality,
  boolean
> = {
  low: false,
  medium: true,
  high: true,
};

export const BLOOM_INTENSITY: Record<EffectIntensity, BloomProfile> = {
  off: {
    layers: [
      { blur: 0, alpha: 0 },
      { blur: 0, alpha: 0 },
      { blur: 0, alpha: 0 },
    ],
  },
  subtle: {
    layers: [
      { blur: 6, alpha: 0.18 },
      { blur: 14, alpha: 0.1 },
      { blur: 28, alpha: 0.05 },
    ],
  },
  normal: {
    layers: [
      { blur: 12, alpha: 0.32 },
      { blur: 24, alpha: 0.16 },
      { blur: 48, alpha: 0.08 },
    ],
  },
  strong: {
    layers: [
      { blur: 18, alpha: 0.46 },
      { blur: 36, alpha: 0.24 },
      { blur: 72, alpha: 0.12 },
    ],
  },
};

export const VIGNETTE_GRADIENTS: Record<EffectIntensity, string> = {
  off: "radial-gradient(ellipse at center, transparent 100%, transparent 100%)",
  subtle:
    "radial-gradient(ellipse 120% 120% at center, transparent 42%, rgb(0 0 0 / 0.26) 80%, rgb(0 0 0 / 0.44) 100%)",
  normal:
    "radial-gradient(ellipse 110% 110% at center, transparent 40%, rgb(0 0 0 / 0.3) 80%, rgb(0 0 0 / 0.5) 100%)",
  strong:
    "radial-gradient(ellipse 100% 100% at center, transparent 32%, rgb(0 0 0 / 0.45) 74%, rgb(0 0 0 / 0.72) 100%)",
};

export const CHROMATIC_OFFSET_PX: Record<EffectIntensity, number> = {
  off: 0,
  subtle: 0.6,
  normal: 1,
  strong: 1.8,
};

export const MOTION_BLUR_MAX_PX: Record<EffectIntensity, number> = {
  off: 0,
  subtle: 2,
  normal: 4,
  strong: 6,
};

export const SCANLINE_OPACITY: Record<EffectIntensity, number> = {
  off: 0,
  subtle: 0.03,
  normal: 0.05,
  strong: 0.08,
};

export const GRAIN_OPACITY: Record<EffectIntensity, number> = {
  off: 0,
  subtle: 0.03,
  normal: 0.05,
  strong: 0.08,
};
