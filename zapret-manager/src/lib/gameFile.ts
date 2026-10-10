import { writeTextFile } from "@tauri-apps/plugin-fs";

import { toErrorMessage } from "@/lib/utils";
import type { GameSettings } from "@/types";

const EXPORT_VERSION = 1;

export interface GameFile {
  version: number;
  game: Pick<GameSettings, "name" | "domains" | "ipRanges" | "ports">;
}

export function buildGameFile(game: GameSettings): GameFile {
  return {
    version: EXPORT_VERSION,
    game: {
      name: game.name,
      domains: game.domains.filter((item) => item.trim() !== ""),
      ipRanges: game.ipRanges.filter((item) => item.trim() !== ""),
      ports: [...game.ports],
    },
  };
}

export function parseGameFile(raw: string): GameFile["game"] | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) {
    return null;
  }

  const source = (parsed as { game?: unknown }).game;

  if (typeof source !== "object" || source === null) {
    return null;
  }

  const record = source as Record<string, unknown>;
  const name = typeof record.name === "string" ? record.name : "";
  const domains = Array.isArray(record.domains)
    ? (record.domains as unknown[]).filter(
        (item): item is string => typeof item === "string"
      )
    : [];
  const ipRanges = Array.isArray(record.ipRanges)
    ? (record.ipRanges as unknown[]).filter(
        (item): item is string => typeof item === "string"
      )
    : [];
  const ports = Array.isArray(record.ports)
    ? (record.ports as unknown[])
        .map((item) => Number(item))
        .filter((item) => Number.isInteger(item) && item > 0 && item <= 65535)
    : [];

  if (name === "" && domains.length === 0 && ipRanges.length === 0) {
    return null;
  }

  return { name, domains, ipRanges, ports };
}

export async function writeGameFile(
  path: string,
  game: GameSettings
): Promise<void> {
  try {
    await writeTextFile(path, JSON.stringify(buildGameFile(game), null, 2));
  } catch (caught) {
    throw new Error(toErrorMessage(caught), { cause: caught });
  }
}
