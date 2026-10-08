import { useCallback, useState } from "react";

import { getBreakpoint, type Breakpoint } from "@/lib/breakpoints";
import { useWindowResize } from "@/hooks/useWindowResize";

export type Orientation = "portrait" | "landscape";

export interface ViewportState {
  width: number;
  height: number;
  devicePixelRatio: number;
  aspectRatio: number;
  breakpoint: Breakpoint;
  orientation: Orientation;
}

function readViewport(): ViewportState {
  if (typeof window === "undefined") {
    return {
      width: 0,
      height: 0,
      devicePixelRatio: 1,
      aspectRatio: 0,
      breakpoint: "xs",
      orientation: "landscape",
    };
  }

  const width = window.innerWidth;
  const height = window.innerHeight;

  return {
    width,
    height,
    devicePixelRatio: window.devicePixelRatio,
    aspectRatio: height === 0 ? 0 : width / height,
    breakpoint: getBreakpoint(width),
    orientation: height > width ? "portrait" : "landscape",
  };
}

export function useViewport(): ViewportState {
  const [state, setState] = useState<ViewportState>(readViewport);

  const sync = useCallback(() => {
    setState((previous) => {
      const next = readViewport();
      const unchanged =
        previous.width === next.width &&
        previous.height === next.height &&
        previous.devicePixelRatio === next.devicePixelRatio;

      return unchanged ? previous : next;
    });
  }, []);

  useWindowResize(sync);

  return state;
}
