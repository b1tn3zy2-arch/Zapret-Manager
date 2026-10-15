import { useI18n } from "@/i18n";
import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DashboardFooter from "@/components/dashboard/DashboardFooter";
import DpiMode from "@/components/dashboard/DpiMode";
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import VpnMode from "@/components/dashboard/VpnMode";
import { Heading, Text } from "@/components/ui";
import { useMotionPreference } from "@/hooks/useMotionPreference";
import { speedMs } from "@/lib/appearanceTokens";
import {
  ANIMATION,
  MODE_CROSSFADE_MS,
  type DashboardMode,
} from "@/lib/constants";
import { getGreeting } from "@/lib/geo";
import { useAppStore } from "@/stores/useAppStore";
import { useVpnStore } from "@/stores/useVpnStore";

export default function Dashboard() {
  const { t } = useI18n();
  const mode = useAppStore((state) => state.dashboardMode);
  const setDashboardMode = useAppStore((state) => state.setDashboardMode);
  const switchStep = useVpnStore((state) => state.switchStep);
  const isSwitching = useVpnStore((state) => state.isSwitching);
  const { reduced: reducedMotion } = useMotionPreference();

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
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          <div className="flex min-w-0 flex-col gap-2">
            <Heading level={1}>{getGreeting()}</Heading>
            <Text variant="body" size="lg" className="text-text-secondary">
              {t("dashboard.subtitle")}
            </Text>
          </div>

          <div className="shrink-0">
            <ModeSwitcher
              mode={mode}
              switchStep={switchStep}
              isSwitching={isSwitching}
              onChange={handleModeChange}
            />
          </div>
        </div>
      </motion.header>

      {/* popLayout вместо wait: раньше уходящая панель доигрывала 400 мс,
          и только потом появлялась новая — переключение выглядело как рывок.
          Теперь они перекрещиваются, а каскад появления карточек не повторяется
          при каждом переключении. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={mode}
          layout={false}
          initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reducedMotion ? 0 : -6 }}
          transition={{
            duration: reducedMotion ? 0 : speedMs(MODE_CROSSFADE_MS) / 1000,
            ease: ANIMATION.easeOutExpo,
          }}
          className="flex flex-col"
          style={{ gap: "var(--space-lg)" }}
        >
          {mode === "vpn" ? <VpnMode /> : <DpiMode />}
        </motion.div>
      </AnimatePresence>

      <DashboardFooter />
    </section>
  );
}
