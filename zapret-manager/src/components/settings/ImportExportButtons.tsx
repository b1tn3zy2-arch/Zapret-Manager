import { useState } from "react";
import { Download, Upload } from "lucide-react";

import { Button, Modal, Text } from "@/components/ui";
import { createTranslate } from "@/i18n";
import { exportSettings, importSettings } from "@/lib/settingsExport";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { AppSettings } from "@/types";

function ImportExportButtons() {
  const [pending, setPending] = useState<AppSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const language = useSettingsStore((state) => state.settings.general.language);
  const replaceSettings = useSettingsStore((state) => state.replaceSettings);
  const addLog = useLogsStore((state) => state.addLog);
  const t = createTranslate(language);

  const runExport = async (): Promise<void> => {
    setBusy(true);

    try {
      const saved = await exportSettings(useSettingsStore.getState().settings);

      if (saved) {
        addLog({
          level: "success",
          source: "user",
          message: "Настройки выгружены в файл",
        });
      }
    } catch (caught) {
      const message = toErrorMessage(caught);
      setError(message);
      addLog({
        level: "error",
        source: "user",
        message: `Экспорт не удался: ${message}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const pickImport = async (): Promise<void> => {
    setBusy(true);
    setError(null);

    try {
      const imported = await importSettings();

      if (imported !== null) {
        setPending(imported);
      }
    } catch (caught) {
      const message = toErrorMessage(caught);
      setError(message);
      addLog({
        level: "error",
        source: "user",
        message: `Импорт не удался: ${message}`,
      });
    } finally {
      setBusy(false);
    }
  };

  const applyImport = (): void => {
    if (pending === null) {
      return;
    }

    replaceSettings(pending);
    setPending(null);
    addLog({
      level: "success",
      source: "user",
      message: "Настройки загружены из файла",
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          variant="secondary"
          loading={busy}
          disabled={busy}
          onClick={() => {
            void runExport();
          }}
          icon={<Download aria-hidden="true" className="size-4" />}
        >
          {t("settings.common.export")}
        </Button>

        <Button
          size="sm"
          variant="secondary"
          loading={busy}
          disabled={busy}
          onClick={() => {
            void pickImport();
          }}
          icon={<Upload aria-hidden="true" className="size-4" />}
        >
          {t("settings.common.import")}
        </Button>

        {error !== null ? (
          <Text variant="caption" size="sm" className="text-accent-danger">
            {error}
          </Text>
        ) : null}
      </div>

      <Modal
        open={pending !== null}
        onClose={() => {
          setPending(null);
        }}
        title="Перезаписать настройки?"
        description="Текущие настройки будут заменены содержимым файла. Папка со стратегиями и последняя стратегия останутся как есть."
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
              }}
            >
              Отмена
            </Button>
            <Button variant="primary" onClick={applyImport}>
              Импортировать
            </Button>
          </>
        }
      >
        <Text variant="body" size="sm" className="text-text-secondary">
          Импортируется раздел «Стратегии», «Обновления», «Общие», «Внешний
          вид», «Продвинутые», «VPN» и «Outlast Trials». Список игнорируемых
          версий и время последней проверки остаются прежними.
        </Text>
      </Modal>
    </>
  );
}

export default ImportExportButtons;
