import type { CSSProperties } from "react";

import { CHROMATIC_OFFSET_PX } from "@/lib/postProcessingTokens";
import type { EffectIntensity } from "@/types/appearance";

const CHROMATIC_WARM = "255 0 80";
const CHROMATIC_COOL = "0 200 255";

export function getChromaticFilter(intensity: EffectIntensity): string {
  const offset = CHROMATIC_OFFSET_PX[intensity];

  if (offset === 0) {
    return "";
  }

  return `drop-shadow(${offset}px 0 0 rgb(${CHROMATIC_WARM} / 0.28)) drop-shadow(${-offset}px 0 0 rgb(${CHROMATIC_COOL} / 0.28))`;
}

export function getChromaticOverlay(intensity: EffectIntensity): CSSProperties {
  const offset = CHROMATIC_OFFSET_PX[intensity];

  if (offset === 0) {
    return {};
  }

  const spread = (6 + offset * 14).toFixed(0);
  const alpha = (0.04 + offset * 0.035).toFixed(3);
  const shift = (offset * 4).toFixed(1);

  return {
    boxShadow: `inset ${shift}px 0 ${spread}px rgb(${CHROMATIC_WARM} / ${alpha}), inset ${-Number(shift)}px 0 ${spread}px rgb(${CHROMATIC_COOL} / ${alpha})`,
    mixBlendMode: "screen",
  };
}
