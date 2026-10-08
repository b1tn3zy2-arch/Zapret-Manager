import { useMemo } from "react";

import { usePostProcessing } from "@/contexts/postProcessing";
import { getChromaticFilter } from "@/lib/chromatic";
import type { EffectIntensity } from "@/types/appearance";

export interface ChromaticStyles {
  filter: string;
  isEnabled: boolean;
}

const EMPTY: ChromaticStyles = { filter: "", isEnabled: false };

export function useChromatic(
  enabled: boolean,
  intensity: EffectIntensity = "normal"
): ChromaticStyles {
  const { chromaticAberration } = usePostProcessing();

  return useMemo(() => {
    if (!enabled || !chromaticAberration) {
      return EMPTY;
    }

    return { filter: getChromaticFilter(intensity), isEnabled: true };
  }, [enabled, chromaticAberration, intensity]);
}
