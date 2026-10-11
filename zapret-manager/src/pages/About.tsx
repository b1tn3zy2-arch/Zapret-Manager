import { lazy, Suspense, useCallback, useState } from "react";

import AboutActions from "@/components/about/AboutActions";
import AboutIdentity from "@/components/about/AboutIdentity";
import AboutSystemCard from "@/components/about/AboutSystemCard";
import { useI18n } from "@/i18n";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { openFolder, useSystemInfo } from "@/hooks/useSystemInfo";
import { useUpdater } from "@/hooks/useUpdater";
import { useResourceInit } from "@/hooks/useResourceInit";
import { formatResourceVersion } from "@/lib/resources";
import { formatSystemInfo } from "@/lib/systemInfo";
import { formatVersion } from "@/lib/updateUtils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";

const LicensesModal = lazy(
  async () => await import("@/components/settings/LicensesModal")
);

type OpenFolderKind = "logs" | "config" | "strategies";

export default function About() {
  const { t } = useI18n();
  const { info } = useSystemInfo();
  const { check } = useUpdater();
  const { copy, copied } = useCopyToClipboard(2500);
  const logs = useLogsStore((state) => state.logs);
  const strategies = useStrategiesStore((state) => state.strategies);
  const folder = useSettingsStore((state) => state.settings.strategiesFolder);
  const [licensesOpen, setLicensesOpen] = useState(false);
  const { version: resourcesVersion } = useResourceInit();

  const handleOpenFolder = useCallback(
    (kind: OpenFolderKind): void => {
      void openFolder(kind, folder).catch(() => undefined);
    },
    [folder]
  );

  const handleCopyInfo = useCallback((): void => {
    if (info !== null) {
      void copy(formatSystemInfo(info, logs, strategies));
    }
  }, [copy, info, logs, strategies]);

  const resourcesLabel = t("settings.resources.welcomeVersion")
    .replace("{version}", "")
    .trim();

  return (
    <div className="flex flex-col gap-6 pb-8">
      <AboutIdentity
        appVersion={formatVersion(info?.appVersion ?? "0.0.0")}
        resourcesVersion={formatResourceVersion(resourcesVersion, t)}
        resourcesLabel={resourcesLabel}
      />

      <AboutSystemCard info={info} t={t} />

      <AboutActions
        canOpenStrategies={folder !== ""}
        canCopyInfo={info !== null}
        copied={copied}
        onCheckUpdates={() => {
          void check();
        }}
        onOpenFolder={handleOpenFolder}
        onOpenLicenses={() => {
          setLicensesOpen(true);
        }}
        onCopyInfo={handleCopyInfo}
        t={t}
      />

      <Suspense fallback={null}>
        <LicensesModal
          open={licensesOpen}
          onClose={() => {
            setLicensesOpen(false);
          }}
        />
      </Suspense>
    </div>
  );
}
