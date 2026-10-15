import { useI18n } from "@/i18n";
import { useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";

import DpiMode from "@/components/dashboard/DpiMode";
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
import VpnMode from "@/components/dashboard/VpnMode";
import { Heading, Text } from "@/components/ui";
import { useDashboardIntro } from "@/hooks/useDashboardIntro";
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
  const intro = useDashboardIntro();

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

      {/* Переключение режима — ровно одно затухание без сдвига и без каскада.

          Раньше здесь было три источника рывка сразу:
          1) AnimatePresence в режиме wait ждал ухода старой панели и только
             потом показывал новую — отсюда пауза;
          2) сдвиг по вертикали на всю высоту панели читался как прыжок;
          3) DpiMode при каждом переключении заново проигрывал каскад появления
             блоков, и поверх затухания шла ещё одна волна анимаций.
          Теперь затухание одно, а каскад проигрывается только при первом
          открытии страницы. */}
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.div
          key={mode}
          layout={false}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: reducedMotion ? 0 : speedMs(MODE_CROSSFADE_MS) / 1000,
            ease: ANIMATION.easeInOutExpo,
          }}
          className="flex flex-col"
          style={{ gap: "var(--space-lg)" }}
        >
          {mode === "vpn" ? <VpnMode /> : <DpiMode intro={intro} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
