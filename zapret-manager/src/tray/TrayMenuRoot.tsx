import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import {
  Info,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  Play,
  RefreshCw,
  ScrollText,
  Settings as SettingsIcon,
  Square,
  Unlock,
} from "lucide-react";

import { Badge } from "@/components/ui";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";
import "@/styles/tray-menu.css";

type MenuAction =
  | "run"
  | "stop"
  | "vpn-connect"
  | "vpn-disconnect"
  | "dashboard"
  | "strategies"
  | "logs"
  | "settings"
  | "about"
  | "updates"
  | "quit";

interface TraySnapshot {
  state: string;
  activeStrategy: string | null;
  vpnName: string | null;
}

interface MenuRowProps {
  label: string;
  icon: typeof Play;
  action: MenuAction;
}

function MenuRow({ label, icon: Icon, action }: MenuRowProps) {
  return (
    <button
      type="button"
      onClick={() => {
        void invoke("tray_menu_action", { action });
      }}
      className={cn(
        "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
        "text-text-secondary hover:text-text-primary text-[13px]",
        "hover:bg-glass-hover transition-colors duration-100"
      )}
    >
      <Icon
        aria-hidden="true"
        className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
        strokeWidth={2}
      />
      <span className="truncate">{label}</span>
    </button>
  );
}

function Separator() {
  return <div className="bg-glass-border my-1 h-px" />;
}

