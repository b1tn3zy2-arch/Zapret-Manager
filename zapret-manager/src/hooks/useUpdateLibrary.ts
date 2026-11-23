// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useUpdateActions.
import { rescanStrategies } from "@/hooks/useUpdateActions";
// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/updateCommands.
import * as commands from "@/lib/updateCommands";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// Импортируем зависимости из модуля @/types.
import type { UpdateBackupInfo } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateLibraryActions {
  // Обрабатываем конструкцию: loadBackups.
  loadBackups: () => Promise<UpdateBackupInfo[]>;
  // Обрабатываем конструкцию: rollback.
  rollback: (backupPath: string) => Promise<void>;
  // Обрабатываем конструкцию: markCurrentVersion.
  markCurrentVersion: (version: string) => Promise<void>;
  // Обрабатываем конструкцию: ignoreVersion.
  ignoreVersion: (version: string) => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUpdateLibrary(
  // Обрабатываем конструкцию: check.
  check: () => Promise<void>
  // Закрываем выражение или список аргументов.
): UpdateLibraryActions {
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const loadBackups = useCallback(async (): Promise<Updat….
  const loadBackups = useCallback(async (): Promise<UpdateBackupInfo[]> => {
    // Обрабатываем конструкцию: const folder = useSettingsStore.getState().settings.str….
    const folder = useSettingsStore.getState().settings.strategiesFolder;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: folder ===.
    if (folder === "") {
      // Возвращаем результат: [].
      return [];
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Возвращаем результат: await commands.fetchBackups(folder).
      return await commands.fetchBackups(folder);
      // Закрываем текущий блок.
    } catch {
      // Возвращаем результат: [].
      return [];
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const rollback = useCallback( async (backupPath: string….
  const rollback = useCallback(
    // Обрабатываем конструкцию: async.
    async (backupPath: string) => {
      // Обрабатываем конструкцию: const folder = useSettingsStore.getState().settings.str….
      const folder = useSettingsStore.getState().settings.strategiesFolder;
      // Обрабатываем конструкцию: const state = useUpdateStore.getState().
      const state = useUpdateStore.getState();
      // Обрабатываем конструкцию: state.
      state.setStatus("installing");
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await commands.restoreBackup(backupPath, fold….
        await commands.restoreBackup(backupPath, folder);
        // Ожидаем завершение асинхронной операции await rescanStrategies(folder).
        await rescanStrategies(folder);
        // Обрабатываем конструкцию: state.
        state.setStatus("ready");
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "system",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.rollbackDone"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: state.
        state.setError(toErrorMessage(caught));
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "system",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.rollbackFailed", {
            // Обрабатываем конструкцию: error.
            error: toErrorMessage(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const markCurrentVersion = useCallback( async (version:….
  const markCurrentVersion = useCallback(
    // Обрабатываем конструкцию: async.
    async (version: string) => {
      // Обрабатываем конструкцию: const folder = useSettingsStore.getState().settings.str….
      const folder = useSettingsStore.getState().settings.strategiesFolder;
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await commands.markVersion(folder, version).
        await commands.markVersion(folder, version);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "system",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.versionMarked", { version }),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Ожидаем завершение асинхронной операции await check().
        await check();
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: const message = toErrorMessage(caught).
        const message = toErrorMessage(caught);
        // Обрабатываем конструкцию: useUpdateStore.
        useUpdateStore.getState().setError(message);
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "system",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.versionMarkFailed", { error: message }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, check]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const ignoreVersion = useCallback( async (version: stri….
  const ignoreVersion = useCallback(
    // Обрабатываем конструкцию: async.
    async (version: string) => {
      // Обрабатываем конструкцию: const { settings } = useSettingsStore.getState().
      const { settings } = useSettingsStore.getState();
      // Обрабатываем конструкцию: const list = settings.strategyUpdates.ignoredVersions.
      const list = settings.strategyUpdates.ignoredVersions;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !list.includes(version).
      if (!list.includes(version)) {
        // Обрабатываем конструкцию: useSettingsStore.
        useSettingsStore.getState().updateStrategyUpdates({
          // Обрабатываем конструкцию: ignoredVersions.
          ignoredVersions: [...list, version],
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const state = useUpdateStore.getState().
      const state = useUpdateStore.getState();
      // Обрабатываем конструкцию: state.
      state.closeModal();
      // Обрабатываем конструкцию: state.
      state.setStatus("up-to-date");
      // Обрабатываем конструкцию: state.
      state.setInfo(
        // Обрабатываем конструкцию: state.
        state.info === null
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            null
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            { ...state.info, available: false, ignored: true }
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.versionIgnored", { version }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { loadBackups, rollback, markCurrentVersion, ignoreVers….
  return { loadBackups, rollback, markCurrentVersion, ignoreVersion };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
