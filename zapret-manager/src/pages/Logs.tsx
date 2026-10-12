import { useI18n } from "@/i18n";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

import ClearLogsDialog from "@/components/logs/ClearLogsDialog";
import LogFilters from "@/components/logs/LogFilters";
import LogList, { type LogListHandle } from "@/components/logs/LogList";
import LogsEmptyState from "@/components/logs/LogsEmptyState";
import LogsToast, { type ToastTone } from "@/components/logs/LogsToast";
import ScrollToBottomButton from "@/components/logs/ScrollToBottomButton";
import { Heading, Text } from "@/components/ui";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { useDashboardStagger } from "@/hooks/useDashboardStagger";
import { COPY_TOAST_DURATION_MS } from "@/lib/constants";
import { formatLogLine } from "@/lib/format";
import { exportLogsToFile } from "@/lib/logExport";
import {
  useFilterActive,
  useFilteredLogs,
  useLogLevelCounts,
  useLogSourceCounts,
  useLogsCount,
} from "@/stores/selectors/useLogSelectors";
import {
  selectStrategies,
  useStrategiesStore,
} from "@/stores/useStrategiesStore";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { LogEntry } from "@/types";

interface ToastState {
  message: string | null;
  tone: ToastTone;
}

const EMPTY_TOAST: ToastState = { message: null, tone: "info" };

export default function Logs() {
  const { t } = useI18n();
  const logs = useFilteredLogs();
  const totalCount = useLogsCount();
  const logsEnabled = useSettingsStore(
    (state) => state.settings.general.enableLogs
  );
  const levelCounts = useLogLevelCounts();
  const sourceCounts = useLogSourceCounts();
  const filterActive = useFilterActive();
  const filter = useLogsStore((state) => state.filter);
  const setFilter = useLogsStore((state) => state.setFilter);
  const resetFilter = useLogsStore((state) => state.resetFilter);
  const clearLogs = useLogsStore((state) => state.clearLogs);
  const strategies = useStrategiesStore(selectStrategies);

  const [autoScroll, setAutoScroll] = useState(true);
  const [toast, setToast] = useState<ToastState>(EMPTY_TOAST);
  const listRef = useRef<LogListHandle>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const { copy } = useCopyToClipboard();

  useEffect(() => {
    return () => {
      if (toastTimer.current !== undefined) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string, tone: ToastTone) => {
    if (toastTimer.current !== undefined) {
      window.clearTimeout(toastTimer.current);
    }

    setToast({ message, tone });
    toastTimer.current = window.setTimeout(() => {
      setToast(EMPTY_TOAST);
      toastTimer.current = undefined;
    }, COPY_TOAST_DURATION_MS * 3);
  }, []);

  const handleCopy = useCallback(
    (entry: LogEntry) => {
      void copy(formatLogLine(entry))
        .then(() => {
          showToast(t("logs.toast.copied"), "success");
        })
        .catch(() => {
          showToast(t("logs.toast.copyFailed"), "error");
        });
    },
    [copy, showToast, t]
  );

  const handleExport = useCallback(() => {
    void exportLogsToFile(logs)
      .then((outcome) => {
        if (outcome.status === "cancelled") {
          return;
        }

        showToast(
          t("logs.toast.exported", { bytes: outcome.bytes }),
          "success"
        );
      })
      .catch((caught: unknown) => {
        showToast(
          t("logs.toast.exportFailed", { error: String(caught) }),
          "error"
        );
      });
  }, [logs, showToast, t]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleClear = useCallback(() => {
    clearLogs();
    resetFilter();
    setConfirmOpen(false);
    showToast(t("logs.toast.cleared"), "info");
  }, [clearLogs, resetFilter, showToast, t]);

  const handleScrollToBottom = useCallback(() => {
    setAutoScroll(true);
    listRef.current?.scrollToBottom();
  }, []);

  const { containerVariants, itemVariants } = useDashboardStagger();

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex min-h-0 flex-1 flex-col gap-3"
    >
      <motion.div variants={itemVariants} className="flex flex-col gap-1">
        <Heading level={1}>{t("logs.title")}</Heading>
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("logs.subtitle")}
        </Text>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="border-glass-border bg-glass-bg rounded-xl border p-3"
      >
        <LogFilters
          filter={filter}
          onChange={setFilter}
          onReset={resetFilter}
          levelCounts={levelCounts}
          sourceCounts={sourceCounts}
          strategyOptions={strategies.map((item) => ({
            id: item.id,
            name: item.name,
          }))}
          autoScroll={autoScroll}
          onAutoScrollChange={setAutoScroll}
          onExport={handleExport}
          onClear={() => {
            setConfirmOpen(true);
          }}
          canExport={logs.length > 0}
          filterActive={filterActive}
          totalCount={totalCount}
          shownCount={logs.length}
        />
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="border-glass-border bg-glass-bg relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border"
      >
        {totalCount === 0 ? (
          <LogsEmptyState variant={logsEnabled ? "empty" : "disabled"} />
        ) : logs.length === 0 ? (
          <LogsEmptyState variant="no-match" onReset={resetFilter} />
        ) : (
          <LogList
            ref={listRef}
            logs={logs}
            query={filter.search}
            autoScroll={autoScroll}
            onAutoScrollChange={setAutoScroll}
            onCopy={handleCopy}
          />
        )}

        <ScrollToBottomButton
          visible={!autoScroll && logs.length > 0}
          onClick={handleScrollToBottom}
        />

        <LogsToast message={toast.message} tone={toast.tone} />
      </motion.div>

      <ClearLogsDialog
        open={confirmOpen}
        totalCount={totalCount}
        onCancel={() => {
          setConfirmOpen(false);
        }}
        onConfirm={handleClear}
      />
    </motion.section>
  );
}
