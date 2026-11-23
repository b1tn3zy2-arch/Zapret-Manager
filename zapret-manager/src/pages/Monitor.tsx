// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// Импортируем зависимости из модуля react.
import { useCallback, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/monitor/MonitorControls.
import MonitorControls from "@/components/monitor/MonitorControls";
// Импортируем зависимости из модуля @/components/monitor/PingMonitor.
import PingMonitor from "@/components/monitor/PingMonitor";
// Импортируем зависимости из модуля @/components/monitor/StatsCounters.
import StatsCounters from "@/components/monitor/StatsCounters";
// Импортируем зависимости из модуля @/components/monitor/TrafficChart.
import TrafficChart from "@/components/monitor/TrafficChart";
// Импортируем зависимости из модуля @/components/monitor/TrafficStatus.
import TrafficStatus from "@/components/monitor/TrafficStatus";
// Импортируем зависимости из модуля @/components/ui.
import { Heading, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useDashboardStagger.
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
// Импортируем зависимости из модуля @/hooks/useNetworkMonitor.
import { useNetworkMonitor } from "@/hooks/useNetworkMonitor";
// Импортируем зависимости из модуля @/lib/constants.
import { TRAFFIC_COLORS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/monitorSnapshot.
import { composeSnapshot, snapshotFileName } from "@/lib/monitorSnapshot";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/selectors.
import { useActiveStrategy } from "@/stores/selectors";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const SNAPSHOT_WIDTH = 1180.
const SNAPSHOT_WIDTH = 1180;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Monitor() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { bufferRef, stats, isPaused, error, clearBuffer,….
  const { bufferRef, stats, isPaused, error, clearBuffer, togglePause } =
    // Обрабатываем конструкцию: useNetworkMonitor.
    useNetworkMonitor();
  // Обрабатываем конструкцию: const activeStrategy = useActiveStrategy().
  const activeStrategy = useActiveStrategy();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const inboundRef = useRef<HTMLCanvasElement | null>(nul….
  const inboundRef = useRef<HTMLCanvasElement | null>(null);
  // Обрабатываем конструкцию: const outboundRef = useRef<HTMLCanvasElement | null>(nu….
  const outboundRef = useRef<HTMLCanvasElement | null>(null);
  // Обрабатываем конструкцию: const [isSaving, setIsSaving] = useState(false).
  const [isSaving, setIsSaving] = useState(false);
  // Обрабатываем конструкцию: const { containerVariants, itemVariants } = useDashboar….
  const { containerVariants, itemVariants } = useDashboardStagger();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleSnapshot = useCallback(async () => { setIsS….
  const handleSnapshot = useCallback(async () => {
    // Обрабатываем конструкцию: setIsSaving.
    setIsSaving(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const data = composeSnapshot( [ { label: t(monitor.char….
      const data = composeSnapshot(
        // Открываем массив.
        [
          // Открываем объектный литерал.
          { label: t("monitor.chart.in"), canvas: inboundRef.current },
          // Открываем объектный литерал.
          { label: t("monitor.chart.out"), canvas: outboundRef.current },
          // Закрываем массив или список.
        ],
        // Обрабатываем конструкцию: SNAPSHOT_WIDTH.
        SNAPSHOT_WIDTH
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: data ===.
      if (data === "") {
        // Выбрасываем исключение throw new Error(t(monitor.snapshotFailed));.
        throw new Error(t("monitor.snapshotFailed"));
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const savedPath = await secureInvoke<string | null>( sa….
      const savedPath = await secureInvoke<string | null>(
        // Обрабатываем конструкцию: save_monitor_snapshot.
        "save_monitor_snapshot",
        // Открываем объектный литерал.
        {
          // Обрабатываем конструкцию: title.
          title: t("monitor.controls.snapshot"),
          // Обрабатываем конструкцию: defaultName.
          defaultName: snapshotFileName(),
          // Передаём поле data в объект.
          data,
          // Закрываем текущий блок.
        }
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: savedPath === null.
      if (savedPath === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("monitor.snapshotSaved", { path: savedPath }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("monitor.snapshotNotSaved", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setIsSaving.
      setIsSaving(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog, t]);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <motion.section variants={containerVariants} initial=….
  return (
    // Обрабатываем конструкцию: <motion.section variants={containerVariants} initial=hi….
    <motion.section
      // Обрабатываем конструкцию: variants.
      variants={containerVariants}
      // Обрабатываем конструкцию: initial.
      initial="hidden"
      // Обрабатываем конструкцию: animate.
      animate="visible"
      // Обрабатываем конструкцию: className.
      className="flex flex-col gap-4"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.header
        // Обрабатываем конструкцию: variants.
        variants={itemVariants}
        // Обрабатываем конструкцию: className.
        className="flex flex-wrap items-start justify-between gap-3"
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <div className="flex flex-col gap-1">
          {/* Выводим текстовое содержимое в JSX. */}
          <Heading level={1}>{t("monitor.title")}</Heading>
          {/* Выводим текстовое содержимое в JSX. */}
          <Text variant="body" size="lg" className="text-text-secondary">
            {/* Выводим текстовое содержимое в JSX. */}
            {t("monitor.subtitle")}
            {/* Выводим текстовое содержимое в JSX. */}
          </Text>
          {/* Выводим текстовое содержимое в JSX. */}
        </div>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <MonitorControls
          // Обрабатываем конструкцию: isPaused.
          isPaused={isPaused}
          // Обрабатываем конструкцию: isSaving.
          isSaving={isSaving}
          // Обрабатываем конструкцию: hint.
          hint={t("monitor.hint")}
          // Обрабатываем конструкцию: onTogglePause.
          onTogglePause={togglePause}
          // Обрабатываем конструкцию: onSnapshot.
          onSnapshot={() => {
            // Обрабатываем конструкцию: void handleSnapshot().
            void handleSnapshot();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: onClear.
          onClear={clearBuffer}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.header>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div variants={itemVariants} className="flex flex-col gap-4">
        {/* Выводим текстовое содержимое в JSX. */}
        <TrafficStatus
          // Обрабатываем конструкцию: stats.
          stats={stats}
          // Обрабатываем конструкцию: isPaused.
          isPaused={isPaused}
          // Обрабатываем конструкцию: error.
          error={error}
          // Обрабатываем конструкцию: activeStrategy.
          activeStrategy={activeStrategy}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <StatsCounters stats={stats} />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div variants={itemVariants}>
        {/* Выводим текстовое содержимое в JSX. */}
        <PingMonitor />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: variants.
        variants={itemVariants}
        // Обрабатываем конструкцию: className.
        className="grid grid-cols-1 gap-4 xl:grid-cols-2"
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <TrafficChart
          // Обрабатываем конструкцию: buffer.
          buffer={bufferRef}
          // Обрабатываем конструкцию: dataKey.
          dataKey="in"
          // Обрабатываем конструкцию: label.
          label={t("monitor.chart.in")}
          // Обрабатываем конструкцию: color.
          color={TRAFFIC_COLORS.in}
          // Обрабатываем конструкцию: isPaused.
          isPaused={isPaused}
          // Обрабатываем конструкцию: canvasRef.
          canvasRef={inboundRef}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
        <TrafficChart
          // Обрабатываем конструкцию: buffer.
          buffer={bufferRef}
          // Обрабатываем конструкцию: dataKey.
          dataKey="out"
          // Обрабатываем конструкцию: label.
          label={t("monitor.chart.out")}
          // Обрабатываем конструкцию: color.
          color={TRAFFIC_COLORS.out}
          // Обрабатываем конструкцию: isPaused.
          isPaused={isPaused}
          // Обрабатываем конструкцию: canvasRef.
          canvasRef={outboundRef}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
