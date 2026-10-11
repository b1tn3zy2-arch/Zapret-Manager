import { useMemo } from "react";

import AnimatedGrain from "@/components/shared/AnimatedGrain";
import { usePostProcessing } from "@/contexts/postProcessing";
import { GRAIN_OPACITY, SCANLINE_OPACITY } from "@/lib/postProcessingTokens";
import {
  getScanlineBackground,
  getVignetteGradient,
  isVignetteVisible,
} from "@/lib/vignette";
import { POST_PROCESSING_LAYER_Z } from "@/lib/constants";

function PostProcessingLayer() {
  const { vignette, settings, decorationsAllowed } = usePostProcessing();

  const grainOpacity = useMemo(
    () => (decorationsAllowed && settings.filmGrain ? GRAIN_OPACITY.normal : 0),
    [decorationsAllowed, settings.filmGrain]
  );

  const scanlineOpacity = useMemo(
    () =>
      decorationsAllowed && settings.scanlines ? SCANLINE_OPACITY.normal : 0,
    [decorationsAllowed, settings.scanlines]
  );

  if (vignette === "off" && grainOpacity === 0 && scanlineOpacity === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: POST_PROCESSING_LAYER_Z }}
    >
      {isVignetteVisible(vignette) ? (
        <div
          className="absolute inset-0"
          style={{ background: getVignetteGradient(vignette) }}
        />
      ) : null}

      {scanlineOpacity > 0 ? (
        <div
          className="absolute inset-0"
          style={{ background: getScanlineBackground(scanlineOpacity) }}
        />
      ) : null}

      <AnimatedGrain opacity={grainOpacity} />
    </div>
  );
}

export default PostProcessingLayer;
