import { useState } from "react";
import { FolderOpen, FolderSearch, RefreshCw } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";

import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import { Button, Input } from "@/components/ui";
import { useI18n } from "@/i18n";
import { openFolder } from "@/hooks/useSystemInfo";
import { useFolderPicker } from "@/hooks/useFolderPicker";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import type { Strategy } from "@/types";

import { MAX_TIMEOUT_SEC, MIN_TIMEOUT_SEC } from "@/lib/settingsSchema";

function clampTimeout(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return MIN_TIMEOUT_SEC;
  }

  return Math.min(Math.max(parsed, MIN_TIMEOUT_SEC), MAX_TIMEOUT_SEC);
}

function StrategiesSection() {
  const { t } = useI18n();
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const advanced = useSettingsStore((state) => state.settings.advanced);
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  const setStrategies = useStrategiesStore((state) => state.setStrategies);
  const addLog = useLogsStore((state) => state.addLog);
  const { pickFolder } = useFolderPicker();

  const [busy, setBusy] = useState(false);

  const rescan = async (): Promise<void> => {
    if (folder === "") {
      return;
    }

    setBusy(true);
    addLog({
      level: "info",
      source: "system",
      message: "Пересканирование стратегий…",
    });

    try {
      const strategies = await invoke<Strategy[]>("scan_strategies", {
        folder,
      });
      setStrategies(strategies);
      addLog({
        level: "success",
        source: "system",
        message: `Найдено стратегий: ${strategies.length}`,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SectionContainer
      title={t("settings.strategies.title")}
      description={t("settings.strategies.description")}
      onReset={() => {
        updateAdvanced({
          strategyStartTimeoutSec: 15,
          strategyStopTimeoutSec: 10,
        });
      }}
      resetLabel={t("settings.common.resetSection")}
    >
      <SettingRow
        stacked
        label={t("settings.strategies.folder")}
        control={
          <div className="flex flex-col gap-2">
            <Input
              variant="filled"
              value={folder}
              readOnly
              placeholder="C:\\zapret-discord-youtube"
              aria-label={t("settings.strategies.folder")}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void pickFolder();
                }}
                icon={<FolderSearch aria-hidden="true" className="size-4" />}
              >
                {t("settings.strategies.choose")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={folder === ""}
                loading={busy}
                onClick={() => {
                  void rescan();
                }}
                icon={<RefreshCw aria-hidden="true" className="size-4" />}
              >
                {t("settings.strategies.rescan")}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={folder === ""}
                onClick={() => {
                  void openFolder("strategies", folder).catch(() => undefined);
                }}
                icon={<FolderOpen aria-hidden="true" className="size-4" />}
              >
                {t("settings.common.openFolder")}
              </Button>
            </div>
          </div>
        }
      />

      <SettingRow
        label={t("settings.strategies.startTimeout")}
        control={
          <Input
            variant="filled"
            type="number"
            min={MIN_TIMEOUT_SEC}
            max={MAX_TIMEOUT_SEC}
            value={String(advanced.strategyStartTimeoutSec)}
            aria-label={t("settings.strategies.startTimeout")}
            onChange={(event) => {
              updateAdvanced({
                strategyStartTimeoutSec: clampTimeout(event.target.value),
              });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.strategies.stopTimeout")}
        control={
          <Input
            variant="filled"
            type="number"
            min={MIN_TIMEOUT_SEC}
            max={MAX_TIMEOUT_SEC}
            value={String(advanced.strategyStopTimeoutSec)}
            aria-label={t("settings.strategies.stopTimeout")}
            onChange={(event) => {
              updateAdvanced({
                strategyStopTimeoutSec: clampTimeout(event.target.value),
              });
            }}
          />
        }
      />
    </SectionContainer>
  );
}

export default StrategiesSection;
