import { useState } from "react";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export type DeviceTier = "low" | "mid" | "high";

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

let cachedTier: DeviceTier | null = null;
let cachedBackdropFilter: boolean | null = null;

function supportsBackdropFilter(): boolean {
  cachedBackdropFilter ??=
    typeof CSS !== "undefined" &&
    typeof CSS.supports === "function" &&
    CSS.supports("backdrop-filter", "blur(1px)");

  return cachedBackdropFilter;
}

function detectTier(): DeviceTier {
  if (typeof navigator === "undefined" || typeof window === "undefined") {
    return "mid";
  }

  if (!supportsBackdropFilter()) {
    return "low";
  }

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as NavigatorWithMemory).deviceMemory;
  const pixels = window.screen.width * window.screen.height;

  const memoryScore = memory === undefined ? 0 : memory * 2;
  const score = cores + memoryScore + (pixels > 3_000_000 ? 2 : 0);

  if (cores <= 4 || (memory !== undefined && memory <= 2) || score <= 10) {
    return "low";
  }

  if (cores <= 8 || (memory !== undefined && memory <= 8) || score <= 20) {
    return "mid";
  }

  return "high";
}

function getDeviceTier(): DeviceTier {
  cachedTier ??= detectTier();

  return cachedTier;
}

export function useDeviceTier(): DeviceTier {
  const [tier] = useState<DeviceTier>(() => getDeviceTier());

  return tier;
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
