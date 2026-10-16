import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { FolderOpen, RefreshCw, RotateCcw } from "lucide-react";

import { Button, Modal, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import * as commands from "@/lib/resourceCommands";
import {
  describeIntegrityReport,
  formatResourceVersion,
  shortKey,
} from "@/lib/resources";
import { toErrorMessage } from "@/lib/utils";
import { useResourceInit } from "@/hooks/useResourceInit";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { IntegrityReport, RestoreReport } from "@/types";

function ResourcesSection() {
  const { t } = useI18n();
  const { version, integrity, checkIntegrity } = useResourceInit();
  const addLog = useLogsStore((state) => state.addLog);
  const [busy, setBusy] = useState<"check" | "restore" | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [report, setReport] = useState<RestoreReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async (): Promise<void> => {
    setBusy("check");
    setError(null);

    const result = await checkIntegrity();

    if (result === null) {
      setError(t("settings.resources.check"));
    }

    setBusy(null);
  };

  const handleRestore = async (): Promise<void> => {
    setBusy("restore");
    setConfirm(false);
    setError(null);

    try {
      const result = await commands.restoreBundled();

      setReport(result);
      addLog({
        level: "success",
        source: "system",
        message: t("settings.resources.restoredLog", {
          count: result.restored,
        }),
      });
    } catch (caught) {
      setError(toErrorMessage(caught));
    } finally {
      setBusy(null);
    }
  };

  const handleOpenFolder = async (): Promise<void> => {
    setError(null);

    try {
      const strategiesDir =
        useSettingsStore.getState().settings.strategiesFolder;

      await invoke("open_folder", {
        kind: "config",
        strategiesDir,
      });
    } catch (caught) {
      setError(toErrorMessage(caught));
    }
  };

  return (
    <div className="flex flex-col gap-4 py-2">
      <Row
        label={t("settings.resources.title")}
        value={formatResourceVersion(version, t)}
      />
      <Row
        label={t("settings.resources.location")}
        value={t("settings.resources.locationHint")}
      />

      {integrity !== null ? <IntegrityLine report={integrity} /> : null}

      {report !== null ? (
        <Text variant="caption" size="sm" className="text-accent-primary">
          {t("settings.resources.restored").replace(
            "{count}",
            String(report.restored)
          )}
          {" · "}
          {t("settings.resources.restoreSkipped").replace(
            "{count}",
            String(report.skipped)
          )}
        </Text>
      ) : null}

      {error !== null ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          {error}
        </Text>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={busy !== null}
          onClick={() => {
            void handleCheck();
          }}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {busy === "check"
            ? t("settings.resources.checking")
            : t("settings.resources.check")}
        </Button>

        <Button
          size="sm"
          variant="ghost"
          disabled={busy !== null}
          onClick={() => {
            void handleOpenFolder();
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("settings.resources.openFolder")}
        </Button>

        <Button
          size="sm"
          variant="danger"
          disabled={busy !== null}
          onClick={() => {
            setConfirm(true);
          }}
          icon={<RotateCcw aria-hidden="true" className="size-4" />}
        >
          {busy === "restore"
            ? t("settings.resources.restoring")
            : t("settings.resources.restore")}
        </Button>
      </div>

      <Modal
        open={confirm}
        onClose={() => {
          setConfirm(false);
        }}
        title={t("settings.resources.restoreTitle")}
        description={t("settings.resources.restoreHint")}
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setConfirm(false);
              }}
            >
              {t("settings.common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                void handleRestore();
              }}
            >
              {t("settings.resources.restoreConfirm")}
            </Button>
          </>
        }
      >
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.resources.restoreHint")}
        </Text>
      </Modal>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-text-tertiary shrink-0">{label}</span>
      <span className="text-text-primary min-w-0 truncate text-right font-mono text-xs">
        {value}
      </span>
    </div>
  );
}

function IntegrityLine({ report }: { report: IntegrityReport }) {
  const { t } = useI18n();
  const sample = [...report.missing, ...report.modified].slice(0, 3);

  return (
    <div className="flex flex-col gap-1">
      <Text
        variant="caption"
        size="sm"
        className={report.ok ? "text-accent-primary" : "text-accent-danger"}
      >
        {describeIntegrityReport(report, t)}
      </Text>
      {sample.length > 0 ? (
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {sample.map(shortKey).join(", ")}
        </Text>
      ) : null}
    </div>
  );
}

export default ResourcesSection;
