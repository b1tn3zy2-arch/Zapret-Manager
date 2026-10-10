import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Play, Square } from "lucide-react";

import { Button } from "@/components/ui";
import { GlassPanel } from "@/components/shared/GlassPanel";
import { useI18n } from "@/i18n";
import { ANIMATION } from "@/lib/constants";
import { useVpnStore } from "@/stores/useVpnStore";
import type { Strategy } from "@/types";

export interface DashboardQuickActionsProps {
  lastStrategy: Strategy | undefined;
  isActive: boolean;
  isBusy: boolean;
  onRun: () => void;
  onStop: () => void;
  onOpenVpnSettings: () => void;
}

const LABEL_TRANSITION = { duration: ANIMATION.fast };

function AnimatedLabel({ label }: { label: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={label}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={LABEL_TRANSITION}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
}

function DashboardQuickActions({
  lastStrategy,
  isActive,
  isBusy,
  onRun,
  onStop,
  onOpenVpnSettings,
}: DashboardQuickActionsProps) {
  const { t } = useI18n();
  const vpnConnected = useVpnStore(
    (state) => state.status.state === "connected"
  );

  const runLabel =
    lastStrategy === undefined
      ? t("settings.vpn.noStrategies")
      : t("settings.vpn.chooseStrategy").replace("{name}", lastStrategy.name);

  const stopLabel = vpnConnected
    ? t("settings.vpn.disconnect")
    : t("settings.vpn.stopBypass");

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
          <AnimatedLabel label={runLabel} />
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
          <AnimatedLabel label={stopLabel} />
        </Button>
      </div>

      <motion.button
        type="button"
        onClick={onOpenVpnSettings}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: ANIMATION.slow, delay: 0.15 }}
        className="text-text-tertiary hover:text-accent-secondary flex items-center justify-center gap-1.5 text-xs transition-colors"
      >
        {t("dashboard.vpn.settings")}
        <ArrowRight aria-hidden="true" className="size-3.5" />
      </motion.button>
    </GlassPanel>
  );
}

const MemoDashboardQuickActions = memo(DashboardQuickActions);

export default MemoDashboardQuickActions;
