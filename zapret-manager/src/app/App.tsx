// Импортируем зависимости из модуля react.
import type { ComponentType } from "react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, MotionConfig, motion } from "framer-motion";
// Импортируем зависимости из модуля react.
import { lazy, Suspense, useEffect, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/first-run/FirstRunModal.
import FirstRunModal from "@/components/first-run/FirstRunModal";
// Импортируем зависимости из модуля @/components/first-run/InitProgressModal.
import InitProgressModal from "@/components/first-run/InitProgressModal";
// Импортируем зависимости из модуля @/components/layout/Layout.
import Layout from "@/components/layout/Layout";
// Импортируем зависимости из модуля @/components/dev/PerfMonitor.
import { PerfMonitor } from "@/components/dev/PerfMonitor";
// Импортируем зависимости из модуля @/components/shared/BootSplash.
import BootSplash from "@/components/shared/BootSplash";
// Импортируем зависимости из модуля @/components/shared/PageSkeleton.
import PageSkeleton from "@/components/shared/PageSkeleton";
// Импортируем зависимости из модуля @/components/shared/NotificationToaster.
import NotificationToaster from "@/components/shared/NotificationToaster";
// Импортируем зависимости из модуля @/components/updates/UpdateModal.
import UpdateModal from "@/components/updates/UpdateModal";
// Импортируем зависимости из модуля @/components/ui.
import { Text } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useResourceInit.
import { useResourceInit } from "@/hooks/useResourceInit";
// Импортируем зависимости из модуля @/hooks/useAppearance.
import { useAppearance } from "@/hooks/useAppearance";
// Импортируем зависимости из модуля @/hooks/useAutoUpdateCheck.
import { useAutoUpdateCheck } from "@/hooks/useAutoUpdateCheck";
// Импортируем зависимости из модуля @/hooks/useAutoVpnConnect.
import { useAutoVpnConnect } from "@/hooks/useAutoVpnConnect";
// Импортируем зависимости из модуля @/hooks/useGameRuntimeSync.
import { useGameRuntimeSync } from "@/hooks/useGameRuntimeSync";
// Импортируем зависимости из модуля @/hooks/useSettingsSync.
import { useSettingsSync } from "@/hooks/useSettingsSync";
// Импортируем зависимости из модуля @/hooks/useInstalledGames.
import { useInstalledGamesStartup } from "@/hooks/useInstalledGames";
// Импортируем зависимости из модуля @/hooks/useLogRetention.
import { useLogRetention } from "@/hooks/useLogRetention";
// Импортируем зависимости из модуля @/hooks/useStrategies.
import { useStrategies } from "@/hooks/useStrategies";
// Импортируем зависимости из модуля @/hooks/useSuppressContextMenu.
import { useSuppressContextMenu } from "@/hooks/useSuppressContextMenu";
// Импортируем зависимости из модуля @/hooks/useStrategyEvents.
import { useStrategyEvents } from "@/hooks/useStrategyEvents";
// Импортируем зависимости из модуля @/hooks/useTray.
import { useTray } from "@/hooks/useTray";
// Импортируем зависимости из модуля @/hooks/useTrayNotifications.
import { useTrayNotifications } from "@/hooks/useTrayNotifications";
// Импортируем зависимости из модуля @/hooks/useUpdater.
import { useUpdater } from "@/hooks/useUpdater";
// Импортируем зависимости из модуля @/hooks/useVpnSync.
import { useVpnSync } from "@/hooks/useVpnSync";
// Импортируем зависимости из модуля @/hooks/useVpnStats.
import { useVpnStats } from "@/hooks/useVpnStats";
// Импортируем зависимости из модуля @/lib/constants.
import { ROUTES, type AppPage } from "@/lib/constants";
// Импортируем зависимости из модуля @/pages/Dashboard.
import Dashboard from "@/pages/Dashboard";
// Импортируем зависимости из модуля @/pages/Strategies.
import Strategies from "@/pages/Strategies";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { selectActivePage, useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { startLogsFlusher, stopLogsFlusher } from "@/stores/useLogsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const About = lazy(async () => await import(@/pages/Abo….
const About = lazy(async () => await import("@/pages/About"));
// Обрабатываем конструкцию: const Games = lazy(async () => await import(@/pages/Gam….
const Games = lazy(async () => await import("@/pages/Games"));
// Обрабатываем конструкцию: const Logs = lazy(async () => await import(@/pages/Logs….
const Logs = lazy(async () => await import("@/pages/Logs"));
// Обрабатываем конструкцию: const Monitor = lazy(async () => await import(@/pages/M….
const Monitor = lazy(async () => await import("@/pages/Monitor"));
// Обрабатываем конструкцию: const Settings = lazy(async () => await import(@/pages/….
const Settings = lazy(async () => await import("@/pages/Settings"));
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PAGE_COMPONENTS = { [ROUTES.dashboard]: Dashboard….
const PAGE_COMPONENTS = {
  // Обрабатываем конструкцию: [ROUTES.dashboard].
  [ROUTES.dashboard]: Dashboard,
  // Обрабатываем конструкцию: [ROUTES.strategies].
  [ROUTES.strategies]: Strategies,
  // Обрабатываем конструкцию: [ROUTES.games].
  [ROUTES.games]: Games,
  // Обрабатываем конструкцию: [ROUTES.monitor].
  [ROUTES.monitor]: Monitor,
  // Обрабатываем конструкцию: [ROUTES.logs].
  [ROUTES.logs]: Logs,
  // Обрабатываем конструкцию: [ROUTES.settings].
  [ROUTES.settings]: Settings,
  // Обрабатываем конструкцию: [ROUTES.about].
  [ROUTES.about]: About,
  // Закрываем текущий блок.
} as const satisfies Record<AppPage, ComponentType>;
// — разделитель логических блоков —

// Обрабатываем конструкцию: const PAGE_TRANSITION = { duration: 0.18, ease: [0.22, ….
const PAGE_TRANSITION = {
  // Обрабатываем конструкцию: duration.
  duration: 0.18,
  // Обрабатываем конструкцию: ease.
  ease: [0.22, 1, 0.36, 1],
  // Закрываем текущий блок.
} as const;
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Страницы, которые грузятся отдельно.
 * Страницы, которые грузятся отдельно.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Их код скачивается заранее, пока приложение ещё не торопит…
 * Их код скачивается заранее, пока приложение ещё не торопится:
 // Сохраняем пояснение разработчика: * иначе первый переход на «Игры» или «Настройки» ждёт сеть и
 * иначе первый переход на «Игры» или «Настройки» ждёт сеть и
 // Сохраняем пояснение разработчика: * выглядит как зависание.
 * выглядит как зависание.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию prefetchPages.
function prefetchPages(): void {
  // Обрабатываем конструкцию: const prefetch = (): void => { void import(@/pages/Game….
  const prefetch = (): void => {
    // Обрабатываем конструкцию: void import(@/pages/Games).
    void import("@/pages/Games");
    // Обрабатываем конструкцию: void import(@/pages/Monitor).
    void import("@/pages/Monitor");
    // Обрабатываем конструкцию: void import(@/pages/Logs).
    void import("@/pages/Logs");
    // Обрабатываем конструкцию: void import(@/pages/Settings).
    void import("@/pages/Settings");
    // Обрабатываем конструкцию: void import(@/pages/About).
    void import("@/pages/About");
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const idle = ( window as Window & { requestIdleCallback….
  const idle =
    // Закрываем выражение или список аргументов.
    // Обрабатываем конструкцию: window.
    // Продолжаем предыдущую конструкцию.
    // Продолжаем предыдущую конструкцию.
    (
      window as Window & {
        // Обрабатываем конструкцию: requestIdleCallback.
        requestIdleCallback?: (
          // Обрабатываем конструкцию: callback.
          callback: () => void,
          // Обрабатываем конструкцию: options.
          options?: { timeout: number }
          // Закрываем выражение или список аргументов.
        ) => void;
        // Закрываем текущий блок.
      }
    ).requestIdleCallback;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof idle === function.
  if (typeof idle === "function") {
    // Обрабатываем конструкцию: idle.
    idle(prefetch, { timeout: 2000 });
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: window.
  window.setTimeout(prefetch, 1200);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function App() {
  // Обрабатываем конструкцию: const activePage = useAppStore(selectActivePage).
  const activePage = useAppStore(selectActivePage);
  // Обрабатываем конструкцию: const [welcomeDismissed, setWelcomeDismissed] = useStat….
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  // Обрабатываем конструкцию: const [booted, setBooted] = useState(false).
  const [booted, setBooted] = useState(false);
  // Обрабатываем конструкцию: const resources = useResourceInit().
  const resources = useResourceInit();
  // Обрабатываем конструкцию: useSettingsSync.
  useSettingsSync();
  // Обрабатываем конструкцию: useAutoUpdateCheck.
  useAutoUpdateCheck();
  // Обрабатываем конструкцию: useAppearance.
  useAppearance();
  // Обрабатываем конструкцию: useStrategies.
  useStrategies();
  // Обрабатываем конструкцию: useStrategyEvents.
  useStrategyEvents();
  // Обрабатываем конструкцию: useVpnSync.
  useVpnSync();
  // Обрабатываем конструкцию: useVpnStats.
  useVpnStats();
  // Обрабатываем конструкцию: useAutoVpnConnect.
  useAutoVpnConnect();
  // Обрабатываем конструкцию: const { check, download, install, cancel, ignoreVersion….
  const {
    // Обрабатываем конструкцию: check.
    check,
    // Обрабатываем конструкцию: download.
    download,
    // Обрабатываем конструкцию: install.
    install,
    // Обрабатываем конструкцию: cancel.
    cancel,
    // Обрабатываем конструкцию: ignoreVersion.
    ignoreVersion,
    // Обрабатываем конструкцию: dismiss.
    dismiss,
    // Обрабатываем конструкцию: closeModal.
    closeModal,
    // Закрываем текущий блок.
  } = useUpdater();
  // Обрабатываем конструкцию: useTrayNotifications.
  useTrayNotifications();
  // Обрабатываем конструкцию: useTray.
  useTray();
  // Обрабатываем конструкцию: useInstalledGamesStartup.
  useInstalledGamesStartup();
  // Обрабатываем конструкцию: useGameRuntimeSync.
  useGameRuntimeSync();
  // Обрабатываем конструкцию: useLogRetention.
  useLogRetention();
  // Обрабатываем конструкцию: useSuppressContextMenu.
  useSuppressContextMenu();
  // Обрабатываем конструкцию: const CurrentPage = PAGE_COMPONENTS[activePage].
  const CurrentPage = PAGE_COMPONENTS[activePage];
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { isInitializing, progress, report, error: resour….
  const { isInitializing, progress, report, error: resourceError } = resources;
  // Обрабатываем конструкцию: const showWelcome = !welcomeDismissed && report !== nul….
  const showWelcome =
    // Изменяем значение выражения !welcomeDismissed.
    !welcomeDismissed &&
    // Обрабатываем конструкцию: report.
    report !== null &&
    // Обрабатываем конструкцию: report.
    report.firstRun &&
    // Обрабатываем конструкцию: report.
    report.available &&
    // Изменяем значение выражения !isInitializing.
    !isInitializing;
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const timer = window.setTimeout(() => { setBooted(true)….
    const timer = window.setTimeout(() => {
      // Обрабатываем конструкцию: setBooted.
      setBooted(true);
      // Закрываем текущий блок.
    }, 280);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearTimeout(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: prefetchPages.
    prefetchPages();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: startLogsFlusher.
    startLogsFlusher();
    // — разделитель логических блоков —

    // Возвращаем результат: () => { stopLogsFlusher(); }.
    return () => {
      // Обрабатываем конструкцию: stopLogsFlusher.
      stopLogsFlusher();
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <MotionConfig reducedMotion=never> <Layout> <AnimateP….
  return (
    // Обрабатываем конструкцию: <MotionConfig reducedMotion=never>.
    <MotionConfig reducedMotion="never">
      {/* Выводим текстовое содержимое в JSX. */}
      <Layout>
        {/* Выводим текстовое содержимое в JSX. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {/* Выводим текстовое содержимое в JSX. */}
          <motion.div
            // Обрабатываем конструкцию: key.
            key={activePage}
            // Обрабатываем конструкцию: initial.
            initial={{ opacity: 0, y: 10, scale: 0.99 }}
            // Обрабатываем конструкцию: animate.
            animate={{ opacity: 1, y: 0, scale: 1 }}
            // Обрабатываем конструкцию: exit.
            exit={{ opacity: 0, y: -6, scale: 0.995 }}
            // Обрабатываем конструкцию: transition.
            transition={PAGE_TRANSITION}
            // Обрабатываем конструкцию: className.
            className="flex min-h-full flex-none flex-col gap-6"
            // Продолжаем выражение.
          >
            {/* Выводим текстовое содержимое в JSX. */}
            <Suspense fallback={<PageSkeleton />}>
              {/* Выводим текстовое содержимое в JSX. */}
              <CurrentPage />
              {/* Выводим текстовое содержимое в JSX. */}
            </Suspense>
            {/* Выводим текстовое содержимое в JSX. */}
          </motion.div>
          {/* Выводим текстовое содержимое в JSX. */}
        </AnimatePresence>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <UpdateModal
          // Обрабатываем конструкцию: onDownload.
          onDownload={() => {
            // Обрабатываем конструкцию: void download().
            void download();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onInstall.
          onInstall={() => {
            // Обрабатываем конструкцию: void install().
            void install();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onCancel.
          onCancel={() => {
            // Обрабатываем конструкцию: void cancel().
            void cancel();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onDismiss.
          onDismiss={dismiss}
          // Обрабатываем конструкцию: onIgnore.
          onIgnore={() => {
            // Обрабатываем конструкцию: const info = useUpdateStore.getState().info.
            const info = useUpdateStore.getState().info;
            // — разделитель логических блоков —

            // Проверяем бизнес-условие: info !== null.
            if (info !== null) {
              // Обрабатываем конструкцию: void ignoreVersion(info.latestVersion).
              void ignoreVersion(info.latestVersion);
              // Закрываем текущий блок.
            }
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onClose.
          onClose={closeModal}
          // Обрабатываем конструкцию: onRetry.
          onRetry={() => {
            // Обрабатываем конструкцию: void check().
            void check();
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <InitProgressModal
          // Обрабатываем конструкцию: open.
          open={isInitializing}
          // Обрабатываем конструкцию: progress.
          progress={progress}
          // Обрабатываем конструкцию: extractedBytes.
          extractedBytes={report?.extractedBytes ?? 0}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <FirstRunModal
          // Обрабатываем конструкцию: open.
          open={showWelcome}
          // Обрабатываем конструкцию: report.
          report={report}
          // Обрабатываем конструкцию: onStart.
          onStart={() => {
            // Обрабатываем конструкцию: setWelcomeDismissed.
            setWelcomeDismissed(true);
            // Закрываем текущий блок.
          }}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {resourceError !== null ? (
          // Обрабатываем конструкцию: <div className=fixed bottom-4 left-1/2 z-40 -translate-….
          <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="caption" size="sm" className="text-accent-danger">
              {/* Выводим текстовое содержимое в JSX. */}
              {resourceError}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        {import.meta.env.DEV && import.meta.env.VITE_PERF_MONITOR === "1" ? (
          // Рендерим самозакрывающийся элемент PerfMonitor.
          <PerfMonitor />
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        null}
        {/* Выводим текстовое содержимое в JSX. */}
        <NotificationToaster />
        {/* Выводим текстовое содержимое в JSX. */}
        <AnimatePresence>
          {/* Выводим текстовое содержимое в JSX. */}
          {booted ? null : <BootSplash key="boot" />}
          {/* Выводим текстовое содержимое в JSX. */}
        </AnimatePresence>
        {/* Выводим текстовое содержимое в JSX. */}
      </Layout>
      {/* Выводим текстовое содержимое в JSX. */}
    </MotionConfig>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
