import { lazy, Suspense, useState } from "react";

import {
  ClipboardCopy,
  ExternalLink,
  FolderOpen,
  RefreshCw,
  Scale,
} from "lucide-react";

import SectionContainer from "@/components/settings/SectionContainer";
import { Button, Text } from "@/components/ui";
import { useI18n } from "@/i18n";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { openFolder, useSystemInfo } from "@/hooks/useSystemInfo";
import { useUpdater } from "@/hooks/useUpdater";
import { useResourceInit } from "@/hooks/useResourceInit";
import { APP_NAME } from "@/lib/constants";
import { formatResourceVersion } from "@/lib/resources";
import { ABOUT_LINKS } from "@/lib/settingsConstants";
import { formatOsLabel, formatSystemInfo } from "@/lib/systemInfo";
import { formatVersion } from "@/lib/updateUtils";
import { openExternalUrl } from "@/lib/userCommands";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";

const LicensesModal = lazy(
  async () => await import("@/components/settings/LicensesModal")
);

function AboutSection() {
  const { t } = useI18n();
  const { info } = useSystemInfo();
  const { check } = useUpdater();
  const { copy, copied } = useCopyToClipboard(2500);
  const logs = useLogsStore((state) => state.logs);
  const strategies = useStrategiesStore((state) => state.strategies);
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const [licensesOpen, setLicensesOpen] = useState(false);
  const { version: resourcesVersion } = useResourceInit();

  const rows =
    info === null
      ? []
      : [
          [t("settings.about.os"), formatOsLabel(info)],
          [t("settings.about.arch"), info.arch],
          [t("settings.about.webview"), info.webviewVersion],
          [t("settings.about.tauri"), info.tauriVersion],
          [t("settings.about.rust"), info.rustVersion],
        ];

  return (
    <SectionContainer
      title={t("settings.about.title")}
      description={t("settings.about.description")}
    >
      <div className="flex items-center gap-4 py-3">
        <div className="text-accent-primary font-display text-2xl font-bold">
          {APP_NAME}
        </div>
        <div className="text-text-secondary font-mono text-sm">
          {formatVersion(info?.appVersion ?? "0.0.0")}
        </div>
      </div>

      <div className="flex flex-col gap-1 py-3">
        <Text variant="label" className="text-text-primary">
          {t("settings.about.system")}
        </Text>
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-text-secondary">{label}</span>
            <span className="text-text-primary font-mono">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 py-3">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => {
            void check();
          }}
          icon={<RefreshCw aria-hidden="true" className="size-4" />}
        >
          {t("settings.about.checkUpdates")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void openFolder("logs", folder).catch(() => undefined);
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("settings.about.openLogs")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            void openFolder("config", folder).catch(() => undefined);
          }}
          icon={<FolderOpen aria-hidden="true" className="size-4" />}
        >
          {t("settings.about.openConfig")}
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
          {t("settings.about.openStrategies")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setLicensesOpen(true);
          }}
          icon={<Scale aria-hidden="true" className="size-4" />}
        >
          {t("settings.about.licenses")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          disabled={info === null}
          onClick={() => {
            if (info !== null) {
              void copy(formatSystemInfo(info, logs, strategies));
            }
          }}
          icon={<ClipboardCopy aria-hidden="true" className="size-4" />}
        >
          {copied ? t("settings.common.saved") : t("settings.about.copyInfo")}
        </Button>
      </div>

      <Text variant="caption" size="sm" className="text-text-tertiary">
        {t("settings.resources.welcomeVersion").replace(
          "{version}",
          formatResourceVersion(resourcesVersion)
        )}
      </Text>

      <div className="flex flex-wrap gap-2 py-3">
        {ABOUT_LINKS.map((link) => (
          <Button
            key={link.id}
            size="sm"
            variant="ghost"
            onClick={() => {
              void openExternalUrl(link.url).catch(() => undefined);
            }}
            icon={<ExternalLink aria-hidden="true" className="size-4" />}
          >
            {t(link.labelKey)}
          </Button>
        ))}
      </div>

      <Suspense fallback={null}>
        <LicensesModal
          open={licensesOpen}
          onClose={() => {
            setLicensesOpen(false);
          }}
        />
      </Suspense>
    </SectionContainer>
  );
}

export default AboutSection;
