import { memo } from "react";
import { Play, Square } from "lucide-react";

import { Button } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
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
  const vpnConnected = useVpnStore(
    (state) => state.status.state === "connected"
  );

  return (
    <GlassPanel padding="lg" className="flex flex-col gap-5">
      <h3 className="text-text-primary text-base font-semibold">
        {t("settings.vpn.quickActions")}
      </h3>

      <div className="flex flex-col gap-3">
        <Button
          fullWidth
          size="lg"
          disabled={isBusy || isActive || lastStrategy === undefined}
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
    </GlassPanel>
  );
}

const MemoDashboardQuickActions = memo(DashboardQuickActions);

export default MemoDashboardQuickActions;
