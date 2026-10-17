import { useMemo } from "react";

import AnimatedGrain from "@/components/shared/AnimatedGrain";
import { usePostProcessing } from "@/contexts/postProcessing";
import { CHROMATIC_OFFSET_PX } from "@/lib/postProcessingTokens";
import { GRAIN_OPACITY, SCANLINE_OPACITY } from "@/lib/postProcessingTokens";
import {
  getScanlineBackground,
  getVignetteGradient,
  isVignetteVisible,
} from "@/lib/vignette";
import { POST_PROCESSING_LAYER_Z } from "@/lib/constants";

function PostProcessingLayer() {
  const {
    vignette,
    intensity,
    settings,
    decorationsAllowed,
    chromaticAberration,
    globalQuality,
  } = usePostProcessing();

  const qualityScale = globalQuality === "high" ? 1 : 0.75;
  // Амплитуда каймы по краям окна задаётся настройкой интенсивности,
  // сама анимация — в CSS (класс .app-chromatic).
  const chromaticOffset = CHROMATIC_OFFSET_PX[intensity] || 1;
  const chromaticStyle = {
    "--chromatic-strength": chromaticOffset.toFixed(2),
  } as React.CSSProperties;

  const grainOpacity = useMemo(
    () =>
      decorationsAllowed && settings.filmGrain
        ? GRAIN_OPACITY.normal * qualityScale
        : 0,
    [decorationsAllowed, qualityScale, settings.filmGrain]
  );

  const scanlineOpacity = useMemo(
    () =>
      decorationsAllowed && settings.scanlines
        ? SCANLINE_OPACITY.normal * qualityScale
        : 0,
    [decorationsAllowed, qualityScale, settings.scanlines]
  );

  if (
    vignette === "off" &&
    grainOpacity === 0 &&
    scanlineOpacity === 0 &&
    !chromaticAberration
  ) {
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

      {chromaticAberration ? (
        <div
          className="app-chromatic absolute inset-0"
          style={chromaticStyle}
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
