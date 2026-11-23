// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// Импортируем зависимости из модуля framer-motion.
import { AnimatePresence, motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/dashboard/DpiMode.
import DpiMode from "@/components/dashboard/DpiMode";
// Импортируем зависимости из модуля @/components/dashboard/ModeSwitcher.
import ModeSwitcher from "@/components/dashboard/ModeSwitcher";
// Импортируем зависимости из модуля @/components/dashboard/VpnMode.
import VpnMode from "@/components/dashboard/VpnMode";
// Импортируем зависимости из модуля @/components/ui.
import { Heading, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useDashboardIntro.
import { useDashboardIntro } from "@/hooks/useDashboardIntro";
// Импортируем зависимости из модуля @/hooks/useMotionPreference.
import { useMotionPreference } from "@/hooks/useMotionPreference";
// Импортируем зависимости из модуля @/lib/appearanceTokens.
import { speedMs } from "@/lib/appearanceTokens";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт ANIMATION.
  ANIMATION,
  // Подключаем именованный импорт MODE_CROSSFADE_MS.
  MODE_CROSSFADE_MS,
  // Подключаем именованный импорт type DashboardMode.
  type DashboardMode,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/geo.
import { getGreeting } from "@/lib/geo";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Dashboard() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const mode = useAppStore((state) => state.dashboardMode….
  const mode = useAppStore((state) => state.dashboardMode);
  // Обрабатываем конструкцию: const setDashboardMode = useAppStore((state) => state.s….
  const setDashboardMode = useAppStore((state) => state.setDashboardMode);
  // Обрабатываем конструкцию: const switchStep = useVpnStore((state) => state.switchS….
  const switchStep = useVpnStore((state) => state.switchStep);
  // Обрабатываем конструкцию: const isSwitching = useVpnStore((state) => state.isSwit….
  const isSwitching = useVpnStore((state) => state.isSwitching);
  // Обрабатываем конструкцию: const { reduced: reducedMotion } = useMotionPreference(….
  const { reduced: reducedMotion } = useMotionPreference();
  // Обрабатываем конструкцию: const intro = useDashboardIntro().
  const intro = useDashboardIntro();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleModeChange = useCallback( (next: DashboardM….
  const handleModeChange = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (next: DashboardMode): void => {
      // Обрабатываем конструкцию: setDashboardMode.
      setDashboardMode(next);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [setDashboardMode]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: ( <section className=dashboard-container flex flex-col ….
  return (
    // Обрабатываем конструкцию: <section className=dashboard-container flex flex-col st….
    <section
      // Обрабатываем конструкцию: className.
      className="dashboard-container flex flex-col"
      // Обрабатываем конструкцию: style.
      style={{ gap: "var(--space-lg)" }}
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.header
        // Обрабатываем конструкцию: className.
        className="flex flex-col gap-4"
        // Обрабатываем конструкцию: initial.
        initial={reducedMotion ? false : { opacity: 0, y: 8 }}
        // Обрабатываем конструкцию: animate.
        animate={{ opacity: 1, y: 0 }}
        // Обрабатываем конструкцию: transition.
        transition={{
          // Обрабатываем конструкцию: duration.
          duration: reducedMotion ? 0 : ANIMATION.slow,
          // Обрабатываем конструкцию: ease.
          ease: ANIMATION.easeOutExpo,
          // Закрываем текущий блок.
        }}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
          {/* Выводим текстовое содержимое в JSX. */}
          <div className="flex min-w-0 flex-col gap-2">
            {/* Выводим текстовое содержимое в JSX. */}
            <Heading level={1}>{getGreeting()}</Heading>
            {/* Выводим текстовое содержимое в JSX. */}
            <Text variant="body" size="lg" className="text-text-secondary">
              {/* Выводим текстовое содержимое в JSX. */}
              {t("dashboard.subtitle")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Text>
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* — разделитель логических блоков — */}

          {/* Выводим текстовое содержимое в JSX. */}
          <div className="shrink-0">
            {/* Выводим текстовое содержимое в JSX. */}
            <ModeSwitcher
              // Обрабатываем конструкцию: mode.
              mode={mode}
              // Обрабатываем конструкцию: switchStep.
              switchStep={switchStep}
              // Обрабатываем конструкцию: isSwitching.
              isSwitching={isSwitching}
              // Обрабатываем конструкцию: onChange.
              onChange={handleModeChange}
              // Продолжаем выражение.
            />
            {/* Выводим текстовое содержимое в JSX. */}
          </div>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.header>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {/* Переключение режима — ровно одно затухание без сдвига и без каскада.
// — разделитель логических блоков —

          // Продолжаем выражение.
          Раньше здесь было три источника рывка сразу:
          // Продолжаем выражение.
          1) AnimatePresence в режиме wait ждал ухода старой панели и только
             // Продолжаем выражение.
             потом показывал новую — отсюда пауза;
          // Продолжаем выражение.
          2) сдвиг по вертикали на всю высоту панели читался как прыжок;
          // Продолжаем выражение.
          3) DpiMode при каждом переключении заново проигрывал каскад появления
             // Продолжаем выражение.
             блоков, и поверх затухания шла ещё одна волна анимаций.
          // Продолжаем выражение.
          Теперь затухание одно, а каскад проигрывается только при первом
          // Продолжаем выражение.
          открытии страницы. */}
      {/* Выводим текстовое содержимое в JSX. */}
      <AnimatePresence mode="popLayout" initial={false}>
        {/* Выводим текстовое содержимое в JSX. */}
        <motion.div
          // Обрабатываем конструкцию: key.
          key={mode}
          // Обрабатываем конструкцию: layout.
          layout={false}
          // Обрабатываем конструкцию: initial.
          initial={{ opacity: 0 }}
          // Обрабатываем конструкцию: animate.
          animate={{ opacity: 1 }}
          // Обрабатываем конструкцию: exit.
          exit={{ opacity: 0 }}
          // Обрабатываем конструкцию: transition.
          transition={{
            // Обрабатываем конструкцию: duration.
            duration: reducedMotion ? 0 : speedMs(MODE_CROSSFADE_MS) / 1000,
            // Обрабатываем конструкцию: ease.
            ease: ANIMATION.easeInOutExpo,
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: className.
          className="flex flex-col"
          // Обрабатываем конструкцию: style.
          style={{ gap: "var(--space-lg)" }}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {mode === "vpn" ? <VpnMode /> : <DpiMode intro={intro} />}
          {/* Выводим текстовое содержимое в JSX. */}
        </motion.div>
        {/* Выводим текстовое содержимое в JSX. */}
      </AnimatePresence>
      {/* Выводим текстовое содержимое в JSX. */}
    </section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
