// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/utils.
import { toErrorMessage } from "@/lib/utils";
// Импортируем зависимости из модуля @/lib/updateCommands.
import * as commands from "@/lib/updateCommands";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useUpdateStore.
import { useUpdateStore } from "@/stores/useUpdateStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UpdateTransferActions {
  // Обрабатываем конструкцию: check.
  check: () => Promise<void>;
  // Обрабатываем конструкцию: download.
  download: () => Promise<void>;
  // Обрабатываем конструкцию: install.
  install: () => Promise<void>;
  // Обрабатываем конструкцию: cancel.
  cancel: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function rescanStrategies(folder: string): Promise<void> {
  // Проверяем бизнес-условие: folder ===.
  if (folder === "") {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const strategies = await commands.scanStrategies(folder….
    const strategies = await commands.scanStrategies(folder);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies(strategies);
    // Закрываем текущий блок.
  } catch {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useUpdateActions(): UpdateTransferActions {
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const mountedRef = useRef(true).
  const mountedRef = useRef(true);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: mountedRef.
    mountedRef.current = true;
    // — разделитель логических блоков —

    // Возвращаем результат: () => { mountedRef.current = false; }.
    return () => {
      // Обрабатываем конструкцию: mountedRef.
      mountedRef.current = false;
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const check = useCallback(async () => { const { setting….
  const check = useCallback(async () => {
    // Обрабатываем конструкцию: const { settings } = useSettingsStore.getState().
    const { settings } = useSettingsStore.getState();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: settings.strategiesFolder ===.
    if (settings.strategiesFolder === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useUpdateStore.getState().
    const state = useUpdateStore.getState();
    // Обрабатываем конструкцию: state.
    state.setStatus("checking");
    // Обрабатываем конструкцию: state.
    state.setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const info = await commands.requestUpdateCheck( setting….
      const info = await commands.requestUpdateCheck(
        // Обрабатываем конструкцию: settings.
        settings.strategyUpdates.githubRepo,
        // Обрабатываем конструкцию: settings.
        settings.strategyUpdates.ignoredVersions,
        // Обрабатываем конструкцию: settings.
        settings.strategiesFolder
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !mountedRef.current.
      if (!mountedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: state.
      state.setInfo(info);
      // Обрабатываем конструкцию: state.
      state.setStatus(info.available ? "available" : "up-to-date");
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().updateStrategyUpdates({
        // Обрабатываем конструкцию: lastCheckAt.
        lastCheckAt: Date.now(),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: info.available ? "info" : "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: info.available
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            translateKey("log.updateAvailable", {
              // Обрабатываем конструкцию: from.
              from: info.currentVersion,
              // Обрабатываем конструкцию: to.
              to: info.latestVersion,
              // Закрываем текущий блок.
            })
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            translateKey("log.updateUpToDate", { version: info.latestVersion }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: !mountedRef.current.
      if (!mountedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: state.
      state.setError(toErrorMessage(caught));
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.updateCheckFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const download = useCallback(async () => { const info =….
  const download = useCallback(async () => {
    // Обрабатываем конструкцию: const info = useUpdateStore.getState().info.
    const info = useUpdateStore.getState().info;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: info === null || info.downloadUrl ===.
    if (info === null || info.downloadUrl === "") {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useUpdateStore.getState().
    const state = useUpdateStore.getState();
    // Обрабатываем конструкцию: state.
    state.setStatus("downloading");
    // Обрабатываем конструкцию: state.
    state.setProgress(null);
    // Обрабатываем конструкцию: state.
    state.setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const archivePath = await commands.downloadArchive( inf….
      const archivePath = await commands.downloadArchive(
        // Обрабатываем конструкцию: info.
        info.downloadUrl,
        // Обрабатываем конструкцию: info.
        info.latestVersion,
        // Обрабатываем конструкцию: info.
        info.digest
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useUpdateStore.
      useUpdateStore.getState().setArchive(archivePath);
      // Обрабатываем конструкцию: useUpdateStore.
      useUpdateStore.getState().setStatus("downloaded");
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.updateDownloaded", { name: info.assetName }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: !mountedRef.current.
      if (!mountedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: state.
      state.setError(toErrorMessage(caught));
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.updateDownloadFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const install = useCallback(async () => { const archive….
  const install = useCallback(async () => {
    // Обрабатываем конструкцию: const archivePath = useUpdateStore.getState().archivePa….
    const archivePath = useUpdateStore.getState().archivePath;
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: archivePath === null.
    if (archivePath === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const info = useUpdateStore.getState().info.
    const info = useUpdateStore.getState().info;
    // Обрабатываем конструкцию: const { settings } = useSettingsStore.getState().
    const { settings } = useSettingsStore.getState();
    // Обрабатываем конструкцию: const state = useUpdateStore.getState().
    const state = useUpdateStore.getState();
    // Обрабатываем конструкцию: state.
    state.setStatus("installing");
    // Обрабатываем конструкцию: state.
    state.setError(null);
    // — разделитель логических блоков —

    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const report = await commands.installArchive( archivePa….
      const report = await commands.installArchive(
        // Обрабатываем конструкцию: archivePath.
        archivePath,
        // Обрабатываем конструкцию: settings.
        settings.strategiesFolder,
        // Обрабатываем конструкцию: info.
        info?.latestVersion ?? ""
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !mountedRef.current.
      if (!mountedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: state.
      state.setReport(report);
      // Обрабатываем конструкцию: state.
      state.setStatus("ready");
      // Обрабатываем конструкцию: state.
      state.setArchive(null);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: info !== null.
      if (info !== null) {
        // Обрабатываем конструкцию: state.
        state.setInfo({
          // Разворачиваем ...info в коллекцию.
          ...info,
          // Обрабатываем конструкцию: currentVersion.
          currentVersion: report.version,
          // Обрабатываем конструкцию: available.
          available: false,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await rescanStrategies(settings.strategiesFol….
      await rescanStrategies(settings.strategiesFolder);
      // Обрабатываем конструкцию: useSettingsStore.
      useSettingsStore.getState().updateStrategyUpdates({
        // Обрабатываем конструкцию: ignoredVersions.
        ignoredVersions: settings.strategyUpdates.ignoredVersions.filter(
          // Объявляем функцию-обработчик или стрелочную функцию.
          (item) => item !== report.version
          // Закрываем выражение или список аргументов.
        ),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "success",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message:
          // Обрабатываем конструкцию: translateKey.
          translateKey("log.updateInstalled", {
            // Обрабатываем конструкцию: version.
            version: report.version,
            // Обрабатываем конструкцию: count.
            count: report.files,
            // Закрываем текущий блок.
          }) +
          // Обрабатываем конструкцию: (report.preservedEntries > 0 ? translateKey(log.updateP….
          (report.preservedEntries > 0
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              translateKey("log.updatePreserved", {
                // Обрабатываем конструкцию: count.
                count: report.preservedEntries,
                // Закрываем текущий блок.
              })
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              "") +
          // Обрабатываем конструкцию: (report.checkUpdatesDisabled ? translateKey(log.updateZ….
          (report.checkUpdatesDisabled
            ? // Обрабатываем конструкцию: ?.
              // Продолжаем предыдущую конструкцию.
              translateKey("log.updateZapretOff")
            : // Обрабатываем конструкцию: :.
              // Продолжаем предыдущую конструкцию.
              ""),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    } catch (caught) {
      // Проверяем бизнес-условие: !mountedRef.current.
      if (!mountedRef.current) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: state.
      state.setError(toErrorMessage(caught));
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "system",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.updateInstallFailed", {
          // Обрабатываем конструкцию: error.
          error: toErrorMessage(caught),
          // Закрываем текущий блок.
        }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const cancel = useCallback(async () => { try { await co….
  const cancel = useCallback(async () => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Ожидаем завершение асинхронной операции await commands.cancelDownload().
      await commands.cancelDownload();
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
        message: translateKey("log.updateCancelFailed", { error: message }),
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog]);
  // — разделитель логических блоков —

  // Возвращаем результат: { check, download, install, cancel }.
  return { check, download, install, cancel };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
