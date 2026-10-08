import { save } from "@tauri-apps/plugin-dialog";
import { open } from "@tauri-apps/plugin-dialog";
import { readUserTextFile, writeUserTextFile } from "@/lib/userCommands";

import { APP_VERSION } from "@/lib/constants";
import { validateSettings } from "@/lib/settingsSchema";
import type { AppSettings } from "@/types";

export const SETTINGS_EXPORT_VERSION = 1;

interface SettingsExportFile {
  version: number;
  exportedAt: string;
  appVersion: string;
  settings: Omit<AppSettings, "lastStrategyId" | "strategyUpdates"> & {
    strategyUpdates: Omit<
      AppSettings["strategyUpdates"],
      "ignoredVersions" | "lastCheckAt"
    >;
  };
}

function exportName(): string {
  const date = new Date().toISOString().slice(0, 10);

  return `zapret-manager-settings-${date}.json`;
}

export function serializeSettings(settings: AppSettings): string {
  const { lastStrategyId, strategyUpdates, ...rest } = settings;

  void lastStrategyId;
  void strategyUpdates;

  const payload: SettingsExportFile = {
    version: SETTINGS_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
    settings: {
      ...rest,
      strategyUpdates: {
        autoCheck: settings.strategyUpdates.autoCheck,
        checkIntervalHours: settings.strategyUpdates.checkIntervalHours,
        autoDownload: settings.strategyUpdates.autoDownload,
        githubRepo: settings.strategyUpdates.githubRepo,
      },
    },
  };

  return JSON.stringify(payload, null, 2);
}

export function deserializeSettings(json: string): AppSettings {
  const parsed: unknown = JSON.parse(json);

  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Файл не содержит объекта настроек");
  }

  const payload = parsed as Partial<SettingsExportFile>;
  const body = payload.settings ?? parsed;

  return validateSettings(body);
}

export async function exportSettings(settings: AppSettings): Promise<boolean> {
  const path = await save({
    defaultPath: exportName(),
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (path === null) {
    return false;
  }

  await writeUserTextFile(path, serializeSettings(settings));

  return true;
}

export async function importSettings(): Promise<AppSettings | null> {
  const selected = await open({
    multiple: false,
    directory: false,
    filters: [{ name: "JSON", extensions: ["json"] }],
  });

  if (typeof selected !== "string" || selected === "") {
    return null;
  }

  return deserializeSettings(await readUserTextFile(selected));
}
