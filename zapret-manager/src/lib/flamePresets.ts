import { FLAME_MAX_EDGE_PX, FLAME_MIN_EDGE_PX } from "@/lib/constants";

export type FlameIntensity = "subtle" | "normal" | "strong";
export type FlameSpeed = "slow" | "normal" | "fast";

export interface FlamePresetValues {
  edgeWidthPx: number;
  alpha: number;
}

export const FLAME_PRESETS: Record<FlameIntensity, FlamePresetValues> = {
  subtle: { edgeWidthPx: 12, alpha: 0.35 },
  normal: { edgeWidthPx: 18, alpha: 0.55 },
  strong: { edgeWidthPx: 24, alpha: 0.75 },
};

export const FLAME_SPEEDS: Record<FlameSpeed, number> = {
  slow: 0.5,
  normal: 1,
  fast: 1.8,
};

export function clampEdgeWidth(edgeWidthPx: number): number {
  return Math.min(FLAME_MAX_EDGE_PX, Math.max(FLAME_MIN_EDGE_PX, edgeWidthPx));
}
