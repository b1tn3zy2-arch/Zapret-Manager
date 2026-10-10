import { invoke } from "@tauri-apps/api/core";
import { emit } from "@tauri-apps/api/event";
import { useCallback } from "react";
import {
  LayoutDashboard,
  ListTree,
  Play,
  Power,
  RefreshCw,
  ScrollText,
  Settings as SettingsIcon,
  Square,
} from "lucide-react";

import { Badge, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { CONNECTION_LABELS } from "@/lib/constants";
import { useTrayWindow } from "@/tray/useTrayWindow";
import { cn } from "@/lib/utils";
import {
  useActiveStrategy,
  useConnectionStatus,
  useLastStrategy,
} from "@/stores/selectors";
import { selectActiveConfig, useVpnStore } from "@/stores/useVpnStore";

interface RowProps {
  label: string;
  icon: typeof Play;
  onClick: () => void;
  tone?: "danger" | "primary";
}

function Row({ label, icon: Icon, onClick, tone }: RowProps) {
  const { hide } = useTrayWindow();

  return (
    <button
      type="button"
      onClick={() => {
        onClick();
        hide();
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left",
        "text-sm transition-colors duration-150 hover:bg-white/10",
        "focus-visible:ring-accent-primary focus-visible:ring-2 focus-visible:outline-none",
        tone === "danger"
          ? "text-accent-danger"
          : tone === "primary"
            ? "text-text-primary"
            : "text-text-secondary hover:text-text-primary"
      )}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={2} />
      {label}
    </button>
  );
}

export default function TrayMenuRoot() {
  const { t } = useI18n();
  const status = useConnectionStatus();
  const activeStrategy = useActiveStrategy();
  const lastStrategy = useLastStrategy();
  const activeVpn = useVpnStore(selectActiveConfig);
  const vpnState = useVpnStore((state) => state.status.state);

  const isRunning = status === "connected" || vpnState === "connected";
  const subject = activeVpn?.name ?? activeStrategy?.name ?? lastStrategy?.name;

  const navigate = useCallback((event: string): void => {
    void emit(event);
    void invoke("show_tray_window");
  }, []);

  const runLast = useCallback((): void => {
    void emit("tray-quick-run");
  }, []);

  const stop = useCallback((): void => {
    void emit("tray-stop-strategy");
  }, []);

  const checkUpdates = useCallback((): void => {
    void emit("tray-check-updates");
  }, []);

  const quit = useCallback((): void => {
    void invoke("quit_app").catch(() => undefined);
  }, []);

  return (
    <div className="border-glass-border bg-bg-primary/95 text-text-primary m-2 flex flex-col overflow-hidden rounded-xl border shadow-2xl backdrop-blur-xl">
      <header className="border-glass-border flex items-center gap-2.5 border-b px-3.5 py-3">
        <span
          aria-hidden="true"
          className={cn(
            "size-2.5 shrink-0 rounded-full",
            isRunning ? "bg-accent-success" : "bg-text-tertiary"
          )}
        />
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-text-primary text-sm font-semibold">
            Zapret Manager
          </span>
          <span className="text-text-tertiary truncate text-[11px]">
            {subject ?? t("dashboard.tray.disconnected")}
          </span>
        </div>
        <Badge variant={isRunning ? "success" : "neutral"} size="sm">
          {isRunning ? t("dashboard.tray.active") : CONNECTION_LABELS.disconnected}
        </Badge>
      </header>

      <nav className="flex flex-col gap-0.5 p-1.5">
        <Row
          label={t("dashboard.tray.run")}
          icon={Play}
          tone="primary"
          onClick={runLast}
        />
        <Row label={t("dashboard.tray.stop")} icon={Square} onClick={stop} />
      </nav>

      <div className="mx-3 border-t border-white/5" />

      <nav className="flex flex-col gap-0.5 p-1.5">
        <Row
          label={t("dashboard.tray.dashboard")}
          icon={LayoutDashboard}
          onClick={() => {
            navigate("navigate-dashboard");
          }}
        />
        <Row
          label={t("dashboard.tray.strategies")}
          icon={ListTree}
          onClick={() => {
            navigate("navigate-strategies");
          }}
        />
        <Row
          label={t("dashboard.tray.logs")}
          icon={ScrollText}
          onClick={() => {
            navigate("navigate-logs");
          }}
        />
        <Row
          label={t("dashboard.tray.settings")}
          icon={SettingsIcon}
          onClick={() => {
            navigate("navigate-settings");
          }}
        />
      </nav>

      <div className="mx-3 border-t border-white/5" />

      <nav className="flex flex-col gap-0.5 p-1.5">
        <Row
          label={t("dashboard.tray.checkUpdates")}
          icon={RefreshCw}
          onClick={checkUpdates}
        />
        <Row
          label={t("dashboard.tray.quit")}
          icon={Power}
          tone="danger"
          onClick={quit}
        />
      </nav>

      <Text variant="caption" size="sm" className="text-text-tertiary px-3.5 pb-3">
        {t("dashboard.tray.hint")}
      </Text>
    </div>
  );
}