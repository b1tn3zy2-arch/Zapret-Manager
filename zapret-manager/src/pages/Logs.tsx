// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// Импортируем зависимости из модуля framer-motion.
import { motion } from "framer-motion";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/logs/ClearLogsDialog.
import ClearLogsDialog from "@/components/logs/ClearLogsDialog";
// Импортируем зависимости из модуля @/components/logs/LogFilters.
import LogFilters from "@/components/logs/LogFilters";
// Импортируем зависимости из модуля @/components/logs/LogList.
import LogList, { type LogListHandle } from "@/components/logs/LogList";
// Импортируем зависимости из модуля @/components/logs/LogsEmptyState.
import LogsEmptyState from "@/components/logs/LogsEmptyState";
// Импортируем зависимости из модуля @/components/logs/LogsToast.
import LogsToast, { type ToastTone } from "@/components/logs/LogsToast";
// Импортируем зависимости из модуля @/components/logs/ScrollToBottomButton.
import ScrollToBottomButton from "@/components/logs/ScrollToBottomButton";
// Импортируем зависимости из модуля @/components/ui.
import { Heading, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/hooks/useCopyToClipboard.
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
// Импортируем зависимости из модуля @/hooks/useDashboardStagger.
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
// Импортируем зависимости из модуля @/lib/constants.
import { COPY_TOAST_DURATION_MS } from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/format.
import { formatLogLine } from "@/lib/format";
// Импортируем зависимости из модуля @/lib/logExport.
import { exportLogsToFile } from "@/lib/logExport";
// Импортируем зависимости из модуля @/stores/selectors/useLogSelectors.
import {
  // Подключаем именованный импорт useFilterActive.
  useFilterActive,
  // Подключаем именованный импорт useFilteredLogs.
  useFilteredLogs,
  // Подключаем именованный импорт useLogLevelCounts.
  useLogLevelCounts,
  // Подключаем именованный импорт useLogSourceCounts.
  useLogSourceCounts,
  // Подключаем именованный импорт useLogsCount.
  useLogsCount,
  // Закрываем текущий блок.
} from "@/stores/selectors/useLogSelectors";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import {
  // Подключаем именованный импорт selectStrategies.
  selectStrategies,
  // Подключаем именованный импорт useStrategiesStore.
  useStrategiesStore,
  // Закрываем текущий блок.
} from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { LogEntry } from "@/types";
// — разделитель логических блоков —

// Объявляем интерфейс ToastState с контрактом данных.
interface ToastState {
  // Обрабатываем конструкцию: message.
  message: string | null;
  // Обрабатываем конструкцию: tone.
  tone: ToastTone;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: const EMPTY_TOAST: ToastState = { message: null, tone: ….
const EMPTY_TOAST: ToastState = { message: null, tone: "info" };
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export default function Logs() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const logs = useFilteredLogs().
  const logs = useFilteredLogs();
  // Обрабатываем конструкцию: const totalCount = useLogsCount().
  const totalCount = useLogsCount();
  // Обрабатываем конструкцию: const logsEnabled = useSettingsStore( (state) => state.….
  const logsEnabled = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.general.enableLogs
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const levelCounts = useLogLevelCounts().
  const levelCounts = useLogLevelCounts();
  // Обрабатываем конструкцию: const sourceCounts = useLogSourceCounts().
  const sourceCounts = useLogSourceCounts();
  // Обрабатываем конструкцию: const filterActive = useFilterActive().
  const filterActive = useFilterActive();
  // Обрабатываем конструкцию: const filter = useLogsStore((state) => state.filter).
  const filter = useLogsStore((state) => state.filter);
  // Обрабатываем конструкцию: const setFilter = useLogsStore((state) => state.setFilt….
  const setFilter = useLogsStore((state) => state.setFilter);
  // Обрабатываем конструкцию: const resetFilter = useLogsStore((state) => state.reset….
  const resetFilter = useLogsStore((state) => state.resetFilter);
  // Обрабатываем конструкцию: const clearLogs = useLogsStore((state) => state.clearLo….
  const clearLogs = useLogsStore((state) => state.clearLogs);
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [autoScroll, setAutoScroll] = useState(true).
  const [autoScroll, setAutoScroll] = useState(true);
  // Обрабатываем конструкцию: const [toast, setToast] = useState<ToastState>(EMPTY_TO….
  const [toast, setToast] = useState<ToastState>(EMPTY_TOAST);
  // Обрабатываем конструкцию: const listRef = useRef<LogListHandle>(null).
  const listRef = useRef<LogListHandle>(null);
  // Обрабатываем конструкцию: const toastTimer = useRef<number | undefined>(undefined….
  const toastTimer = useRef<number | undefined>(undefined);
  // Обрабатываем конструкцию: const { copy } = useCopyToClipboard().
  const { copy } = useCopyToClipboard();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Возвращаем результат: () => { if (toastTimer.current !== undefined) { window.….
    return () => {
      // Проверяем бизнес-условие: toastTimer.current !== undefined.
      if (toastTimer.current !== undefined) {
        // Обрабатываем конструкцию: window.
        window.clearTimeout(toastTimer.current);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const showToast = useCallback((message: string, tone: T….
  const showToast = useCallback((message: string, tone: ToastTone) => {
    // Проверяем бизнес-условие: toastTimer.current !== undefined.
    if (toastTimer.current !== undefined) {
      // Обрабатываем конструкцию: window.
      window.clearTimeout(toastTimer.current);
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setToast.
    setToast({ message, tone });
    // Обрабатываем конструкцию: toastTimer.
    toastTimer.current = window.setTimeout(() => {
      // Обрабатываем конструкцию: setToast.
      setToast(EMPTY_TOAST);
      // Обрабатываем конструкцию: toastTimer.
      toastTimer.current = undefined;
      // Закрываем текущий блок.
    }, COPY_TOAST_DURATION_MS * 3);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleCopy = useCallback( (entry: LogEntry) => { ….
  const handleCopy = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (entry: LogEntry) => {
      // Обрабатываем конструкцию: void copy(formatLogLine(entry)) .then(() => { showToast….
      void copy(formatLogLine(entry))
        // Продолжаем цепочку вызовов.
        .then(() => {
          // Обрабатываем конструкцию: showToast.
          showToast(t("logs.toast.copied"), "success");
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .catch(() => {
          // Обрабатываем конструкцию: showToast.
          showToast(t("logs.toast.copyFailed"), "error");
          // Закрываем текущий блок.
        });
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [copy, showToast, t]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleExport = useCallback(() => { void exportLog….
  const handleExport = useCallback(() => {
    // Обрабатываем конструкцию: void exportLogsToFile(logs) .then((outcome) => { if (ou….
    void exportLogsToFile(logs)
      // Продолжаем цепочку вызовов.
      .then((outcome) => {
        // Проверяем бизнес-условие: outcome.status === cancelled.
        if (outcome.status === "cancelled") {
          // Завершаем функцию без возвращаемого значения.
          return;
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: showToast.
        showToast(
          // Обрабатываем конструкцию: t.
          t("logs.toast.exported", { bytes: outcome.bytes }),
          // Обрабатываем конструкцию: success.
          "success"
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch((caught: unknown) => {
        // Обрабатываем конструкцию: showToast.
        showToast(
          // Обрабатываем конструкцию: t.
          t("logs.toast.exportFailed", { error: String(caught) }),
          // Обрабатываем конструкцию: error.
          "error"
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      });
    // Закрываем текущий блок.
  }, [logs, showToast, t]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const [confirmOpen, setConfirmOpen] = useState(false).
  const [confirmOpen, setConfirmOpen] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleClear = useCallback(() => { clearLogs(); re….
  const handleClear = useCallback(() => {
    // Обрабатываем конструкцию: clearLogs.
    clearLogs();
    // Обрабатываем конструкцию: resetFilter.
    resetFilter();
    // Обрабатываем конструкцию: setConfirmOpen.
    setConfirmOpen(false);
    // Обрабатываем конструкцию: showToast.
    showToast(t("logs.toast.cleared"), "info");
    // Закрываем текущий блок.
  }, [clearLogs, resetFilter, showToast, t]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleScrollToBottom = useCallback(() => { setAut….
  const handleScrollToBottom = useCallback(() => {
    // Обрабатываем конструкцию: setAutoScroll.
    setAutoScroll(true);
    // Обрабатываем конструкцию: listRef.
    listRef.current?.scrollToBottom();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const { containerVariants, itemVariants } = useDashboar….
  const { containerVariants, itemVariants } = useDashboardStagger();
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
      className="flex min-h-0 flex-1 flex-col gap-3"
      // Продолжаем выражение.
    >
      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        {/* Выводим текстовое содержимое в JSX. */}
        <Heading level={1}>{t("logs.title")}</Heading>
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("logs.subtitle")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: variants.
        variants={itemVariants}
        // Обрабатываем конструкцию: className.
        className="border-glass-border bg-glass-bg rounded-xl border p-3"
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <LogFilters
          // Обрабатываем конструкцию: filter.
          filter={filter}
          // Обрабатываем конструкцию: onChange.
          onChange={setFilter}
          // Обрабатываем конструкцию: onReset.
          onReset={resetFilter}
          // Обрабатываем конструкцию: levelCounts.
          levelCounts={levelCounts}
          // Обрабатываем конструкцию: sourceCounts.
          sourceCounts={sourceCounts}
          // Обрабатываем конструкцию: strategyOptions.
          strategyOptions={strategies.map((item) => ({
            // Обрабатываем конструкцию: id.
            id: item.id,
            // Обрабатываем конструкцию: name.
            name: item.name,
            // Закрываем текущий блок.
          }))}
          // Обрабатываем конструкцию: autoScroll.
          autoScroll={autoScroll}
          // Обрабатываем конструкцию: onAutoScrollChange.
          onAutoScrollChange={setAutoScroll}
          // Обрабатываем конструкцию: onExport.
          onExport={handleExport}
          // Обрабатываем конструкцию: onClear.
          onClear={() => {
            // Обрабатываем конструкцию: setConfirmOpen.
            setConfirmOpen(true);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: canExport.
          canExport={logs.length > 0}
          // Обрабатываем конструкцию: filterActive.
          filterActive={filterActive}
          // Обрабатываем конструкцию: totalCount.
          totalCount={totalCount}
          // Обрабатываем конструкцию: shownCount.
          shownCount={logs.length}
          // Продолжаем выражение.
        />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <motion.div
        // Обрабатываем конструкцию: variants.
        variants={itemVariants}
        // Обрабатываем конструкцию: className.
        className="border-glass-border bg-glass-bg relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {totalCount === 0 ? (
          // Рендерим самозакрывающийся элемент LogsEmptyState.
          <LogsEmptyState variant={logsEnabled ? "empty" : "disabled"} />
        ) : // Закрываем выражение или список аргументов.
        // Продолжаем предыдущую конструкцию.
        logs.length === 0 ? (
          // Рендерим самозакрывающийся элемент LogsEmptyState.
          <LogsEmptyState variant="no-match" onReset={resetFilter} />
        ) : (
          // Продолжаем предыдущую конструкцию.
          // Закрываем выражение или список аргументов.
          // Рендерим самозакрывающийся элемент LogList.
          <LogList
            // Обрабатываем конструкцию: ref.
            ref={listRef}
            // Обрабатываем конструкцию: logs.
            logs={logs}
            // Обрабатываем конструкцию: query.
            query={filter.search}
            // Обрабатываем конструкцию: autoScroll.
            autoScroll={autoScroll}
            // Обрабатываем конструкцию: onAutoScrollChange.
            onAutoScrollChange={setAutoScroll}
            // Обрабатываем конструкцию: onCopy.
            onCopy={handleCopy}
            // Продолжаем выражение.
          />
          // Закрываем выражение или список аргументов.
        )}
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <ScrollToBottomButton
          // Обрабатываем конструкцию: visible.
          visible={!autoScroll && logs.length > 0}
          // Обрабатываем конструкцию: onClick.
          onClick={handleScrollToBottom}
          // Продолжаем выражение.
        />
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <LogsToast message={toast.message} tone={toast.tone} />
        {/* Выводим текстовое содержимое в JSX. */}
      </motion.div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <ClearLogsDialog
        // Обрабатываем конструкцию: open.
        open={confirmOpen}
        // Обрабатываем конструкцию: totalCount.
        totalCount={totalCount}
        // Обрабатываем конструкцию: onCancel.
        onCancel={() => {
          // Обрабатываем конструкцию: setConfirmOpen.
          setConfirmOpen(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: onConfirm.
        onConfirm={handleClear}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
    </motion.section>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
