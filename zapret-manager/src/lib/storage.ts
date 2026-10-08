import { appDataDir } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import { SETTINGS_FILE_NAME } from "@/lib/defaults";
import { validateSettings } from "@/lib/settingsSchema";
import type {
  AdvancedSettings,
  AppearanceSettings,
  AppSettings,
  GeneralSettings,
  OutlastTrialsSettings,
  StrategyUpdateSettings,
  VpnSettings,
} from "@/types";

async function resolveSettingsPath(): Promise<string> {
  const root = await appDataDir();
  return `${root}\\${SETTINGS_FILE_NAME}`;
}

export async function getSettingsPath(): Promise<string> {
  return resolveSettingsPath();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function section<T>(value: unknown): T {
  return { ...(isRecord(value) ? value : {}) } as unknown as T;
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" ? value : fallback;
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function parseSections(parsed: Record<string, unknown>): AppSettings {
  const updates = isRecord(parsed.strategyUpdates)
    ? parsed.strategyUpdates
    : {};

  return {
    strategiesFolder: text(parsed.strategiesFolder, ""),
    lastStrategyId: optionalText(parsed.lastStrategyId),
    general: section<GeneralSettings>(parsed.general),
    appearance: section<AppearanceSettings>(parsed.appearance),
    strategyUpdates: {
      ...section<StrategyUpdateSettings>(updates),
      ignoredVersions: stringList(updates.ignoredVersions),
      lastCheckAt:
        typeof updates.lastCheckAt === "number" ? updates.lastCheckAt : null,
    },
    outlastTrials: section<OutlastTrialsSettings>(parsed.outlastTrials),
    vpn: section<VpnSettings>(parsed.vpn),
    advanced: section<AdvancedSettings>(parsed.advanced),
  };
}

export async function readSettingsFile(): Promise<AppSettings | null> {
  const path = await resolveSettingsPath();

  if (!(await exists(path))) {
    return null;
  }

  const parsed: unknown = JSON.parse(await readTextFile(path));

  if (!isRecord(parsed)) {
    return null;
  }

  try {
    return validateSettings(parsed);
  } catch {
    return parseSections(parsed);
  }
}

export async function writeSettingsFile(settings: AppSettings): Promise<void> {
  const root = await appDataDir();

  if (!(await exists(root))) {
    await mkdir(root, { recursive: true });
  }

  await writeTextFile(
    await resolveSettingsPath(),
    JSON.stringify(settings, null, 2)
  );
}
