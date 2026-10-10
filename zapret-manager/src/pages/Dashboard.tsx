import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DpiMode from "@/components/dashboard/DpiMode";
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import VpnMode from "@/components/dashboard/VpnMode";
import { Heading, Text } from "@/components/ui";
import { usePrefersReducedMotion } from "@/hooks/useDeviceTier";
import {
  ANIMATION,
  MODE_CROSSFADE_MS,
  type DashboardMode,
} from "@/lib/constants";
import { getGreeting } from "@/lib/geo";
import { useAppStore } from "@/stores/useAppStore";
import { useVpnStore } from "@/stores/useVpnStore";

export default function Dashboard() {
  const mode = useAppStore((state) => state.dashboardMode);
  const setDashboardMode = useAppStore((state) => state.setDashboardMode);
  const switchStep = useVpnStore((state) => state.switchStep);
  const isSwitching = useVpnStore((state) => state.isSwitching);
  const reducedMotion = usePrefersReducedMotion();

  const handleModeChange = useCallback(
    (next: DashboardMode): void => {
      setDashboardMode(next);
    },
    [setDashboardMode]
  );

  return (
    <section
      className="dashboard-container flex flex-col"
      style={{ gap: "var(--space-lg)" }}
    >
      <motion.header
        className="flex flex-col gap-4"
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: reducedMotion ? 0 : ANIMATION.slow,
          ease: ANIMATION.easeOutExpo,
        }}
      >
        <div className="flex flex-col gap-2">
          <Heading level={1}>{getGreeting()}</Heading>
          <Text variant="body" size="lg" className="text-text-secondary">
            Управление обходом блокировок
          </Text>
        </div>

        <ModeSwitcher
          mode={mode}
          switchStep={switchStep}
          isSwitching={isSwitching}
          onChange={handleModeChange}
        />
      </motion.header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : MODE_CROSSFADE_MS / 1000,
            ease: ANIMATION.easeOutExpo,
          }}
          className="flex flex-col"
          style={{ gap: "var(--space-lg)" }}
        >
          {mode === "vpn" ? <VpnMode /> : <DpiMode />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
