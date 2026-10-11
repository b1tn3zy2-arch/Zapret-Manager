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
          message: t("settings.importExport.exported"),
        });
      }
    } catch (caught) {
      const message = toErrorMessage(caught);
      setError(message);
      addLog({
        level: "error",
        source: "user",
        message: t("settings.importExport.exportFailed", { error: message }),
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
        message: t("settings.importExport.importFailed", { error: message }),
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
      message: t("settings.importExport.loaded"),
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
        title={t("settings.importExport.confirmTitle")}
        description={t("settings.importExport.confirmDesc")}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setPending(null);
              }}
            >
              {t("settings.common.cancel")}
            </Button>
            <Button variant="primary" onClick={applyImport}>
              {t("settings.importExport.importAction")}
            </Button>
          </>
        }
      >
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.importExport.importerNote")}
        </Text>
      </Modal>
    </>
  );
}

export default ImportExportButtons;
