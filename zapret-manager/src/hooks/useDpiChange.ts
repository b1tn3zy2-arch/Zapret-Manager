import { useEffect, useState } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

function readScale(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  return window.devicePixelRatio || 1;
}

export function useDpiScale(): number {
  const [scale, setScale] = useState(readScale);

  useEffect(() => {
    let unlisten: UnlistenFn | undefined;
    let disposed = false;

    const appWindow = getCurrentWindow();

    void appWindow
      .onScaleChanged((event) => {
        if (!disposed) {
          setScale(event.payload.scaleFactor);
        }
      })
      .then((stopListening) => {
        if (disposed) {
          stopListening();
          return;
        }
        unlisten = stopListening;
      });

    const query = window.matchMedia(`(resolution: ${readScale()}dppx)`);
    const handleRatioChange = (): void => {
      setScale(readScale());
    };

    query.addEventListener("change", handleRatioChange);
    handleRatioChange();

    return () => {
      disposed = true;
      unlisten?.();
      query.removeEventListener("change", handleRatioChange);
    };
  }, []);

  return scale;
}
