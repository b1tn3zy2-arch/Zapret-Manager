import { memo, useState } from "react";
import { Play, Square } from "lucide-react";

import VpnToggle from "@/components/dashboard/VpnToggle";
import { Button, Text } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
import { useVpn } from "@/hooks/useVpn";
import { useVpnStore } from "@/stores/useVpnStore";
import type { Strategy } from "@/types";

export interface DashboardQuickActionsProps {
  lastStrategy: Strategy | undefined;
  isActive: boolean;
  isBusy: boolean;
  onRun: () => void;
  onStop: () => void;
}

function DashboardQuickActions({
  lastStrategy,
  isActive,
  isBusy,
  onRun,
  onStop,
}: DashboardQuickActionsProps) {
  const { t } = useI18n();
  const [notice, setNotice] = useState<string | null>(null);
  const vpnState = useVpnStore((state) => state.status.state);
  const switchStep = useVpnStore((state) => state.switchStep);
  const isSwitching = useVpnStore((state) => state.isSwitching);
  const activeId = useVpnStore((state) => state.activeConfigId);
  const installed = useVpnStore((state) => state.wireguardInstalled);
  const { connectActive, switchToDpi } = useVpn();

  const vpnConnected = vpnState === "connected";

  const handleVpnToggle = (value: boolean): void => {
    if (!installed) {
      setNotice(t("settings.vpn.noticeInstallFirst"));
      return;
    }

    if (value && activeId === null) {
      setNotice(t("settings.vpn.noActiveConfig"));
      return;
    }

    if (value && activeId === null) {
      setNotice("Выберите конфиг VPN в Настройках → VPN");

      return;
    }

    setNotice(null);

    if (value) {
      void connectActive();
      return;
    }

    void switchToDpi();
  };

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-5">
      <h3 className="text-text-primary text-base font-semibold">
        {t("settings.vpn.quickActions")}
      </h3>

      <div className="flex flex-col gap-3">
        <Button
          fullWidth
          size="lg"
          disabled={
            isBusy || isActive || isSwitching || lastStrategy === undefined
          }
          onClick={onRun}
          icon={
            <Play aria-hidden="true" className="size-4" strokeWidth={2.5} />
          }
        >
          {lastStrategy === undefined
            ? t("settings.vpn.noStrategies")
            : t("settings.vpn.chooseStrategy").replace(
                "{name}",
                lastStrategy.name
              )}
        </Button>

        <Button
          fullWidth
          size="lg"
          variant="secondary"
          disabled={!isActive && !vpnConnected}
          onClick={onStop}
          icon={
            <Square aria-hidden="true" className="size-4" strokeWidth={2.5} />
          }
        >
          {vpnConnected
            ? t("settings.vpn.disconnect")
            : t("settings.vpn.stopBypass")}
        </Button>
      </div>

      <VpnToggle
        isVpn={vpnConnected}
        switchStep={switchStep}
        isSwitching={isSwitching}
        onChange={handleVpnToggle}
      />

      {notice !== null ? (
        <Text variant="caption" size="sm" className="text-accent-warning">
          {notice}
        </Text>
      ) : null}
    </GlassPanel>
  );
}

const MemoDashboardQuickActions = memo(DashboardQuickActions);

export default MemoDashboardQuickActions;
