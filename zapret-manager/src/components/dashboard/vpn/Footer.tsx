import { formatUptime } from "@/lib/vpnUtils";
import { useI18n } from "@/i18n";
import type { XrayStatus } from "@/types";

export interface VpnFooterProps {
  status: XrayStatus | null;
}

export default function VpnFooter({ status }: VpnFooterProps) {
  const { t } = useI18n();
  const running = status?.running === true;

  return (
    <div className="text-text-tertiary border-glass-border grid grid-cols-3 items-center gap-3 border-t pt-3 text-center font-mono text-[11px]">
      <span>
        {t("dashboard.vpn.uptime")}:{" "}
        {running ? formatUptime(status?.uptimeSec ?? null) : "—"}
      </span>
      <span>
        SOCKS: {status?.socksPort ?? "—"} · HTTP: {status?.httpPort ?? "—"}
      </span>
      <span>PID: {running ? (status?.pid ?? "—") : "—"}</span>
    </div>
  );
}
