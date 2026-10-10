import { invoke } from "@tauri-apps/api/core";
import { useEffect, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AnimatePresence, motion } from "framer-motion";
import {
  Layers,
  LayoutDashboard,
  LogOut,
  Play,
  RefreshCw,
  ScrollText,
  Settings as SettingsIcon,
  Square,
} from "lucide-react";

import { Badge } from "@/components/ui";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/utils";

type MenuAction =
  | "open"
  | "run"
  | "stop"
  | "dashboard"
  | "strategies"
  | "logs"
  | "settings"
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
        "transition-colors duration-100 hover:bg-white/10"
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
  const [openCount, setOpenCount] = useState(0);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    let unlisten: (() => void) | undefined;

    const refresh = (): void => {
      setOpenCount((value) => value + 1);
      void invoke<TraySnapshot>("tray_menu_snapshot")
        .then((value) => {
          setSnapshot(value);
        })
        .catch(() => undefined);
    };

    void appWindow.onFocusChanged((event) => {
      if (event.payload) {
        refresh();
        return;
      }

      void invoke("tray_menu_hide").catch(() => undefined);
    }).then((stop) => {
      unlisten = stop;
    });

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        void invoke("tray_menu_hide").catch(() => undefined);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlisten?.();
    };
  }, []);

  const isActive = snapshot?.state === "connected" || snapshot?.state === "vpn";
  const subject = snapshot?.vpnName ?? snapshot?.activeStrategy ?? null;

  return (
    <div className="flex h-full w-full p-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={openCount}
          initial={{ opacity: 0, scale: 0.96, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.08 } }}
          transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
          className="border-glass-border bg-bg-secondary/95 flex w-full flex-col rounded-lg border p-1.5 shadow-2xl backdrop-blur-xl"
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
              Zapret Manager
            </span>

            <Badge variant={isActive ? "success" : "neutral"} size="sm">
              {isActive
                ? (subject ?? t("dashboard.tray.active"))
                : t("dashboard.tray.disconnected")}
            </Badge>
          </header>

          <Separator />

          <MenuRow label={t("dashboard.tray.run")} icon={Play} action="run" />
          <MenuRow label={t("dashboard.tray.stop")} icon={Square} action="stop" />

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

          <Separator />

          <MenuRow
            label={t("dashboard.tray.checkUpdates")}
            icon={RefreshCw}
            action="updates"
          />

          <Separator />

          <MenuRow label={t("dashboard.tray.quit")} icon={LogOut} action="quit" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}