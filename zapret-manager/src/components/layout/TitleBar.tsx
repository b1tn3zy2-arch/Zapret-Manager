import { useCallback, useEffect, useState } from "react";
import type { UnlistenFn } from "@tauri-apps/api/event";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Copy,
  Maximize2,
  Minimize2,
  Minus,
  Shield,
  Square,
  X,
} from "lucide-react";

import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n";
import { useAppStore } from "@/stores/useAppStore";

import ModeBadge from "./ModeBadge";

const CONTROL_BUTTON_CLASS =
  "flex size-8 shrink-0 items-center justify-center text-text-secondary transition-colors duration-200 ease-out hover:bg-glass-hover hover:text-text-primary";

export interface TitleBarProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export default function TitleBar({
  isFullscreen,
  onToggleFullscreen,
}: TitleBarProps) {
  const [maximized, setMaximized] = useState(false);
  const setActivePage = useAppStore((state) => state.setActivePage);
  const { t } = useI18n();

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlisten: UnlistenFn | undefined;
    let disposed = false;

    const syncMaximized = () => {
      void appWindow.isMaximized().then((value) => {
        if (!disposed) {
          setMaximized(value);
        }
      });
    };

    syncMaximized();

    void appWindow.onResized(syncMaximized).then((stopListening) => {
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

  const minimize = useCallback(() => {
    void getCurrentWindow().minimize();
  }, []);

  const toggleMaximize = useCallback(() => {
    void getCurrentWindow().toggleMaximize();
  }, []);

  const close = useCallback(() => {
    void getCurrentWindow().close();
  }, []);

  const MaximizeIcon = maximized ? Copy : Square;
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <header
      data-tauri-drag-region
      className="border-glass-border flex shrink-0 items-center justify-between border-b"
      style={{ height: "var(--titlebar-height)" }}
    >
      <div data-tauri-drag-region className="flex items-center gap-2 pr-2 pl-3">
        <Shield
          aria-hidden="true"
          className="text-accent-primary size-5"
          strokeWidth={2}
        />
        <span
          data-tauri-drag-region
          className="text-text-primary text-sm font-semibold tracking-tight"
        >
          {APP_NAME}
        </span>
      </div>

      <div data-tauri-drag-region className="h-full flex-1" />

      <div
        className={cn(
          "flex h-full items-center gap-1 pr-1",
          "[-webkit-app-region:no-drag] [app-region:no-drag]"
        )}
      >
        <ModeBadge
          onClick={() => {
            setActivePage(ROUTES.dashboard);
          }}
        />

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label={
            isFullscreen
              ? t("titleBar.exitFullscreen")
              : t("titleBar.fullscreen")
          }
          aria-pressed={isFullscreen}
          title={t("titleBar.fullscreenHint")}
          className={CONTROL_BUTTON_CLASS}
        >
          <FullscreenIcon
            aria-hidden="true"
            className="size-4"
            strokeWidth={2}
          />
        </button>
        <button
          type="button"
          onClick={minimize}
          aria-label={t("titleBar.minimize")}
          className={CONTROL_BUTTON_CLASS}
        >
          <Minus aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={toggleMaximize}
          aria-label={
            maximized ? t("titleBar.restore") : t("titleBar.maximize")
          }
          className={CONTROL_BUTTON_CLASS}
        >
          <MaximizeIcon aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
        <button
          type="button"
          onClick={close}
          aria-label={t("titleBar.close")}
          className={cn(
            CONTROL_BUTTON_CLASS,
            "hover:bg-accent-danger hover:text-white"
          )}
        >
          <X aria-hidden="true" className="size-4" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
