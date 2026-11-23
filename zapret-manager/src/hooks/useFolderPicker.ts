// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @tauri-apps/plugin-dialog.
import { open } from "@tauri-apps/plugin-dialog";
// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseFolderPickerResult {
  // Обрабатываем конструкцию: pickFolder.
  pickFolder: () => Promise<string | null>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useFolderPicker(): UseFolderPickerResult {
  // Обрабатываем конструкцию: const updateSettings = useSettingsStore((state) => stat….
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const pickFolder = useCallback(async (): Promise<string….
  const pickFolder = useCallback(async (): Promise<string | null> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const selected = await open({ directory: true, multiple….
      const selected = await open({
        // Обрабатываем конструкцию: directory.
        directory: true,
        // Обрабатываем конструкцию: multiple.
        multiple: false,
        // Обрабатываем конструкцию: title.
        title: translateKey("log.folderPickerTitle"),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: typeof selected !== string || selected ===.
      if (typeof selected !== "string" || selected === "") {
        // Возвращаем результат: null.
        return null;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: updateSettings.
      updateSettings({ strategiesFolder: selected });
      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.folderPicked", { path: selected }),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Возвращаем результат: selected.
      return selected;
      // Закрываем текущий блок.
    } catch (caught) {
      // Обрабатываем конструкцию: const message = caught instanceof Error ? caught.messag….
      const message = caught instanceof Error ? caught.message : String(caught);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: translateKey("log.folderPickFailed", { error: message }),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Возвращаем результат: null.
      return null;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, [addLog, updateSettings]);
  // — разделитель логических блоков —

  // Возвращаем результат: { pickFolder }.
  return { pickFolder };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
