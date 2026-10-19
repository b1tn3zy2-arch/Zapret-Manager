import type { GameSettings, InstalledGame } from "@/types";
import type { TranslationKey } from "@/i18n/types";

export const PLATFORM_LABEL_KEYS: Record<
  InstalledGame["platform"],
  TranslationKey
> = {
  steam: "settings.games.installed.badge.steam",
  epic: "settings.games.installed.badge.epic",
  gog: "settings.games.installed.badge.gog",
  ubisoft: "settings.games.installed.badge.ubisoft",
  riot: "settings.games.installed.badge.riot",
  ea: "settings.games.installed.badge.ea",
  battleNet: "settings.games.installed.badge.battlenet",
  custom: "settings.games.installed.badge.custom",
  unknown: "settings.games.installed.badge.custom",
};

export const SOURCE_LABEL_KEYS: Record<
  InstalledGame["source"],
  TranslationKey
> = {
  registry: "settings.games.installed.source.registry",
  steam: "settings.games.installed.source.steam",
  epic: "settings.games.installed.source.epic",
  gog: "settings.games.installed.source.gog",
  ubisoft: "settings.games.installed.source.ubisoft",
  riot: "settings.games.installed.source.riot",
  ea: "settings.games.installed.source.ea",
  battlenet: "settings.games.installed.source.battlenet",
  knownFolder: "settings.games.installed.source.knownFolder",
  userFolder: "settings.games.installed.source.userFolder",
};

function sameGame(left: InstalledGame, right: InstalledGame): boolean {
  return (
    left.id === right.id ||
    left.executablePath.toLowerCase() === right.executablePath.toLowerCase()
  );
}

export function mergeScannedGames(
  scanned: InstalledGame[],
  existing: InstalledGame[]
): InstalledGame[] {
  const merged = scanned.map((game) => {
    const previous = existing.find((item) => sameGame(item, game));

    if (!previous) {
      return { ...game };
    }

    return {
      ...game,
      ...(previous.lastLaunchedAt === undefined
        ? {}
        : { lastLaunchedAt: previous.lastLaunchedAt }),
      launchCount: previous.launchCount,
      ...(previous.manual === undefined ? {} : { manual: previous.manual }),
    };
  });

  for (const previous of existing) {
    if (
      previous.manual === true &&
      !merged.some((game) => sameGame(game, previous))
    ) {
      merged.push(previous);
    }
  }

  return dedupe(
    merged.sort((left, right) => left.name.localeCompare(right.name))
  );
}

function dedupe(games: InstalledGame[]): InstalledGame[] {
  const result: InstalledGame[] = [];

  for (const game of games) {
    const seen = result.some(
      (item) =>
        item.executablePath.toLowerCase() ===
          game.executablePath.toLowerCase() ||
        (game.appid !== undefined && item.appid === game.appid) ||
        item.name.toLowerCase() === game.name.toLowerCase()
    );

    if (!seen) {
      result.push(game);
    }
  }

  return result;
}

export function gameBypass(
  game: InstalledGame,
  settings: readonly GameSettings[]
): GameSettings | undefined {
  return settings.find((item) => item.id === game.gameSettingsId);
}

/**
 * Профиль обхода для игры: сначала по идентификатору из базы известных игр,
 * затем по нормализованному названию. Второй путь нужен ручным играм и играм,
 * которые сканер не сопоставил с базой: без него они запускались вообще без
 * доменов и портов в обходе.
 */
export function findGameProfile(
  game: InstalledGame,
  settings: readonly GameSettings[]
): GameSettings | undefined {
  const direct = gameBypass(game, settings);

  if (direct !== undefined) {
    return direct;
  }

  const name = normalizeGameTitle(game.name);

  if (name === "") {
    return undefined;
  }

  return settings.find((item) => normalizeGameTitle(item.name) === name);
}

function normalizeGameTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/giu, " ")
    .replace(/\b(the|a)\b/gu, " ")
    .trim();
}

export function isBypassEnabled(
  game: InstalledGame,
  settings: readonly GameSettings[]
): boolean {
  return gameBypass(game, settings)?.enabled === true;
}

export function usesAnticheat(game: InstalledGame): boolean {
  return game.anticheat === "battleye" || game.anticheat === "eac";
}

export function manualGame(
  name: string,
  executablePath: string,
  platform: InstalledGame["platform"],
  gameSettingsId?: string
): InstalledGame {
  const installPath = executablePath.replace(/[\\/][^\\/]+$/, "");

  return {
    id: `manual-${installPath.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name: name.trim() || installPath.split(/[\\/]/).pop() || executablePath,
    platform,
    source: "userFolder",
    installPath,
    executablePath,
    ...(gameSettingsId === undefined ? {} : { gameSettingsId }),
    anticheat: "none",
    launchCount: 0,
    manual: true,
  };
}
