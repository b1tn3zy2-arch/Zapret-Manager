import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import DangerZone from "@/components/settings/DangerZone";
import Dropdown from "@/components/settings/Dropdown";
import EditableList from "@/components/settings/EditableList";
import ResourcesSection from "@/components/settings/ResourcesSection";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import { Button, Input, Text, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import { LOG_LEVEL_LABELS, LOG_LEVEL_VALUES } from "@/lib/constants";
import {
  MAX_LOG_RETENTION_DAYS,
  MIN_LOG_RETENTION_DAYS,
} from "@/lib/settingsSchema";
import { verifyConfigs } from "@/hooks/useSystemInfo";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ConfigCheckReport, LogLevel } from "@/types";

const LEVEL_OPTIONS = LOG_LEVEL_VALUES.map((level) => ({
  value: level,
  label: LOG_LEVEL_LABELS[level],
}));

function clampRetention(value: string): number {
  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed)) {
    return MIN_LOG_RETENTION_DAYS;
  }

  return Math.min(
    Math.max(parsed, MIN_LOG_RETENTION_DAYS),
    MAX_LOG_RETENTION_DAYS
  );
}

function ReportText({ report }: { report: ConfigCheckReport }) {
  const problems =
    report.emptyFiles.length + report.duplicates.length + report.invalid.length;

  if (problems === 0) {
    return (
      <Text variant="body" size="sm" className="text-accent-primary">
        Проверено {report.checked}: проблем не найдено
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Text variant="body" size="sm" className="text-text-secondary">
        Проверено {report.checked}, замечаний {problems}
      </Text>
      {report.emptyFiles.length > 0 ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          Пустые: {report.emptyFiles.join(", ")}
        </Text>
      ) : null}
      {report.duplicates.length > 0 ? (
        <Text variant="caption" size="sm" className="text-amber-400">
          Дубликаты: {report.duplicates.slice(0, 8).join(", ")}
        </Text>
      ) : null}
      {report.invalid.length > 0 ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          Некорректные: {report.invalid.slice(0, 8).join(", ")}
        </Text>
      ) : null}
    </div>
  );
}

function AdvancedSection() {
  const { t } = useI18n();
  const advanced = useSettingsStore((state) => state.settings.advanced);
  const updateAdvanced = useSettingsStore((state) => state.updateAdvanced);
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const addLog = useLogsStore((state) => state.addLog);

  const [report, setReport] = useState<ConfigCheckReport | null>(null);

  const runVerify = async (): Promise<void> => {
    if (folder === "") {
      return;
    }

    try {
      setReport(await verifyConfigs(folder));
    } catch (caught) {
      addLog({
        level: "error",
        source: "user",
        message: `Проверка не удалась: ${toErrorMessage(caught)}`,
      });
    }
  };

  return (
    <SectionContainer
      title={t("settings.advanced.title")}
      description={t("settings.advanced.description")}
    >
      <SettingRow
        label={t("settings.advanced.loggingLevel")}
        control={
          <Dropdown
            label={t("settings.advanced.loggingLevel")}
            value={advanced.loggingLevel}
            options={LEVEL_OPTIONS}
            onChange={(loggingLevel: LogLevel) => {
              updateAdvanced({ loggingLevel });
            }}
          />
        }
      />

      <SettingRow
        label={t("settings.advanced.logRetention")}
        control={
          <Input
            variant="filled"
            type="number"
            min={MIN_LOG_RETENTION_DAYS}
            max={MAX_LOG_RETENTION_DAYS}
            value={String(advanced.logRetentionDays)}
            aria-label={t("settings.advanced.logRetention")}
            onChange={(event) => {
              updateAdvanced({
                logRetentionDays: clampRetention(event.target.value),
              });
            }}
          />
        }
      />

      <div className="py-3">
        <EditableList
          items={advanced.winwsExtraArgs}
          onChange={(winwsExtraArgs) => {
            updateAdvanced({
              winwsExtraArgs: winwsExtraArgs.filter(
                (item) => item.trim() !== ""
              ),
            });
          }}
          label={t("settings.advanced.extraArgs")}
          placeholder="--dpi-desync=fake"
          addLabel="Добавить аргумент"
          emptyMessage="Аргументы не заданы — используются штатные значения"
          validate={(value) =>
            value.trim() === "" || value.startsWith(" ")
              ? "Пробел в начале"
              : null
          }
        />
        <Text variant="caption" size="sm" className="text-text-tertiary mt-2">
          {t("settings.advanced.extraArgsHint")}
        </Text>
      </div>

      <SettingRow
        label={t("settings.advanced.disableUpdate")}
        description={t("settings.advanced.disableUpdateHint")}
        control={
          <Toggle
            ariaLabel={t("settings.advanced.disableUpdate")}
            checked={advanced.disableUpdateCheck}
            onChange={(disableUpdateCheck) => {
              updateAdvanced({ disableUpdateCheck });
            }}
          />
        }
      />

      <div className="flex flex-col gap-3 py-3">
        <Button
          size="sm"
          variant="secondary"
          disabled={folder === ""}
          onClick={() => {
            void runVerify();
          }}
          icon={<AlertTriangle aria-hidden="true" className="size-4" />}
        >
          {t("settings.advanced.verify")}
        </Button>
        {report !== null ? <ReportText report={report} /> : null}
      </div>

      <ResourcesSection />

      <DangerZone />
    </SectionContainer>
  );
}

export default AdvancedSection;