export default function TrayMenuRoot() {
  const { t } = useI18n();
  const [snapshot, setSnapshot] = useState<TraySnapshot | null>(null);
  const [corner, setCorner] = useState("top-right");
  const [animationKey, setAnimationKey] = useState(0);
  const blurTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    void invoke("tray_menu_ready").catch(() => undefined);

    const unlisteners: (() => void)[] = [];

    void listen<TraySnapshot>("tray-menu-open", (event) => {
      setSnapshot(event.payload);
      setAnimationKey((value) => value + 1);
    }).then((stop) => {
      unlisteners.push(stop);
    });

    void listen<string>("tray-menu-corner", (event) => {
      setCorner(event.payload);
    }).then((stop) => {
      unlisteners.push(stop);
    });

    void invoke<TraySnapshot>("tray_menu_snapshot")
      .then((value) => {
        setSnapshot(value);
      })
      .catch(() => undefined);

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        void invoke("tray_menu_hide").catch(() => undefined);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);

      for (const stop of unlisteners) {
        stop();
      }
    };
  }, []);

  useEffect(() => {
    const appWindow = getCurrentWindow();

    void appWindow
      .onFocusChanged((event) => {
        if (event.payload) {
          if (blurTimer.current !== undefined) {
            window.clearTimeout(blurTimer.current);
            blurTimer.current = undefined;
          }

          return;
        }

        if (blurTimer.current !== undefined) {
          return;
        }

        blurTimer.current = window.setTimeout(() => {
          blurTimer.current = undefined;
          void invoke("tray_menu_hide").catch(() => undefined);
        }, 50);
      })
      .then((stop) => stop());

    return () => {
      if (blurTimer.current !== undefined) {
        window.clearTimeout(blurTimer.current);
      }
    };
  }, []);

  const isActive = snapshot?.state === "connected" || snapshot?.state === "vpn";
  const isVpn = snapshot?.state === "vpn";
  const subject = snapshot?.vpnName ?? snapshot?.activeStrategy ?? null;
  const vpnAction = useCallback((): void => {
    void invoke("tray_menu_action", {
      action: isVpn ? "vpn-disconnect" : "vpn-connect",
    });
  }, [isVpn]);

  const frameRef = useRef<HTMLDivElement | null>(null);
  const shellRef = useRef<HTMLDivElement | null>(null);

  // Окно трея фиксированного размера, а пункт «Выход» находится в самом низу
  // списка. Без передачи реальной высоты контента он просто обрезался и не
  // нажимался.
  //
  // Замер идёт через ResizeObserver, а не по rAF или useEffect: список меняется
  // асинхронно (статус стратегии, VPN-строка приходит событием трея), и замер
  // по кадрам успевал отставать на кадр — окно оставалось на 8-23 px ниже
  // нужного, то есть «Выход» снова уходил под край.
  useEffect(() => {
    const frame = frameRef.current;
    const shell = shellRef.current;

    if (frame === null || shell === null) {
      return;
    }

    const report = () => {
      const paddingBottom =
        Number.parseFloat(getComputedStyle(frame).paddingBottom) || 0;
      const height = Math.ceil(
        shell.getBoundingClientRect().bottom -
          frame.getBoundingClientRect().top +
          paddingBottom
      );

      if (height > 0) {
        void invoke("tray_menu_set_height", { height }).catch(() => undefined);
      }
    };

    const observer = new ResizeObserver(report);

    observer.observe(shell);

    // ResizeObserver не реагирует на трансформации, поэтому после входной
    // анимации (масштаб оболочки) размер пересчитывается ещё раз
    shell.addEventListener("animationend", report);
    report();

    return () => {
      observer.disconnect();
      shell.removeEventListener("animationend", report);
    };
  }, [snapshot, isActive, isVpn]);

  return (
    <>
      <div ref={frameRef} className="flex h-full w-full items-start p-2">
        <div
          ref={shellRef}
          key={animationKey}
          data-corner={corner}
          className={cn(
            "tray-menu-shell border-glass-border bg-bg-secondary/95 flex w-full flex-col",
            "rounded-lg border p-1.5 shadow-2xl backdrop-blur-xl"
          )}
        >
          <header className="flex items-center gap-2 px-2 py-1.5">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                isActive ? "bg-accent-success" : "bg-text-tertiary"
              )}
            />

            <span className="text-text-primary min-w-0 flex-1 truncate text-xs font-semibold">
              Zapret
            </span>

            <Badge variant={isActive ? "success" : "neutral"} size="sm">
              {isActive
                ? (subject ?? t("dashboard.tray.active"))
                : t("dashboard.tray.disconnected")}
            </Badge>
          </header>

          <Separator />

          <MenuRow label={t("dashboard.tray.run")} icon={Play} action="run" />
          <MenuRow
            label={t("dashboard.tray.stop")}
            icon={Square}
            action="stop"
          />
          <button
            type="button"
            onClick={vpnAction}
            className={cn(
              "group flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left",
              "text-text-secondary hover:text-text-primary text-[13px]",
              "hover:bg-glass-hover transition-colors duration-100"
            )}
          >
            {isVpn ? (
              <Unlock
                aria-hidden="true"
                className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
                strokeWidth={2}
              />
            ) : (
              <Lock
                aria-hidden="true"
                className="text-text-tertiary group-hover:text-text-primary size-3.5 shrink-0"
                strokeWidth={2}
              />
            )}
            <span className="truncate">
              {isVpn
                ? t("dashboard.tray.vpnDisconnect")
                : t("dashboard.tray.vpnConnect")}
            </span>
          </button>

          <Separator />

          <MenuRow
            label={t("dashboard.tray.dashboard")}
            icon={LayoutDashboard}
            action="dashboard"
          />
          <MenuRow
            label={t("dashboard.tray.strategies")}
            icon={Layers}
            action="strategies"
          />
          <MenuRow
            label={t("dashboard.tray.logs")}
            icon={ScrollText}
            action="logs"
          />
          <MenuRow
            label={t("dashboard.tray.settings")}
            icon={SettingsIcon}
            action="settings"
          />
          <MenuRow
            label={t("dashboard.tray.about")}
            icon={Info}
            action="about"
          />

          <Separator />

          <MenuRow
            label={t("dashboard.tray.checkUpdates")}
            icon={RefreshCw}
            action="updates"
          />

          <Separator />

          <MenuRow
            label={t("dashboard.tray.quit")}
            icon={LogOut}
            action="quit"
          />
        </div>
      </div>
    </>
  );
}
