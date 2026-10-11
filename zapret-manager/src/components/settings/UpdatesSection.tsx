import { useState } from "react";
import { RefreshCw, ShieldOff, X } from "lucide-react";

import BackupHistory from "@/components/updates/BackupHistory";
import { Badge, Button, Card, Input, Text, Toggle } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useUpdater } from "@/hooks/useUpdater";
import { formatVersion, isValidRepo } from "@/lib/updateUtils";
import {
  UPDATE_MAX_INTERVAL_HOURS,
  UPDATE_MIN_INTERVAL_HOURS,
} from "@/lib/constants";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useUpdateStore } from "@/stores/useUpdateStore";
import type { StrategyUpdateSettings } from "@/types";

function UpdatesSection() {
  const { t } = useI18n();
  const settings = useSettingsStore((state) => state.settings.strategyUpdates);
  const patch = useSettingsStore((state) => state.updateStrategyUpdates);
  const info = useUpdateStore((state) => state.info);
  const status = useUpdateStore((state) => state.status);
  const { check, openModal } = useUpdater();
  const [repoError, setRepoError] = useState<string | null>(null);

  const patchSetting = <K extends keyof StrategyUpdateSettings>(
    key: K,
    value: StrategyUpdateSettings[K]
  ): void => {
    patch({ [key]: value } as Partial<StrategyUpdateSettings>);
  };

  const handleRepoBlur = (): void => {
    setRepoError(
      isValidRepo(settings.githubRepo)
        ? null
        : t("settings.updates.repoInvalid")
    );
  };

  const handleIntervalChange = (value: string): void => {
    const parsed = Number.parseInt(value, 10);

    if (Number.isNaN(parsed)) {
      return;
    }

    patchSetting(
      "checkIntervalHours",
      Math.min(
        Math.max(parsed, UPDATE_MIN_INTERVAL_HOURS),
        UPDATE_MAX_INTERVAL_HOURS
      )
    );
  };

  return (
    <Card className="flex flex-col gap-5" padding="lg">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-primary text-lg font-semibold">
          {t("settings.updates.title")}
        </h2>
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.updates.description")}
        </Text>
      </div>

      <div className="text-text-secondary flex flex-wrap items-center gap-3 text-sm">
        <span>
          {t("settings.updates.current")}:{" "}
          <span className="text-text-primary font-mono">
            {formatVersion(info?.currentVersion ?? "unknown")}
          </span>
        </span>
        {info !== null ? (
          <Badge variant={info.available ? "accent" : "neutral"}>
            {info.available
              ? t("settings.updates.availableVersion", {
                  version: info.latestVersion,
                })
              : t("settings.updates.currentVersion", {
                  version: info.latestVersion,
                })}
          </Badge>
        ) : null}
        {status === "checking" ? (
          <Badge variant="neutral">{t("settings.updates.checking")}</Badge>
        ) : null}
      </div>

      <Toggle
        checked={settings.autoCheck}
        onChange={(value) => {
          patchSetting("autoCheck", value);
        }}
        label={t("settings.updates.autoCheck")}
        description={t("settings.updates.autoCheckHint")}
      />

      <div className="flex flex-wrap items-end gap-3">
        <Input
          label={t("settings.updates.interval")}
          type="number"
          min={UPDATE_MIN_INTERVAL_HOURS}
          max={UPDATE_MAX_INTERVAL_HOURS}
          value={String(settings.checkIntervalHours)}
          onChange={(event) => {
            handleIntervalChange(event.target.value);
          }}
        />
        <Button
          variant="secondary"
          onClick={() => {
            void check();
          }}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("settings.updates.checkNow")}
        </Button>
        <Button
          variant="ghost"
          onClick={openModal}
          disabled={info === null}
          icon={<ShieldOff aria-hidden="true" className="size-4" />}
        >
          {t("settings.updates.details")}
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <Input
          label={t("settings.updates.repo")}
          value={settings.githubRepo}
          error={repoError !== null}
          errorMessage={repoError ?? undefined}
          placeholder="Flowseal/zapret-discord-youtube"
          onChange={(event) => {
            patchSetting("githubRepo", event.target.value);
          }}
          onBlur={handleRepoBlur}
        />
        <Text variant="caption" size="sm" className="text-text-tertiary">
          {t("settings.updates.repoHint")}
        </Text>
      </div>

      <div className="flex flex-col gap-1">
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.updates.versionAutoBefore")}{" "}
          <span className="font-mono">.version</span>{" "}
          {t("settings.updates.versionAutoMiddle")}{" "}
          <span className="font-mono">service.bat</span>
          {t("settings.updates.versionAutoAfter")}
        </Text>
      </div>

      {settings.ignoredVersions.length > 0 ? (
        <div className="flex flex-col gap-2">
          <Text variant="body" size="sm" className="text-text-secondary">
            {t("settings.updates.ignored")}
          </Text>
          <div className="flex flex-wrap gap-2">
            {settings.ignoredVersions.map((version) => (
              <button
                key={version}
                type="button"
                onClick={() => {
                  patchSetting(
                    "ignoredVersions",
                    settings.ignoredVersions.filter((item) => item !== version)
                  );
                }}
                className="text-text-secondary hover:text-text-primary border-glass-border bg-glass-bg flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors"
              >
                {version}
                <X aria-hidden="true" className="size-3" />
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <Text variant="body" size="sm" className="text-text-secondary">
          {t("settings.updates.history")}
        </Text>
        <BackupHistory />
      </div>
    </Card>
  );
}

export default UpdatesSection;
