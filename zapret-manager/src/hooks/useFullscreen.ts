import { useCallback, useEffect, useRef, useState } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";

export interface UseFullscreenResult {
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exitFullscreen: () => void;
}

function hasOpenModal(): boolean {
  return document.querySelector('[role="dialog"]') !== null;
}

export function useFullscreen(): UseFullscreenResult {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isFullscreenRef = useRef(isFullscreen);

  useEffect(() => {
    isFullscreenRef.current = isFullscreen;
  }, [isFullscreen]);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlisten: UnlistenFn | undefined;
    let disposed = false;

    const sync = () => {
      void appWindow.isFullscreen().then((value) => {
        if (!disposed) {
          isFullscreenRef.current = value;
          setIsFullscreen(value);
        }
      });
    };

    sync();

    void appWindow.onResized(sync).then((stopListening) => {
      if (disposed) {
        stopListening();
        return;
      }
      unlisten = stopListening;
    });

    return () => {
      disposed = true;
      unlisten?.();
    };
  }, []);

  const toggleFullscreen = useCallback(() => {
    const appWindow = getCurrentWindow();
    void appWindow.isFullscreen().then((current) => {
      void appWindow.setFullscreen(!current);
    });
  }, []);

  const exitFullscreen = useCallback(() => {
    void getCurrentWindow().setFullscreen(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F11") {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      if (
        event.key !== "Escape" ||
        !isFullscreenRef.current ||
        hasOpenModal()
      ) {
        return;
      }

      event.preventDefault();
      exitFullscreen();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [exitFullscreen, toggleFullscreen]);

  return { isFullscreen, toggleFullscreen, exitFullscreen };
}
