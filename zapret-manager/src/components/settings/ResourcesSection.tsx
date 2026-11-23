// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля lucide-react.
import { FolderOpen, RefreshCw, RotateCcw } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { useI18n } from "@/i18n";
// Импортируем зависимости из модуля @/lib/resourceCommands.
import * as commands from "@/lib/resourceCommands";
// Импортируем зависимости из модуля @/lib/resources.
import {
  // Подключаем именованный импорт describeIntegrityReport.
  describeIntegrityReport,
  // Подключаем именованный импорт formatResourceVersion.
  formatResourceVersion,
  // Подключаем именованный импорт shortKey.
  shortKey,
  // Закрываем текущий блок.
} from "@/lib/resources";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/hooks/useResourceInit.
import { useResourceInit } from "@/hooks/useResourceInit";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { IntegrityReport, RestoreReport } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию ResourcesSection.
function ResourcesSection() {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const { version, integrity, checkIntegrity } = useResou….
  const { version, integrity, checkIntegrity } = useResourceInit();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const [busy, setBusy] = useState<check | restore | null….
  const [busy, setBusy] = useState<"check" | "restore" | null>(null);
  // Обрабатываем конструкцию: const [confirm, setConfirm] = useState(false).
  const [confirm, setConfirm] = useState(false);
  // Обрабатываем конструкцию: const [report, setReport] = useState<RestoreReport | nu….
  const [report, setReport] = useState<RestoreReport | null>(null);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleCheck = async (): Promise<void> => { setBus….
  const handleCheck = async (): Promise<void> => {
    // Обрабатываем конструкцию: setBusy.
    setBusy("check");
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const result = await checkIntegrity().
    const result = await checkIntegrity();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: result === null.
    if (result === null) {
      // Обрабатываем конструкцию: setError.
      setError(t("settings.resources.check"));
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setBusy.
    setBusy(null);
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleRestore = async (): Promise<void> => { setB….
  const handleRestore = async (): Promise<void> => {
    // Обрабатываем конструкцию: setBusy.
    setBusy("restore");
    // Обрабатываем конструкцию: setConfirm.
    setConfirm(false);
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const result = await commands.restoreBundled().
      const result = await commands.restoreBundled();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setReport.
      setReport(result);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: t("settings.resources.restoredLog", {
          // Обрабатываем конструкцию: count.
          count: result.restored,
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setBusy.
      setBusy(null);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const handleOpenFolder = async (): Promise<void> => { s….
  const handleOpenFolder = async (): Promise<void> => {
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const strategiesDir = useSettingsStore.getState().setti….
      const strategiesDir =
        // Обрабатываем конструкцию: useSettingsStore.
        useSettingsStore.getState().settings.strategiesFolder;
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await secureInvoke(open_folder, { kind: confi….
      await secureInvoke("open_folder", {
        // Обрабатываем конструкцию: kind.
        kind: "config",
        // Передаём поле strategiesDir в объект.
        strategiesDir,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: setError.
      setError(toErrorMessage(caught));
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-4 py-2> <Row label={….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-4 py-2>.
    <div className="flex flex-col gap-4 py-2">
      {/* Выводим текстовое содержимое в JSX. */}
      <Row
        // Обрабатываем конструкцию: label.
        label={t("settings.resources.title")}
        // Обрабатываем конструкцию: value.
        value={formatResourceVersion(version, t)}
        // Продолжаем выражение.
      />
      {/* Выводим текстовое содержимое в JSX. */}
      <Row
        // Обрабатываем конструкцию: label.
        label={t("settings.resources.location")}
        // Обрабатываем конструкцию: value.
        value={t("settings.resources.locationHint")}
        // Продолжаем выражение.
      />
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {integrity !== null ? <IntegrityLine report={integrity} /> : null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {report !== null ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-pri….
        <Text variant="caption" size="sm" className="text-accent-primary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.restored").replace(
            // Обрабатываем конструкцию: {count}.
            "{count}",
            // Обрабатываем конструкцию: String.
            String(report.restored)
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
          {" · "}
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.restoreSkipped").replace(
            // Обрабатываем конструкцию: {count}.
            "{count}",
            // Обрабатываем конструкцию: String.
            String(report.skipped)
            // Закрываем выражение или список аргументов.
          )}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      {error !== null ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-accent-dan….
        <Text variant="caption" size="sm" className="text-accent-danger">
          {/* Выводим текстовое содержимое в JSX. */}
          {error}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: disabled.
          disabled={busy !== null}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void handleCheck().
            void handleCheck();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {busy === "check"
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.resources.checking")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              t("settings.resources.check")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="ghost"
          // Обрабатываем конструкцию: disabled.
          disabled={busy !== null}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void handleOpenFolder().
            void handleOpenFolder();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.openFolder")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="danger"
          // Обрабатываем конструкцию: disabled.
          disabled={busy !== null}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: setConfirm.
            setConfirm(true);
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<RotateCcw aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {busy === "restore"
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              t("settings.resources.restoring")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              t("settings.resources.restore")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={confirm}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setConfirm.
          setConfirm(false);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: title.
        title={t("settings.resources.restoreTitle")}
        // Обрабатываем конструкцию: description.
        description={t("settings.resources.restoreHint")}
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: footer.
        footer={
          // Обрабатываем конструкцию: <>.
          <>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="ghost"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: setConfirm.
                setConfirm(false);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.common.cancel")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button
              // Обрабатываем конструкцию: variant.
              variant="danger"
              // Обрабатываем конструкцию: onClick.
              onClick={() => {
                // Обрабатываем конструкцию: void handleRestore().
                void handleRestore();
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.resources.restoreConfirm")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
          </>
          // Закрываем текущий блок.
        }
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        <Text variant="body" size="sm" className="text-text-secondary">
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.resources.restoreHint")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </Modal>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию Row.
function Row({ label, value }: { label: string; value: string }) {
  // Возвращаем результат: ( <div className=flex items-center justify-between gap-….
  return (
    // Обрабатываем конструкцию: <div className=flex items-center justify-between gap-3 ….
    <div className="flex items-center justify-between gap-3 text-sm">
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-tertiary shrink-0">{label}</span>
      {/* Выводим текстовое содержимое в JSX. */}
      <span className="text-text-primary min-w-0 truncate text-right font-mono text-xs">
        {/* Выводим текстовое содержимое в JSX. */}
        {value}
        {/* Выводим текстовое содержимое в JSX. */}
      </span>
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию IntegrityLine.
function IntegrityLine({ report }: { report: IntegrityReport }) {
  // Обрабатываем конструкцию: const { t } = useI18n().
  const { t } = useI18n();
  // Обрабатываем конструкцию: const sample = [...report.missing, ...report.modified].….
  const sample = [...report.missing, ...report.modified].slice(0, 3);
  // — разделитель логических блоков —

  // Возвращаем результат: ( <div className=flex flex-col gap-1> <Text variant=cap….
  return (
    // Обрабатываем конструкцию: <div className=flex flex-col gap-1>.
    <div className="flex flex-col gap-1">
      {/* Выводим текстовое содержимое в JSX. */}
      <Text
        // Обрабатываем конструкцию: variant.
        variant="caption"
        // Обрабатываем конструкцию: size.
        size="sm"
        // Обрабатываем конструкцию: className.
        className={report.ok ? "text-accent-primary" : "text-accent-danger"}
        // Продолжаем выражение.
      >
        {/* Выводим текстовое содержимое в JSX. */}
        {describeIntegrityReport(report, t)}
        {/* Выводим текстовое содержимое в JSX. */}
      </Text>
      {/* Выводим текстовое содержимое в JSX. */}
      {sample.length > 0 ? (
        // Обрабатываем конструкцию: <Text variant=caption size=sm className=text-text-terti….
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {/* Выводим текстовое содержимое в JSX. */}
          {sample.map(shortKey).join(", ")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
      ) : // Закрываем выражение или список аргументов.
      // Продолжаем предыдущую конструкцию.
      null}
      {/* Выводим текстовое содержимое в JSX. */}
    </div>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default ResourcesSection;.
export default ResourcesSection;
// — разделитель логических блоков —
