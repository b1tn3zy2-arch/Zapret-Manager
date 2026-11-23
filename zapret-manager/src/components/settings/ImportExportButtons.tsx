// Импортируем зависимости из модуля react.
import { useState } from "react";
// Импортируем зависимости из модуля lucide-react.
import { Download, Upload } from "lucide-react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/components/ui.
import { Button, Modal, Text } from "@/components/ui";
// Импортируем зависимости из модуля @/i18n.
import { createTranslate } from "@/i18n";
// Импортируем зависимости из модуля @/lib/settingsExport.
import { exportSettings, importSettings } from "@/lib/settingsExport";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { AppSettings } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию ImportExportButtons.
function ImportExportButtons() {
  // Обрабатываем конструкцию: const [pending, setPending] = useState<AppSettings | nu….
  const [pending, setPending] = useState<AppSettings | null>(null);
  // Обрабатываем конструкцию: const [error, setError] = useState<string | null>(null).
  const [error, setError] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [busy, setBusy] = useState(false).
  const [busy, setBusy] = useState(false);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const language = useSettingsStore((state) => state.sett….
  const language = useSettingsStore((state) => state.settings.general.language);
  // Обрабатываем конструкцию: const replaceSettings = useSettingsStore((state) => sta….
  const replaceSettings = useSettingsStore((state) => state.replaceSettings);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const t = createTranslate(language).
  const t = createTranslate(language);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const runExport = async (): Promise<void> => { setBusy(….
  const runExport = async (): Promise<void> => {
    // Обрабатываем конструкцию: setBusy.
    setBusy(true);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const saved = await exportSettings(useSettingsStore.get….
      const saved = await exportSettings(useSettingsStore.getState().settings);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: saved.
      if (saved) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: t("settings.importExport.exported"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = toErrorMessage(caught).
      const message = toErrorMessage(caught);
      // Обрабатываем конструкцию: setError.
      setError(message);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: t("settings.importExport.exportFailed", { error: message }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setBusy.
      setBusy(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const pickImport = async (): Promise<void> => { setBusy….
  const pickImport = async (): Promise<void> => {
    // Обрабатываем конструкцию: setBusy.
    setBusy(true);
    // Обрабатываем конструкцию: setError.
    setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const imported = await importSettings().
      const imported = await importSettings();
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: imported !== null.
      if (imported !== null) {
        // Обрабатываем конструкцию: setPending.
        setPending(imported);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = toErrorMessage(caught).
      const message = toErrorMessage(caught);
      // Обрабатываем конструкцию: setError.
      setError(message);
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: t("settings.importExport.importFailed", { error: message }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } finally {
      // Обрабатываем конструкцию: setBusy.
      setBusy(false);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const applyImport = (): void => { if (pending === null)….
  const applyImport = (): void => {
    // Проверяем бизнес-условие: pending === null.
    if (pending === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: replaceSettings.
    replaceSettings(pending);
    // Обрабатываем конструкцию: setPending.
    setPending(null);
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "success",
      // Обрабатываем конструкцию: source.
      source: "user",
      // Обрабатываем конструкцию: message.
      message: t("settings.importExport.loaded"),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Возвращаем результат: ( <> <div className=flex flex-wrap items-center gap-2> ….
  return (
    // Обрабатываем конструкцию: <>.
    <>
      {/* Выводим текстовое содержимое в JSX. */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: loading.
          loading={busy}
          // Обрабатываем конструкцию: disabled.
          disabled={busy}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void runExport().
            void runExport();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<Download aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.common.export")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
        {/* — разделитель логических блоков — */}

        {/* Выводим текстовое содержимое в JSX. */}
        <Button
          // Обрабатываем конструкцию: size.
          size="sm"
          // Обрабатываем конструкцию: variant.
          variant="secondary"
          // Обрабатываем конструкцию: loading.
          loading={busy}
          // Обрабатываем конструкцию: disabled.
          disabled={busy}
          // Обрабатываем конструкцию: onClick.
          onClick={() => {
            // Обрабатываем конструкцию: void pickImport().
            void pickImport();
            // Закрываем текущий блок.
          }}
          // Обрабатываем конструкцию: icon.
          icon={<Upload aria-hidden="true" className="size-4" />}
          // Продолжаем выражение.
        >
          {/* Выводим текстовое содержимое в JSX. */}
          {t("settings.common.import")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Button>
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
        {/* Выводим текстовое содержимое в JSX. */}
      </div>
      {/* — разделитель логических блоков — */}

      {/* Выводим текстовое содержимое в JSX. */}
      <Modal
        // Обрабатываем конструкцию: open.
        open={pending !== null}
        // Обрабатываем конструкцию: onClose.
        onClose={() => {
          // Обрабатываем конструкцию: setPending.
          setPending(null);
          // Закрываем текущий блок.
        }}
        // Обрабатываем конструкцию: title.
        title={t("settings.importExport.confirmTitle")}
        // Обрабатываем конструкцию: description.
        description={t("settings.importExport.confirmDesc")}
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
                // Обрабатываем конструкцию: setPending.
                setPending(null);
                // Закрываем текущий блок.
              }}
              // Продолжаем выражение.
            >
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.common.cancel")}
              {/* Выводим текстовое содержимое в JSX. */}
            </Button>
            {/* Выводим текстовое содержимое в JSX. */}
            <Button variant="primary" onClick={applyImport}>
              {/* Выводим текстовое содержимое в JSX. */}
              {t("settings.importExport.importAction")}
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
          {t("settings.importExport.importerNote")}
          {/* Выводим текстовое содержимое в JSX. */}
        </Text>
        {/* Выводим текстовое содержимое в JSX. */}
      </Modal>
      {/* Выводим текстовое содержимое в JSX. */}
    </>
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export default ImportExportButtons;.
export default ImportExportButtons;
// — разделитель логических блоков —
