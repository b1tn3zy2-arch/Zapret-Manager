import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import DangerZone from "@/components/settings/DangerZone";
import EditableList from "@/components/settings/EditableList";
import ResourcesSection from "@/components/settings/ResourcesSection";
import SectionContainer from "@/components/settings/SectionContainer";
import SettingRow from "@/components/settings/SettingRow";
import { Button, Input, Text, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import {
  MAX_LOG_RETENTION_DAYS,
  MIN_LOG_RETENTION_DAYS,
} from "@/lib/settingsSchema";
import { verifyConfigs } from "@/hooks/useSystemInfo";
import { cn, toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { ConfigCheckReport } from "@/types";

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
  const { t } = useI18n();
  const problems =
    report.emptyFiles.length + report.duplicates.length + report.invalid.length;

  if (problems === 0) {
    return (
      <Text variant="body" size="sm" className="text-accent-primary">
        {t("settings.advanced.verifyOk", { checked: report.checked })}
      </Text>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <Text variant="body" size="sm" className="text-text-secondary">
        {t("settings.advanced.verifyProblems", {
          checked: report.checked,
          problems,
        })}
      </Text>
      {report.emptyFiles.length > 0 ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          {t("settings.advanced.verifyEmptyFiles", {
            list: report.emptyFiles.join(", "),
          })}
        </Text>
      ) : null}
      {report.duplicates.length > 0 ? (
        <Text variant="caption" size="sm" className="text-accent-warning">
          {t("settings.advanced.verifyDuplicates", {
            list: report.duplicates.slice(0, 8).join(", "),
          })}
        </Text>
      ) : null}
      {report.invalid.length > 0 ? (
        <Text variant="caption" size="sm" className="text-accent-danger">
          {t("settings.advanced.verifyInvalid", {
            list: report.invalid.slice(0, 8).join(", "),
          })}
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
        message: t("settings.common.verifyFailed", {
          error: toErrorMessage(caught),
        }),
      });
    }
  };

  return (
    <SectionContainer
      title={t("settings.advanced.title")}
      description={t("settings.advanced.description")}
    >
      <SettingRow
        label={t("settings.advanced.engine.title")}
        description={t("settings.advanced.engine.description")}
        control={
          <div
            role="radiogroup"
            aria-label={t("settings.advanced.engine.title")}
            className="flex items-center gap-2"
          >
            {(["native", "legacy"] as const).map((value) => {
              const active = advanced.strategyEngine === value;

              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => {
                    updateAdvanced({ strategyEngine: value });
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    active
                      ? "border-accent-primary/40 bg-accent-primary/10 text-accent-primary"
                      : "border-glass-border text-text-secondary hover:text-text-primary"
                  )}
                >
                  {t(
                    value === "native"
                      ? "settings.advanced.engine.native"
                      : "settings.advanced.engine.legacy"
                  )}
                </button>
              );
            })}
          </div>
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
          addLabel={t("settings.advanced.addArgument")}
          emptyMessage={t("settings.advanced.noArgs")}
          validate={(value) =>
            value.trim() === "" || value.startsWith(" ")
              ? t("settings.advanced.leadingSpace")
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
