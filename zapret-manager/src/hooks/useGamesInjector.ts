// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useCallback, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/gameUtils.
import { enabledGames } from "@/lib/gameUtils";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { BackupInfo, GameSettings, InjectionReport } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GamesInjectionSummary {
  // Обрабатываем конструкцию: reports.
  reports: { game: GameSettings; report: InjectionReport }[];
  // Обрабатываем конструкцию: totalDomains.
  totalDomains: number;
  // Обрабатываем конструкцию: totalIps.
  totalIps: number;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseGamesInjectorResult {
  // Обрабатываем конструкцию: isInjecting.
  isInjecting: boolean;
  // Обрабатываем конструкцию: injectAll.
  injectAll: (strategyPath: string) => Promise<GamesInjectionSummary | null>;
  // Обрабатываем конструкцию: restoreAll.
  restoreAll: (strategyPath: string) => Promise<number>;
  // Обрабатываем конструкцию: listBackups.
  listBackups: (strategyPath: string) => Promise<BackupInfo[]>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useGamesInjector(): UseGamesInjectorResult {
  // Обрабатываем конструкцию: const [isInjecting, setIsInjecting] = useState(false).
  const [isInjecting, setIsInjecting] = useState(false);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const games = useSettingsStore((state) => state.setting….
  const games = useSettingsStore((state) => state.settings.games);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const injectAll = useCallback( async (strategyPath: str….
  const injectAll = useCallback(
    // Обрабатываем конструкцию: async.
    async (strategyPath: string): Promise<GamesInjectionSummary | null> => {
      // Обрабатываем конструкцию: const active = enabledGames(games).
      const active = enabledGames(games);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: active.length === 0.
      if (active.length === 0) {
        // Возвращаем результат: { reports: [], totalDomains: 0, totalIps: 0 }.
        return { reports: [], totalDomains: 0, totalIps: 0 };
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setIsInjecting.
      setIsInjecting(true);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const summary: GamesInjectionSummary = { reports: [], t….
      const summary: GamesInjectionSummary = {
        // Обрабатываем конструкцию: reports.
        reports: [],
        // Обрабатываем конструкцию: totalDomains.
        totalDomains: 0,
        // Обрабатываем конструкцию: totalIps.
        totalIps: 0,
        // Закрываем текущий блок.
      };
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Перебираем элементы коллекции active.
        for (const game of active) {
          // Пробуем выполнить блок с обработкой ошибок.
          try {
            // Обрабатываем конструкцию: const report = await secureInvoke<InjectionReport>( inj….
            const report = await secureInvoke<InjectionReport>(
              // Обрабатываем конструкцию: inject_outlast.
              "inject_outlast",
              // Открываем объектный литерал.
              {
                // Передаём поле strategyPath в объект.
                strategyPath,
                // Обрабатываем конструкцию: domains.
                domains: game.domains,
                // Обрабатываем конструкцию: ips.
                ips: game.ipRanges,
                // Обрабатываем конструкцию: ports.
                ports: game.ports,
                // Обрабатываем конструкцию: createBackupFlag.
                createBackupFlag: game.createBackup,
                // Закрываем текущий блок.
              }
              // Закрываем выражение или список аргументов.
            );
            // — разделитель логических блоков —

            // Обрабатываем конструкцию: summary.
            summary.reports.push({ game, report });
            // Обрабатываем конструкцию: summary.
            summary.totalDomains += report.domainsAdded;
            // Обрабатываем конструкцию: summary.
            summary.totalIps += report.ipsAdded;
            // — разделитель логических блоков —

            // Обрабатываем конструкцию: logReport.
            logReport(game, report, addLog);
            // Закрываем текущий блок.
          } catch (caught) {
            // Обрабатываем конструкцию: addLog.
            addLog({
              // Обрабатываем конструкцию: level.
              level: "error",
              // Обрабатываем конструкцию: source.
              source: "user",
              // Обрабатываем конструкцию: message.
              message: translateKey("log.injectFailed", {
                // Обрабатываем конструкцию: name.
                name: game.name,
                // Обрабатываем конструкцию: error.
                error: toErrorMessage(caught),
                // Закрываем текущий блок.
              }),
              // Закрываем текущий блок.
            });
            // — разделитель логических блоков —

            // Возвращаем результат: null.
            return null;
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.injectDone", {
            // Обрабатываем конструкцию: names.
            names: active.map((game) => game.name).join(", "),
            // Обрабатываем конструкцию: domains.
            domains: summary.totalDomains,
            // Обрабатываем конструкцию: ips.
            ips: summary.totalIps,
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Возвращаем результат: summary.
        return summary;
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: setIsInjecting.
        setIsInjecting(false);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, games]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const restoreAll = useCallback( async (strategyPath: st….
  const restoreAll = useCallback(
    // Обрабатываем конструкцию: async.
    async (strategyPath: string): Promise<number> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Возвращаем результат: await secureInvoke<number>(restore_backup, { strategyPa….
        return await secureInvoke<number>("restore_backup", { strategyPath });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.restoreFailed", {
            // Обрабатываем конструкцию: error.
            error: toErrorMessage(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Возвращаем результат: 0.
        return 0;
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const listBackups = useCallback( async (strategyPath: s….
  const listBackups = useCallback(
    // Обрабатываем конструкцию: async.
    async (strategyPath: string): Promise<BackupInfo[]> => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Возвращаем результат: await secureInvoke<BackupInfo[]>(list_backups, { strate….
        return await secureInvoke<BackupInfo[]>("list_backups", {
          // Передаём поле strategyPath в объект.
          strategyPath,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.backupsFailed", {
            // Обрабатываем конструкцию: error.
            error: toErrorMessage(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Возвращаем результат: [].
        return [];
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { isInjecting, injectAll, restoreAll, listBackups }.
  return { isInjecting, injectAll, restoreAll, listBackups };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию logReport.
function logReport(
  // Обрабатываем конструкцию: game.
  game: GameSettings,
  // Обрабатываем конструкцию: report.
  report: InjectionReport,
  // Обрабатываем конструкцию: addLog.
  addLog: ReturnType<typeof useLogsStore.getState>["addLog"]
  // Закрываем выражение или список аргументов.
): void {
  // Обрабатываем конструкцию: const total = report.domainsAdded + report.ipsAdded.
  const total = report.domainsAdded + report.ipsAdded;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: total === 0.
  if (total === 0) {
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "info",
      // Обрабатываем конструкцию: source.
      source: "user",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.noNewEntries", {
        // Обрабатываем конструкцию: name.
        name: game.name,
        // Обрабатываем конструкцию: count.
        count: report.skippedDuplicates,
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    });
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: addLog.
  addLog({
    // Обрабатываем конструкцию: level.
    level: "info",
    // Обрабатываем конструкцию: source.
    source: "user",
    // Обрабатываем конструкцию: message.
    message: translateKey("log.entriesAdded", {
      // Обрабатываем конструкцию: name.
      name: game.name,
      // Обрабатываем конструкцию: domains.
      domains: report.domainsAdded,
      // Обрабатываем конструкцию: ips.
      ips: report.ipsAdded,
      // Обрабатываем конструкцию: files.
      files: report.filesModified.length,
      // Закрываем текущий блок.
    }),
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: report.rejectedEntries > 0.
  if (report.rejectedEntries > 0) {
    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "warn",
      // Обрабатываем конструкцию: source.
      source: "user",
      // Обрабатываем конструкцию: message.
      message: translateKey("log.entriesRejected", {
        // Обрабатываем конструкцию: name.
        name: game.name,
        // Обрабатываем конструкцию: count.
        count: report.rejectedEntries,
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
