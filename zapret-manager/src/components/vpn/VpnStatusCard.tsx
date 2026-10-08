import { Plug, Power, RefreshCw } from "lucide-react";

import { Badge, Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { formatBytes } from "@/lib/trafficUtils";
import { cn } from "@/lib/utils";
import {
  formatHandshakeTime,
  formatUptime,
  formatVpnState,
} from "@/lib/vpnUtils";
import type { VpnStatus } from "@/types";

export interface VpnStatusCardProps {
  status: VpnStatus;
  isSwitching: boolean;
  hasConfig: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onSwitchToDpi: () => void;
}

const STATE_VARIANTS = {
  connected: "success",
  connecting: "warning",
  disconnecting: "warning",
  error: "error",
  disconnected: "neutral",
} as const;

function VpnStatusCard({
  status,
  isSwitching,
  hasConfig,
  onConnect,
  onDisconnect,
  onSwitchToDpi,
}: VpnStatusCardProps) {
  const { t } = useI18n();
  const connected = status.state === "connected";

  return (
    <div className="border-glass-border flex flex-col gap-3 rounded-lg border bg-white/5 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <Badge variant={STATE_VARIANTS[status.state]}>
          {formatVpnState(status.state, t)}
        </Badge>

        {status.endpoint !== null && status.endpoint !== "" ? (
          <span className="text-text-secondary truncate font-mono text-xs">
            {status.endpoint}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <Metric
          label={t("settings.vpn.handshake")}
          value={formatHandshakeTime(status.handshakeAt, t)}
        />
        <Metric
          label={t("settings.vpn.bytesIn")}
          value={formatBytes(status.bytesIn ?? 0)}
        />
        <Metric
          label={t("settings.vpn.bytesOut")}
          value={formatBytes(status.bytesOut ?? 0)}
        />
        <Metric
          label={t("settings.vpn.uptime")}
          value={formatUptime(status.uptimeSec)}
        />
      </div>

      {status.error !== null && status.error !== "" ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          {status.error}
        </Text>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={connected ? "secondary" : "primary"}
          disabled={isSwitching || !hasConfig || connected}
          onClick={onConnect}
          icon={<Plug aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.connected")}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          disabled={isSwitching || !connected}
          onClick={onDisconnect}
          icon={<Power aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.disconnect")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={isSwitching || !connected}
          onClick={onSwitchToDpi}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("settings.vpn.switchToDpi")}
        </Button>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-text-tertiary">{label}</span>
      <span className={cn("text-text-primary font-mono")}>{value}</span>
    </div>
  );
}

export default VpnStatusCard;
