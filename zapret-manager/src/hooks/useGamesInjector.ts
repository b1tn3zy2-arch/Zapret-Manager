import { invoke } from "@tauri-apps/api/core";
import { useCallback, useState } from "react";

import { enabledGames } from "@/lib/gameUtils";
import { toErrorMessage } from "@/lib/utils";
import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { BackupInfo, GameSettings, InjectionReport } from "@/types";

export interface GamesInjectionSummary {
  reports: { game: GameSettings; report: InjectionReport }[];
  totalDomains: number;
  totalIps: number;
}

export interface UseGamesInjectorResult {
  isInjecting: boolean;
  injectAll: (strategyPath: string) => Promise<GamesInjectionSummary | null>;
  restoreAll: (strategyPath: string) => Promise<number>;
  listBackups: (strategyPath: string) => Promise<BackupInfo[]>;
}

export function useGamesInjector(): UseGamesInjectorResult {
  const [isInjecting, setIsInjecting] = useState(false);
  const addLog = useLogsStore((state) => state.addLog);
  const games = useSettingsStore((state) => state.settings.games);

  const injectAll = useCallback(
    async (strategyPath: string): Promise<GamesInjectionSummary | null> => {
      const active = enabledGames(games);

      if (active.length === 0) {
        return { reports: [], totalDomains: 0, totalIps: 0 };
      }

      setIsInjecting(true);

      const summary: GamesInjectionSummary = {
        reports: [],
        totalDomains: 0,
        totalIps: 0,
      };

      try {
        for (const game of active) {
          try {
            const report = await invoke<InjectionReport>("inject_outlast", {
              strategyPath,
              domains: game.domains,
              ips: game.ipRanges,
              ports: game.ports,
              createBackupFlag: game.createBackup,
            });

            summary.reports.push({ game, report });
            summary.totalDomains += report.domainsAdded;
            summary.totalIps += report.ipsAdded;

            logReport(game, report, addLog);
          } catch (caught) {
            addLog({
              level: "error",
              source: "user",
              message: `${game.name}: инъекция не выполнена — ${toErrorMessage(caught)}`,
            });

            return null;
          }
        }

        addLog({
          level: "info",
          source: "user",
          message: `Инъекция завершена: ${active
            .map((game) => game.name)
            .join(", ")} — всего ${summary.totalDomains} доменов и ${
            summary.totalIps
          } IP`,
        });

        return summary;
      } finally {
        setIsInjecting(false);
      }
    },
    [addLog, games]
  );

  const restoreAll = useCallback(
    async (strategyPath: string): Promise<number> => {
      try {
        return await invoke<number>("restore_backup", { strategyPath });
      } catch (caught) {
        addLog({
          level: "error",
          source: "user",
          message: `Не удалось убрать секции — ${toErrorMessage(caught)}`,
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

  return { isInjecting, injectAll, restoreAll, listBackups };
}

function logReport(
  game: GameSettings,
  report: InjectionReport,
  addLog: ReturnType<typeof useLogsStore.getState>["addLog"]
): void {
  const total = report.domainsAdded + report.ipsAdded;

  if (total === 0) {
    addLog({
      level: "info",
      source: "user",
      message: `${game.name}: новых записей нет (пропущено дубликатов: ${report.skippedDuplicates})`,
    });
    return;
  }

  addLog({
    level: "info",
    source: "user",
    message: `${game.name}: доменов ${report.domainsAdded}, IP ${report.ipsAdded} в ${report.filesModified.length} конфигов`,
  });

  if (report.rejectedEntries > 0) {
    addLog({
      level: "warn",
      source: "user",
      message: `${game.name}: отклонено некорректных записей — ${report.rejectedEntries}`,
    });
  }
}
