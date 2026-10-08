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
