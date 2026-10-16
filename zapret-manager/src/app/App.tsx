import type { ComponentType } from "react";
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import { lazy, Suspense, useEffect, useState } from "react";

import FirstRunModal from "@/components/first-run/FirstRunModal";
import InitProgressModal from "@/components/first-run/InitProgressModal";
import Layout from "@/components/layout/Layout";
import { PerfMonitor } from "@/components/dev/PerfMonitor";
import BootSplash from "@/components/shared/BootSplash";
import PageSkeleton from "@/components/shared/PageSkeleton";
import NotificationToaster from "@/components/shared/NotificationToaster";
import UpdateModal from "@/components/updates/UpdateModal";
import { Text } from "@/components/ui";
import { useResourceInit } from "@/hooks/useResourceInit";
import { useAppearance } from "@/hooks/useAppearance";
import { useAutoUpdateCheck } from "@/hooks/useAutoUpdateCheck";
import { useAutoVpnConnect } from "@/hooks/useAutoVpnConnect";
import { useSettingsSync } from "@/hooks/useSettingsSync";
import { useInstalledGamesStartup } from "@/hooks/useInstalledGames";
import { useLogRetention } from "@/hooks/useLogRetention";
import { useStartupMetrics } from "@/hooks/useStartupMetrics";
import { useStrategies } from "@/hooks/useStrategies";
import { useStrategyEvents } from "@/hooks/useStrategyEvents";
import { useTray } from "@/hooks/useTray";
import { useTrayNotifications } from "@/hooks/useTrayNotifications";
import { useUpdater } from "@/hooks/useUpdater";
import { useVpnSync } from "@/hooks/useVpnSync";
import { useVpnStats } from "@/hooks/useVpnStats";
import { ROUTES, type AppPage } from "@/lib/constants";
import Dashboard from "@/pages/Dashboard";
import Strategies from "@/pages/Strategies";
import { selectActivePage, useAppStore } from "@/stores/useAppStore";
import { useUpdateStore } from "@/stores/useUpdateStore";
import { startLogsFlusher, stopLogsFlusher } from "@/stores/useLogsStore";

const About = lazy(async () => await import("@/pages/About"));
const Games = lazy(async () => await import("@/pages/Games"));
const Logs = lazy(async () => await import("@/pages/Logs"));
const Monitor = lazy(async () => await import("@/pages/Monitor"));
const Settings = lazy(async () => await import("@/pages/Settings"));

const PAGE_COMPONENTS = {
  [ROUTES.dashboard]: Dashboard,
  [ROUTES.strategies]: Strategies,
  [ROUTES.games]: Games,
  [ROUTES.monitor]: Monitor,
  [ROUTES.logs]: Logs,
  [ROUTES.settings]: Settings,
  [ROUTES.about]: About,
} as const satisfies Record<AppPage, ComponentType>;

const PAGE_TRANSITION = {
  duration: 0.25,
  ease: [0.16, 1, 0.3, 1],
} as const;

export default function App() {
  const activePage = useAppStore(selectActivePage);
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [booted, setBooted] = useState(false);
  const resources = useResourceInit();
  useSettingsSync();
  useAutoUpdateCheck();
  useAppearance();
  useStrategies();
  useStrategyEvents();
  useVpnSync();
  useVpnStats();
  useAutoVpnConnect();
  const {
    check,
    download,
    install,
    cancel,
    ignoreVersion,
    dismiss,
    closeModal,
  } = useUpdater();
  useTrayNotifications();
  useTray();
  useStartupMetrics();
  useInstalledGamesStartup();
  useLogRetention();
  const CurrentPage = PAGE_COMPONENTS[activePage];

  const { isInitializing, progress, report, error: resourceError } = resources;
  const showWelcome =
    !welcomeDismissed &&
    report !== null &&
    report.firstRun &&
    report.available &&
    !isInitializing;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setBooted(true);
    }, 600);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    startLogsFlusher();

    return () => {
      stopLogsFlusher();
    };
  }, []);

  return (
    <MotionConfig reducedMotion="never">
      <Layout>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activePage}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={PAGE_TRANSITION}
            className="flex min-h-full flex-none flex-col gap-6"
          >
            <Suspense fallback={<PageSkeleton />}>
              <CurrentPage />
            </Suspense>
          </motion.div>
        </AnimatePresence>

        <UpdateModal
          onDownload={() => {
            void download();
          }}
          onInstall={() => {
            void install();
          }}
          onCancel={() => {
            void cancel();
          }}
          onDismiss={dismiss}
          onIgnore={() => {
            const info = useUpdateStore.getState().info;

            if (info !== null) {
              void ignoreVersion(info.latestVersion);
            }
          }}
          onClose={closeModal}
          onRetry={() => {
            void check();
          }}
        />

        <InitProgressModal
          open={isInitializing}
          progress={progress}
          extractedBytes={report?.extractedBytes ?? 0}
        />

        <FirstRunModal
          open={showWelcome}
          report={report}
          onStart={() => {
            setWelcomeDismissed(true);
          }}
        />

        {resourceError !== null ? (
          <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
            <Text variant="caption" size="sm" className="text-accent-danger">
              {resourceError}
            </Text>
          </div>
        ) : null}

        {import.meta.env.DEV && import.meta.env.VITE_PERF_MONITOR === "1" ? (
          <PerfMonitor />
        ) : null}
        <NotificationToaster />
        <AnimatePresence>
          {booted ? null : <BootSplash key="boot" />}
        </AnimatePresence>
      </Layout>
    </MotionConfig>
  );
}
