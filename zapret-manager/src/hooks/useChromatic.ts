import { useMemo } from "react";

import { usePostProcessing } from "@/contexts/postProcessing";
import { CHROMATIC_OFFSET_PX } from "@/lib/postProcessingTokens";
import type { EffectIntensity } from "@/types/appearance";

export interface ChromaticStyles {
  /** Амплитуда перелива каймы в пикселях; сама анимация живёт в CSS. */
  amplitude: number;
  isEnabled: boolean;
}

const EMPTY: ChromaticStyles = { amplitude: 0, isEnabled: false };

export function useChromatic(
  enabled: boolean,
  intensity: EffectIntensity = "normal"
): ChromaticStyles {
  const { chromaticAberration } = usePostProcessing();

  return useMemo(() => {
    const offset = CHROMATIC_OFFSET_PX[intensity];

    if (!enabled || !chromaticAberration || offset === 0) {
      return EMPTY;
    }

    return { amplitude: offset, isEnabled: true };
  }, [enabled, chromaticAberration, intensity]);
}
