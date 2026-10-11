import { Badge, Button, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import StatusOrb from "@/components/dashboard/StatusOrb";
import { useI18n } from "@/i18n";
import type { TranslationKey } from "@/i18n/types";
import { CONNECTION_LABELS, type ConnectionStatus } from "@/lib/constants";

const HERO_STATUS = {
  connected: "dashboard.hero.connected",
  connecting: "dashboard.hero.connecting",
  disconnected: "dashboard.hero.disconnected",
  vpn: "dashboard.hero.vpn",
  error: "dashboard.hero.error",
} as const satisfies Record<ConnectionStatus, TranslationKey>;

const BADGE_VARIANT = {
  connected: "success",
  connecting: "warning",
  disconnected: "neutral",
  vpn: "accent",
  error: "error",
} as const;

export interface DashboardHeroProps {
  status: ConnectionStatus;
  strategyName: string | null;
  vpnLabel: string | null;
  uptime: string;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

function DashboardHero({
  status,
  strategyName,
  vpnLabel,
  uptime,
  isConnecting,
  onConnect,
  onDisconnect,
}: DashboardHeroProps) {
  const { t } = useI18n();
  const isActive =
    status === "connected" || status === "connecting" || status === "vpn";
  const badgeVariant = BADGE_VARIANT[status];
  const isVpn = status === "vpn";
  const heading = isVpn
    ? vpnLabel === null
      ? t("settings.vpn.heroVpn")
      : `${t("settings.vpn.badgeVpn")}: ${vpnLabel}`
    : (strategyName ?? t("dashboard.hero.notConfigured"));

  return (
    <GlassPanel padding="lg" className="flex min-h-[200px] items-center gap-8">
      <StatusOrb status={status} />

      <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
        <Badge variant={badgeVariant} dot={isActive} pulse={isActive}>
          {t(CONNECTION_LABELS[status])}
        </Badge>

        <div className="flex flex-col gap-1">
          <h2 className="text-text-primary text-2xl font-bold tracking-tight">
            {heading}
          </h2>
          <Text variant="body" size="sm" className="text-text-secondary">
            {t(HERO_STATUS[status])}
            {isActive && uptime !== "--:--:--" ? ` · ${uptime}` : ""}
          </Text>
        </div>

        {isActive ? (
          <Button
            size="lg"
            variant="danger"
            disabled={isConnecting}
            onClick={onDisconnect}
          >
            {isVpn
              ? t("settings.vpn.disconnectVpn")
              : t("settings.vpn.disconnectBypass")}
          </Button>
        ) : (
          <Button
            size="lg"
            disabled={isConnecting || strategyName === null}
            onClick={onConnect}
          >
            {t("settings.vpn.connectBypass")}
          </Button>
        )}
      </div>
    </GlassPanel>
  );
}

export default DashboardHero;
