// Импортируем зависимости из модуля @/types.
import type { GameSettings, InstalledGame } from "@/types";
// Импортируем зависимости из модуля @/i18n/types.
import type { TranslationKey } from "@/i18n/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const PLATFORM_LABEL_KEYS: Record<
  // Обрабатываем конструкцию: InstalledGame.
  InstalledGame["platform"],
  // Обрабатываем конструкцию: TranslationKey.
  TranslationKey
  // Продолжаем выражение.
> = {
  // Обрабатываем конструкцию: steam.
  steam: "settings.games.installed.badge.steam",
  // Обрабатываем конструкцию: epic.
  epic: "settings.games.installed.badge.epic",
  // Обрабатываем конструкцию: gog.
  gog: "settings.games.installed.badge.gog",
  // Обрабатываем конструкцию: ubisoft.
  ubisoft: "settings.games.installed.badge.ubisoft",
  // Обрабатываем конструкцию: riot.
  riot: "settings.games.installed.badge.riot",
  // Обрабатываем конструкцию: ea.
  ea: "settings.games.installed.badge.ea",
  // Обрабатываем конструкцию: custom.
  custom: "settings.games.installed.badge.custom",
  // Обрабатываем конструкцию: battleNet.
  battleNet: "settings.games.installed.badge.custom",
  // Обрабатываем конструкцию: unknown.
  unknown: "settings.games.installed.badge.custom",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const SOURCE_LABEL_KEYS: Record<
  // Обрабатываем конструкцию: InstalledGame.
  InstalledGame["source"],
  // Обрабатываем конструкцию: TranslationKey.
  TranslationKey
  // Продолжаем выражение.
> = {
  // Обрабатываем конструкцию: registry.
  registry: "settings.games.installed.source.registry",
  // Обрабатываем конструкцию: steam.
  steam: "settings.games.installed.source.steam",
  // Обрабатываем конструкцию: epic.
  epic: "settings.games.installed.source.epic",
  // Обрабатываем конструкцию: gog.
  gog: "settings.games.installed.source.gog",
  // Обрабатываем конструкцию: ubisoft.
  ubisoft: "settings.games.installed.source.ubisoft",
  // Обрабатываем конструкцию: riot.
  riot: "settings.games.installed.source.riot",
  // Обрабатываем конструкцию: ea.
  ea: "settings.games.installed.source.ea",
  // Обрабатываем конструкцию: battleNet.
  battleNet: "settings.games.installed.source.battleNet",
  // Обрабатываем конструкцию: knownFolder.
  knownFolder: "settings.games.installed.source.knownFolder",
  // Обрабатываем конструкцию: userFolder.
  userFolder: "settings.games.installed.source.userFolder",
  // Закрываем текущий блок.
};
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Идентификатор игры строится только из пути к exe — так же,…
 * Идентификатор игры строится только из пути к exe — так же, как в бэкенде
 // Сохраняем пояснение разработчика: * (game_id). Платформа в id не входит: источник находки може…
 * (game_id). Платформа в id не входит: источник находки может смениться
 // Сохраняем пояснение разработчика: * между сканами (реестр → Steam), а на id завязаны удалённые…
 * между сканами (реестр → Steam), а на id завязаны удалённые крестиком
 // Сохраняем пояснение разработчика: * игры и выбор способа запуска. Префикс g- отделяет формат о…
 * игры и выбор способа запуска. Префикс `g-` отделяет формат от идентификаторов
 // Сохраняем пояснение разработчика: * старых версий стора.
 * старых версий стора.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function gameIdFromPath(executablePath: string): string {
  // Обрабатываем конструкцию: const normalized = executablePath .replace(/[™®©]/gu, )….
  const normalized = executablePath
    // Продолжаем цепочку вызовов.
    .replace(/[™®©]/gu, "")
    // Продолжаем цепочку вызовов.
    .toLowerCase()
    // Продолжаем цепочку вызовов.
    .replace(/\s+/gu, " ")
    // Продолжаем цепочку вызовов.
    .trim();
  // — разделитель логических блоков —

  // Возвращаем результат: g-${normalized .replace(/[^a-z0-9]+/gu, -) .replace(/^-….
  return `g-${normalized
    // Продолжаем предыдущую конструкцию.
    .replace(/[^a-z0-9]+/gu, "-")
    // Продолжаем предыдущую конструкцию.
    .replace(/^-+|-+$/gu, "")}`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию sameGame.
function sameGame(left: InstalledGame, right: InstalledGame): boolean {
  // Возвращаем результат: ( left.id === right.id || left.executablePath.toLowerCa….
  return (
    // Обрабатываем конструкцию: left.
    left.id === right.id ||
    // Обрабатываем конструкцию: left.
    left.executablePath.toLowerCase() === right.executablePath.toLowerCase()
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function mergeScannedGames(
  // Обрабатываем конструкцию: scanned.
  scanned: InstalledGame[],
  // Обрабатываем конструкцию: existing.
  existing: InstalledGame[]
  // Закрываем выражение или список аргументов.
): InstalledGame[] {
  // Обрабатываем конструкцию: const merged = scanned.map((game) => { const previous =….
  const merged = scanned.map((game) => {
    // Обрабатываем конструкцию: const previous = existing.find((item) => sameGame(item,….
    const previous = existing.find((item) => sameGame(item, game));
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !previous.
    if (!previous) {
      // Возвращаем результат: { ...game }.
      return { ...game };
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: { ...game, ...(previous.lastLaunchedAt === undefined ? ….
    return {
      // Разворачиваем ...game в коллекцию.
      ...game,
      // Разворачиваем ...(previous.lastLaunchedAt === undefined ? {… в коллекцию.
      ...(previous.lastLaunchedAt === undefined
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          {}
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          { lastLaunchedAt: previous.lastLaunchedAt }),
      // Обрабатываем конструкцию: launchCount.
      launchCount: previous.launchCount,
      // Разворачиваем ...(previous.manual === undefined ? {} : { ma… в коллекцию.
      ...(previous.manual === undefined ? {} : { manual: previous.manual }),
      // Разворачиваем ...(previous.bypassChoice === undefined ? {} … в коллекцию.
      ...(previous.bypassChoice === undefined
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          {}
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          { bypassChoice: previous.bypassChoice }),
      // Разворачиваем ...(previous.failedLaunchAt === undefined ? {… в коллекцию.
      ...(previous.failedLaunchAt === undefined
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          {}
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          { failedLaunchAt: previous.failedLaunchAt }),
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Перебираем элементы коллекции existing.
  for (const previous of existing) {
    // Проверяем бизнес-условие: previous.manual === true && !merged.some((game) => same….
    if (
      // Обрабатываем конструкцию: previous.
      previous.manual === true &&
      // Изменяем значение выражения !merged.some((game) => sameGame(game, previou….
      !merged.some((game) => sameGame(game, previous))
      // Закрываем выражение или список аргументов.
    ) {
      // Обрабатываем конструкцию: merged.
      merged.push(previous);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: dedupe( merged.sort((left, right) => left.name.localeCo….
  return dedupe(
    // Обрабатываем конструкцию: merged.
    merged.sort((left, right) => left.name.localeCompare(right.name))
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию dedupe.
function dedupe(games: InstalledGame[]): InstalledGame[] {
  // Обрабатываем конструкцию: const result: InstalledGame[] = [].
  const result: InstalledGame[] = [];
  // — разделитель логических блоков —

  // Перебираем элементы коллекции games.
  for (const game of games) {
    // Сохраняем пояснение разработчика: // Совпадение ищется по пути и по appid, но не по названию:
    // Совпадение ищется по пути и по appid, но не по названию:
    // Сохраняем пояснение разработчика: // две разные игры с одинаковым именем — это две игры.
    // две разные игры с одинаковым именем — это две игры.
    // Сохраняем пояснение разработчика: // appid схлопывает только реальные значения: у не-Steam игр…
    // appid схлопывает только реальные значения: у не-Steam игр он null,
    // Сохраняем пояснение разработчика: // и null === null не должен делать одну игру из всех осталь…
    // и `null === null` не должен делать одну игру из всех остальных.
    // Обрабатываем конструкцию: const seen = result.some( (item) => item.executablePath….
    const seen = result.some(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (item) =>
        // Обрабатываем конструкцию: item.
        item.executablePath.toLowerCase() ===
          // Обрабатываем конструкцию: game.
          game.executablePath.toLowerCase() ||
        // Обрабатываем конструкцию: (typeof game.appid === string && game.appid !== && item….
        (typeof game.appid === "string" &&
          // Обрабатываем конструкцию: game.
          game.appid !== "" &&
          // Обрабатываем конструкцию: item.
          item.appid === game.appid)
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !seen.
    if (!seen) {
      // Обрабатываем конструкцию: result.
      result.push(game);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: result.
  return result;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function gameBypass(
  // Обрабатываем конструкцию: game.
  game: InstalledGame,
  // Обрабатываем конструкцию: settings.
  settings: readonly GameSettings[]
  // Закрываем выражение или список аргументов.
): GameSettings | undefined {
  // Возвращаем результат: settings.find((item) => item.id === game.gameSettingsId….
  return settings.find((item) => item.id === game.gameSettingsId);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Профиль обхода для игры: сначала по идентификатору из базы…
 * Профиль обхода для игры: сначала по идентификатору из базы известных игр,
 // Сохраняем пояснение разработчика: * затем по нормализованному названию. Второй путь нужен ручн…
 * затем по нормализованному названию. Второй путь нужен ручным играм и играм,
 // Сохраняем пояснение разработчика: * которые сканер не сопоставил с базой: без него они запуска…
 * которые сканер не сопоставил с базой: без него они запускались вообще без
 // Сохраняем пояснение разработчика: * доменов и портов в обходе.
 * доменов и портов в обходе.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function findGameProfile(
  // Обрабатываем конструкцию: game.
  game: InstalledGame,
  // Обрабатываем конструкцию: settings.
  settings: readonly GameSettings[]
  // Закрываем выражение или список аргументов.
): GameSettings | undefined {
  // Обрабатываем конструкцию: const direct = gameBypass(game, settings).
  const direct = gameBypass(game, settings);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: direct !== undefined.
  if (direct !== undefined) {
    // Возвращаем результат: direct.
    return direct;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const name = normalizeGameTitle(game.name).
  const name = normalizeGameTitle(game.name);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: name ===.
  if (name === "") {
    // Возвращаем результат: undefined.
    return undefined;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: settings.find((item) => normalizeGameTitle(item.name) =….
  return settings.find((item) => normalizeGameTitle(item.name) === name);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию normalizeGameTitle.
function normalizeGameTitle(value: string): string {
  // Возвращаем результат: value .toLowerCase() .replace(/[^a-z0-9а-яё]+/giu, ) .r….
  return (
    // Продолжаем предыдущую конструкцию.
    value
      // Продолжаем цепочку вызовов.
      .toLowerCase()
      // Продолжаем цепочку вызовов.
      .replace(/[^a-z0-9а-яё]+/giu, " ")
      // Продолжаем цепочку вызовов.
      .replace(/\b(the|a)\b/gu, " ")
      // Продолжаем цепочку вызовов.
      .trim()
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function isBypassEnabled(
  // Обрабатываем конструкцию: game.
  game: InstalledGame,
  // Обрабатываем конструкцию: settings.
  settings: readonly GameSettings[]
  // Закрываем выражение или список аргументов.
): boolean {
  // Возвращаем результат: gameBypass(game, settings)?.enabled === true.
  return gameBypass(game, settings)?.enabled === true;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function usesAnticheat(game: InstalledGame): boolean {
  // Возвращаем результат: game.anticheat === battleye || game.anticheat === eac.
  return game.anticheat === "battleye" || game.anticheat === "eac";
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function manualGame(
  // Обрабатываем конструкцию: name.
  name: string,
  // Обрабатываем конструкцию: executablePath.
  executablePath: string,
  // Обрабатываем конструкцию: platform.
  platform: InstalledGame["platform"],
  // Обрабатываем конструкцию: gameSettingsId.
  gameSettingsId?: string
  // Закрываем выражение или список аргументов.
): InstalledGame {
  // Обрабатываем конструкцию: const installPath = executablePath.replace(/[\\/][^\\/]….
  const installPath = executablePath.replace(/[\\/][^\\/]+$/, "");
  // Сохраняем пояснение разработчика: // В id входит и файл, а не только папка: две разные игры в …
  // В id входит и файл, а не только папка: две разные игры в одной
  // Сохраняем пояснение разработчика: // папке иначе получили бы один и тот же идентификатор. Форм…
  // папке иначе получили бы один и тот же идентификатор. Формат совпадает
  // Сохраняем пояснение разработчика: // со сканером, поэтому удалённую вручную игру сканер не вер…
  // со сканером, поэтому удалённую вручную игру сканер не вернёт.
  // Обрабатываем конструкцию: const id = gameIdFromPath(executablePath).
  const id = gameIdFromPath(executablePath);
  // — разделитель логических блоков —

  // Возвращаем результат: { id, name: name.trim() || installPath.split(/[\\/]/).p….
  return {
    // Передаём поле id в объект.
    id,
    // Обрабатываем конструкцию: name.
    name: name.trim() || installPath.split(/[\\/]/).pop() || executablePath,
    // Передаём поле platform в объект.
    platform,
    // Обрабатываем конструкцию: source.
    source: "userFolder",
    // Передаём поле installPath в объект.
    installPath,
    // Передаём поле executablePath в объект.
    executablePath,
    // Разворачиваем ...(gameSettingsId === undefined ? {} : { gam… в коллекцию.
    ...(gameSettingsId === undefined ? {} : { gameSettingsId }),
    // Обрабатываем конструкцию: anticheat.
    anticheat: "none",
    // Обрабатываем конструкцию: launchCount.
    launchCount: 0,
    // Обрабатываем конструкцию: manual.
    manual: true,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
