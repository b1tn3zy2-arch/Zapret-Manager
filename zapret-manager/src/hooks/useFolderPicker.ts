import { open } from "@tauri-apps/plugin-dialog";
import { useCallback } from "react";

import { useLogsStore } from "@/stores/useLogsStore";
import { useSettingsStore } from "@/stores/useSettingsStore";

export interface UseFolderPickerResult {
  pickFolder: () => Promise<string | null>;
}

export function useFolderPicker(): UseFolderPickerResult {
  const updateSettings = useSettingsStore((state) => state.updateSettings);
  const addLog = useLogsStore((state) => state.addLog);

  const pickFolder = useCallback(async (): Promise<string | null> => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Выберите папку со стратегиями",
      });

      if (typeof selected !== "string" || selected === "") {
        return null;
      }

      updateSettings({ strategiesFolder: selected });
      addLog({
        level: "info",
        source: "user",
        message: `Папка стратегий: ${selected}`,
      });

      return selected;
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : String(caught);

      addLog({
        level: "error",
        source: "user",
        message: `Не удалось выбрать папку: ${message}`,
      });

      return null;
    }
  }, [addLog, updateSettings]);

  return { pickFolder };
}
