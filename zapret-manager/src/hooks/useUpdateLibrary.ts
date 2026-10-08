import { useCallback } from "react";

import { rescanStrategies } from "@/hooks/useUpdateActions";
import { toErrorMessage } from "@/lib/utils";
import * as commands from "@/lib/updateCommands";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useUpdateStore } from "@/stores/useUpdateStore";
import type { UpdateBackupInfo } from "@/types";

export interface UpdateLibraryActions {
  loadBackups: () => Promise<UpdateBackupInfo[]>;
  rollback: (backupPath: string) => Promise<void>;
  markCurrentVersion: (version: string) => Promise<void>;
  ignoreVersion: (version: string) => Promise<void>;
}

export function useUpdateLibrary(
  check: () => Promise<void>
): UpdateLibraryActions {
  const addLog = useLogsStore((state) => state.addLog);

  const loadBackups = useCallback(async (): Promise<UpdateBackupInfo[]> => {
    const folder = useSettingsStore.getState().settings.strategiesFolder;

    if (folder === "") {
      return [];
    }

    try {
      return await commands.fetchBackups(folder);
    } catch {
      return [];
    }
  }, []);

  const rollback = useCallback(
    async (backupPath: string) => {
      const folder = useSettingsStore.getState().settings.strategiesFolder;
      const state = useUpdateStore.getState();
      state.setStatus("installing");

      try {
        await commands.restoreBackup(backupPath, folder);
        await rescanStrategies(folder);
        state.setStatus("ready");

        addLog({
          level: "success",
          source: "system",
          message: "Возвращена предыдущая версия стратегий",
        });
      } catch (caught) {
        state.setError(toErrorMessage(caught));
        addLog({
          level: "error",
          source: "system",
          message: `Откат не удался: ${toErrorMessage(caught)}`,
        });
      }
    },
    [addLog]
  );

  const markCurrentVersion = useCallback(
    async (version: string) => {
      const folder = useSettingsStore.getState().settings.strategiesFolder;

      try {
        await commands.markVersion(folder, version);

        addLog({
          level: "info",
          source: "system",
          message: `Версия стратегий отмечена как ${version}`,
        });

        await check();
      } catch (caught) {
        const message = toErrorMessage(caught);
        useUpdateStore.getState().setError(message);
        addLog({
          level: "error",
          source: "system",
          message: `Не удалось отметить версию: ${message}`,
        });
      }
    },
    [addLog, check]
  );

  const ignoreVersion = useCallback(
    async (version: string) => {
      const { settings } = useSettingsStore.getState();
      const list = settings.strategyUpdates.ignoredVersions;

      if (!list.includes(version)) {
        useSettingsStore.getState().updateStrategyUpdates({
          ignoredVersions: [...list, version],
        });
      }

      const state = useUpdateStore.getState();
      state.closeModal();
      state.setStatus("up-to-date");
      state.setInfo(
        state.info === null
          ? null
          : { ...state.info, available: false, ignored: true }
      );

      addLog({
        level: "info",
        source: "system",
        message: `Версия ${version} добавлена в список игнорируемых`,
      });
    },
    [addLog]
  );

  return { loadBackups, rollback, markCurrentVersion, ignoreVersion };
}
