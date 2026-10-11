import { useMemo } from "react";

import {
  getBloomFilter,
  getBloomShadow,
  getBloomShadowHover,
  getTextGlow,
} from "@/lib/bloom";
import { shiftIntensity } from "@/lib/postProcessingTokens";
import { usePostProcessing } from "@/contexts/postProcessing";
import type { BloomColor } from "@/types/appearance";

export interface BloomStyles {
  boxShadow: string;
  boxShadowHover: string;
  filter: string;
  textShadow: string;
}

const EMPTY: BloomStyles = {
  boxShadow: "",
  boxShadowHover: "",
  filter: "",
  textShadow: "",
};

export function useBloom(color: BloomColor, delta = 0): BloomStyles {
  const { bloom, globalQuality } = usePostProcessing();
  const intensity = shiftIntensity(bloom, delta);

  return useMemo(() => {
    if (intensity === "off") {
      return EMPTY;
    }

    const scale =
      globalQuality === "low" ? 0.6 : globalQuality === "medium" ? 0.85 : 1;
    const shadow = scaleShadow(getBloomShadow(color, intensity), scale);
    const shadowHover = scaleShadow(
      getBloomShadowHover(color, intensity),
      scale
    );

    return {
      boxShadow: shadow,
      boxShadowHover: shadowHover,
      filter: getBloomFilter(color, intensity),
      textShadow: getTextGlow(color, intensity),
    };
  }, [color, intensity, globalQuality]);
}

function scaleShadow(shadow: string, scale: number): string {
  if (shadow === "" || scale === 1) {
    return shadow;
  }

  return shadow.replace(/(\d+(?:\.\d+)?)px/g, (match) => {
    const value = Number.parseFloat(match);

    return `${(value * scale).toFixed(1)}px`;
  });
}
