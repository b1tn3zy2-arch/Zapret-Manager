import { useEffect } from "react";

import { VIEWPORT_THROTTLE_MS } from "@/lib/constants";

export function useWindowResize(
  callback: () => void,
  throttleMs: number = VIEWPORT_THROTTLE_MS
): void {
  useEffect(() => {
    let frame: number | null = null;
    let lastCall = 0;

    const run = (): void => {
      lastCall = Date.now();
      frame = null;
      callback();
    };

    const handle = (): void => {
      const now = Date.now();
      const wait = throttleMs - (now - lastCall);

      if (wait <= 0) {
        run();
        return;
      }

      if (frame === null) {
        frame = window.setTimeout(run, wait);
      }
    };

    window.addEventListener("resize", handle);

    return () => {
      window.removeEventListener("resize", handle);
      if (frame !== null) {
        window.clearTimeout(frame);
      }
    };
  }, [callback, throttleMs]);
}
