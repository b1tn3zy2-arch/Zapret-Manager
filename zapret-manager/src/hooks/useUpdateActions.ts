import { translateKey } from "@/i18n/core";
import { useCallback, useEffect, useRef } from "react";

import { toErrorMessage } from "@/lib/utils";
import * as commands from "@/lib/updateCommands";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useUpdateStore } from "@/stores/useUpdateStore";

export interface UpdateTransferActions {
  check: () => Promise<void>;
  download: () => Promise<void>;
  install: () => Promise<void>;
  cancel: () => Promise<void>;
}

export async function rescanStrategies(folder: string): Promise<void> {
  if (folder === "") {
    return;
  }

  try {
    const strategies = await commands.scanStrategies(folder);
    useStrategiesStore.getState().setStrategies(strategies);
  } catch {
    return;
  }
}

export function useUpdateActions(): UpdateTransferActions {
  const addLog = useLogsStore((state) => state.addLog);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const check = useCallback(async () => {
    const { settings } = useSettingsStore.getState();

    if (settings.strategiesFolder === "") {
      return;
    }

    const state = useUpdateStore.getState();
    state.setStatus("checking");
    state.setError(null);

    try {
      const info = await commands.requestUpdateCheck(
        settings.strategyUpdates.githubRepo,
        settings.strategyUpdates.ignoredVersions,
        settings.strategiesFolder
      );

      if (!mountedRef.current) {
        return;
      }

      state.setInfo(info);
      state.setStatus(info.available ? "available" : "up-to-date");

      useSettingsStore.getState().updateStrategyUpdates({
        lastCheckAt: Date.now(),
      });

      addLog({
        level: info.available ? "info" : "success",
        source: "system",
        message: info.available
          ? translateKey("log.updateAvailable", {
              from: info.currentVersion,
              to: info.latestVersion,
            })
          : translateKey("log.updateUpToDate", { version: info.latestVersion }),
      });
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }

      state.setError(toErrorMessage(caught));
      addLog({
        level: "error",
        source: "system",
        message: translateKey("log.updateCheckFailed", {
          error: toErrorMessage(caught),
        }),
      });
    }
  }, [addLog]);

  const download = useCallback(async () => {
    const info = useUpdateStore.getState().info;

    if (info === null || info.downloadUrl === "") {
      return;
    }

    const state = useUpdateStore.getState();
    state.setStatus("downloading");
    state.setProgress(null);
    state.setError(null);

    try {
      const archivePath = await commands.downloadArchive(
        info.downloadUrl,
        info.latestVersion
      );

      useUpdateStore.getState().setArchive(archivePath);
      useUpdateStore.getState().setStatus("downloaded");

      addLog({
        level: "success",
        source: "system",
        message: translateKey("log.updateDownloaded", { name: info.assetName }),
      });
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }

      state.setError(toErrorMessage(caught));
      addLog({
        level: "error",
        source: "system",
        message: translateKey("log.updateDownloadFailed", {
          error: toErrorMessage(caught),
        }),
      });
    }
  }, [addLog]);

  const install = useCallback(async () => {
    const archivePath = useUpdateStore.getState().archivePath;

    if (archivePath === null) {
      return;
    }

    const info = useUpdateStore.getState().info;
    const { settings } = useSettingsStore.getState();
    const state = useUpdateStore.getState();
    state.setStatus("installing");
    state.setError(null);

    try {
      const report = await commands.installArchive(
        archivePath,
        settings.strategiesFolder,
        info?.latestVersion ?? ""
      );

      if (!mountedRef.current) {
        return;
      }

      state.setReport(report);
      state.setStatus("ready");
      state.setArchive(null);

      if (info !== null) {
        state.setInfo({
          ...info,
          currentVersion: report.version,
          available: false,
        });
      }

      await rescanStrategies(settings.strategiesFolder);
      useSettingsStore.getState().updateStrategyUpdates({
        ignoredVersions: settings.strategyUpdates.ignoredVersions.filter(
          (item) => item !== report.version
        ),
      });

      addLog({
        level: "success",
        source: "system",
        message:
          translateKey("log.updateInstalled", {
            version: report.version,
            count: report.files,
          }) +
          (report.preservedEntries > 0
            ? translateKey("log.updatePreserved", {
                count: report.preservedEntries,
              })
            : "") +
          (report.checkUpdatesDisabled
            ? translateKey("log.updateZapretOff")
            : ""),
      });
    } catch (caught) {
      if (!mountedRef.current) {
        return;
      }

      state.setError(toErrorMessage(caught));
      addLog({
        level: "error",
        source: "system",
        message: translateKey("log.updateInstallFailed", {
          error: toErrorMessage(caught),
        }),
      });
    }
  }, [addLog]);

  const cancel = useCallback(async () => {
    try {
      await commands.cancelDownload();
    } catch (caught) {
      const message = toErrorMessage(caught);
      useUpdateStore.getState().setError(message);
      addLog({
        level: "error",
        source: "system",
        message: translateKey("log.updateCancelFailed", { error: message }),
      });
    }
  }, [addLog]);

  return { check, download, install, cancel };
}
