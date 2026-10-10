import { VIGNETTE_GRADIENTS } from "@/lib/postProcessingTokens";
import type { EffectIntensity } from "@/types/appearance";

export function getVignetteGradient(intensity: EffectIntensity): string {
  return VIGNETTE_GRADIENTS[intensity];
}

export function isVignetteVisible(intensity: EffectIntensity): boolean {
  return intensity !== "off";
}

export function getScanlineBackground(alpha: number): string {
  if (alpha <= 0) {
    return "none";
  }

  return `repeating-linear-gradient(0deg, transparent 0 2px, rgb(var(--color-text-primary-rgb) / ${alpha}) 2px 3px)`;
}
