import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { BackupInfo, InjectionReport } from "@/types";

export interface UseOutlastInjectorResult {
  isInjecting: boolean;
  inject: (strategyPath: string) => Promise<InjectionReport | null>;
  restore: (strategyPath: string) => Promise<number>;
  listBackups: (strategyPath: string) => Promise<BackupInfo[]>;
  restoreFromBackup: (
    strategyPath: string,
    timestamp?: number
  ) => Promise<number>;
}

export function useOutlastInjector(): UseOutlastInjectorResult {
  const [isInjecting, setIsInjecting] = useState(false);
  const addLog = useLogsStore((state) => state.addLog);
  const settings = useSettingsStore((state) => state.settings);

  const config = settings.outlastTrials;

  const inject = useCallback(
    async (strategyPath: string): Promise<InjectionReport | null> => {
      if (domainsAreEmpty(config.domains) && config.ipRanges.length === 0) {
        addLog({
          level: "warn",
          source: "user",
          message: "Outlast Trials: список доменов пуст, инъекция пропущена",
        });

        return null;
      }

      setIsInjecting(true);

      try {
        const report = await invoke<InjectionReport>("inject_outlast", {
          strategyPath,
          domains: config.domains,
          ips: config.ipRanges,
          ports: config.ports,
          createBackupFlag: config.createBackup,
        });

        logReport(report, addLog);
        return report;
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Outlast Trials: инъекция не выполнена — ${toErrorMessage(caught)}`,
        });

        return null;
      } finally {
        setIsInjecting(false);
      }
    },
    [addLog, config.createBackup, config.domains, config.ipRanges, config.ports]
  );

  const restore = useCallback(
    async (strategyPath: string): Promise<number> => {
      try {
        const cleaned = await invoke<number>("restore_backup", {
          strategyPath,
        });

        if (cleaned > 0) {
          addLog({
            level: "info",
            source: "user",
            message: `Outlast Trials: секция удалена из ${cleaned} конфигов`,
          });
        }

        return cleaned;
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Outlast Trials: не удалось убрать секцию — ${toErrorMessage(caught)}`,
        });

        return 0;
      }
    },
    [addLog]
  );

  const listBackups = useCallback(
    async (strategyPath: string): Promise<BackupInfo[]> => {
      try {
        return await invoke<BackupInfo[]>("list_backups", { strategyPath });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Не удалось получить список бэкапов: ${toErrorMessage(caught)}`,
        });

        return [];
      }
    },
    [addLog]
  );

  const restoreFromBackup = useCallback(
    async (strategyPath: string, timestamp?: number): Promise<number> => {
      try {
        const restored = await invoke<number>("restore_from_backup", {
          strategyPath,
          backupTimestamp: timestamp ?? null,
        });

        addLog({
          level: "info",
          source: "user",
          message: `Outlast Trials: восстановлено конфигов — ${restored}`,
        });

        return restored;
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Не удалось восстановить из бэкапа: ${toErrorMessage(caught)}`,
        });

        return 0;
      }
    },
    [addLog]
  );

  return { isInjecting, inject, restore, listBackups, restoreFromBackup };
}

function domainsAreEmpty(domains: string[]): boolean {
  return domains.every((domain) => domain.trim() === "");
}

function logReport(
  report: InjectionReport,
  addLog: (entry: {
    level: "info" | "warn" | "error";
    source: "user";
    message: string;
  }) => void
): void {
  const total = report.domainsAdded + report.ipsAdded;

  if (total === 0) {
    addLog({
      level: "info",
      source: "user",
      message: `Outlast Trials: новых записей нет, конфиги не изменены (пропущено дубликатов: ${report.skippedDuplicates})`,
    });
    return;
  }

  addLog({
    level: "info",
    source: "user",
    message: `Outlast Trials: добавлено доменов ${report.domainsAdded}, IP ${report.ipsAdded} в ${report.filesModified.length} конфигов (пропущено дубликатов: ${report.skippedDuplicates})`,
  });

  if (report.rejectedEntries > 0) {
    addLog({
      level: "warn",
      source: "user",
      message: `Outlast Trials: отклонено некорректных записей — ${report.rejectedEntries}`,
    });
  }

  for (const backup of report.backupsCreated) {
    addLog({
      level: "info",
      source: "user",
      message: `Outlast Trials: создан бэкап ${backup}`,
    });
  }

  if (report.portsAccepted > 0) {
    addLog({
      level: "warn",
      source: "user",
      message: `Outlast Trials: порты (${report.portsAccepted}) не записаны — winws берёт их из аргументов .bat, а .bat не изменяется`,
    });
  }
}
