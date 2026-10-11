import { appDataDir } from "@tauri-apps/api/path";
import {
  exists,
  mkdir,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs";

import { DEFAULT_GAMES, SETTINGS_FILE_NAME } from "@/lib/defaults";
import { getDefaultGames } from "@/lib/defaultGames";
import { validateSettings } from "@/lib/settingsSchema";
import type {
  AdvancedSettings,
  AppearanceSettings,
  AppSettings,
  GameSettings,
  GeneralSettings,
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

function unionStrings(
  base: readonly string[] = [],
  extra: readonly string[] = []
): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const value of [...base, ...extra]) {
    const key = value.trim();

    if (key === "" || seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(key);
  }

  return result;
}

function unionPorts(
  base: readonly number[] = [],
  extra: readonly number[] = []
): number[] {
  return [...new Set([...base, ...extra])].sort((left, right) => left - right);
}

export function mergeBuiltinDefaults(game: GameSettings): GameSettings {
  const builtin = DEFAULT_GAMES.find((item) => item.id === game.id);

  if (builtin === undefined) {
    return game;
  }

  return {
    ...game,
    domains: unionStrings(game.domains, builtin.domains),
    ipRanges: unionStrings(game.ipRanges, builtin.ipRanges),
    ports: unionPorts(game.ports, builtin.ports),
  };
}

function gameList(value: unknown): GameSettings[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .filter(isRecord)
    .map((item) => mergeBuiltinDefaults(section<GameSettings>(item)));
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
    games: gameList(parsed.games) ?? getDefaultGames(),
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
