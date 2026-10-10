import { formatBytes } from "@/lib/trafficUtils";
import { formatHandshakeTime, formatUptime } from "@/lib/vpnUtils";
import { useI18n } from "@/i18n";
import type { VpnStatus } from "@/types";

export interface VpnFooterProps {
  status: VpnStatus;
}

export default function VpnFooter({ status }: VpnFooterProps) {
  const { t } = useI18n();

  return (
    <div className="text-text-tertiary grid grid-cols-3 items-center gap-3 border-t border-white/5 pt-3 text-center font-mono text-[11px]">
      <span>
        {t("dashboard.vpn.traffic")}: {formatBytes(status.bytesIn ?? 0)} ↓{" "}
        {formatBytes(status.bytesOut ?? 0)} ↑
      </span>
      <span>
        {t("dashboard.vpn.uptime")}: {formatUptime(status.uptimeSec)}
      </span>
      <span>
        {t("dashboard.vpn.handshake")}:{" "}
        {formatHandshakeTime(status.handshakeAt, t)}
      </span>
    </div>
  );
}
