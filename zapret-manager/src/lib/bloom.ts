import {
  BLOOM_COLOR_VARS,
  BLOOM_INTENSITY,
  rgbVar,
  type BloomProfile,
} from "@/lib/postProcessingTokens";
import type { BloomColor, EffectIntensity } from "@/types/appearance";

function isOff(intensity: EffectIntensity): boolean {
  return intensity === "off";
}

function formatLayers(color: BloomColor, profile: BloomProfile): string {
  return profile.layers
    .map((layer) => `0 0 ${layer.blur}px ${rgbVar(color, layer.alpha)}`)
    .join(", ");
}

export function getBloomShadow(
  color: BloomColor,
  intensity: EffectIntensity
): string {
  if (isOff(intensity)) {
    return "";
  }

  return formatLayers(color, BLOOM_INTENSITY[intensity]);
}

export function getBloomShadowHover(
  color: BloomColor,
  intensity: EffectIntensity
): string {
  if (isOff(intensity)) {
    return "";
  }

  const next: EffectIntensity =
    intensity === "subtle"
      ? "normal"
      : intensity === "normal"
        ? "strong"
        : "strong";

  return getBloomShadow(color, next);
}

export function getBloomFilter(
  color: BloomColor,
  intensity: EffectIntensity
): string {
  if (isOff(intensity)) {
    return "";
  }

  const { layers } = BLOOM_INTENSITY[intensity];
  const [first, second] = layers;

  return `drop-shadow(0 0 ${first.blur / 2}px ${rgbVar(color, first.alpha * 1.4)}) drop-shadow(0 0 ${second.blur}px ${rgbVar(color, second.alpha)})`;
}

export function getTextGlow(
  color: BloomColor,
  intensity: EffectIntensity
): string {
  if (isOff(intensity)) {
    return "";
  }

  const { layers } = BLOOM_INTENSITY[intensity];
  const [first, second] = layers;

  return `0 0 ${first.blur / 2}px ${rgbVar(color, first.alpha)}, 0 0 ${second.blur}px ${rgbVar(color, second.alpha)}`;
}

export function getGlowBorder(
  color: BloomColor,
  intensity: EffectIntensity
): string {
  if (isOff(intensity)) {
    return "transparent";
  }

  return `var(${BLOOM_COLOR_VARS[color]})`;
}
