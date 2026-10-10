import { getCurrentWindow } from "@tauri-apps/api/window";
import { useCallback, useEffect } from "react";

export function useTrayWindow(): { hide: () => void } {
  const hide = useCallback((): void => {
    void getCurrentWindow().hide();
  }, []);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    const pending = appWindow.onFocusChanged((event) => {
      if (!event.payload) {
        void appWindow.hide();
      }
    });

    return () => {
      void pending.then((stop) => {
        stop();
      });
    };
  }, []);

  return { hide };
}