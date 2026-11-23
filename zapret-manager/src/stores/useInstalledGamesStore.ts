// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/installedGames.
import { gameIdFromPath } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт GameCoverProgress.
  GameCoverProgress,
  // Подключаем именованный импорт GameScanProgress.
  GameScanProgress,
  // Подключаем именованный импорт InstalledGame.
  InstalledGame,
  // Подключаем именованный импорт ScanStatus.
  ScanStatus,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const INSTALLED_GAMES_STORE_VERSION = 4.
const INSTALLED_GAMES_STORE_VERSION = 4;
// Обрабатываем конструкцию: const MAX_INSTALLED_GAMES = 200.
const MAX_INSTALLED_GAMES = 200;
// Обрабатываем конструкцию: const MAX_REMOVED_GAMES = 200.
const MAX_REMOVED_GAMES = 200;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface InstalledGamesState {
  // Обрабатываем конструкцию: games.
  games: InstalledGame[];
  // Обрабатываем конструкцию: folders.
  folders: string[];
  // Сохраняем пояснение разработчика: id игр, удалённых с экрана крестиком. Сканер их больше не во…
  /** id игр, удалённых с экрана крестиком. Сканер их больше не возвращает. */
  // Обрабатываем конструкцию: removedIds.
  removedIds: string[];
  // Обрабатываем конструкцию: scanStatus.
  scanStatus: ScanStatus;
  // Обрабатываем конструкцию: scanProgress.
  scanProgress: GameScanProgress | null;
  // Сохраняем пояснение разработчика: Ход докачки обложек: { current, total }.
  /** Ход докачки обложек: { current, total }. */
  // Обрабатываем конструкцию: coverProgress.
  coverProgress: GameCoverProgress | null;
  // Обрабатываем конструкцию: lastScannedAt.
  lastScannedAt: number | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: setGames.
  setGames: (games: InstalledGame[]) => void;
  // Обрабатываем конструкцию: addGame.
  addGame: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: removeGame.
  removeGame: (id: string) => void;
  // Обрабатываем конструкцию: updateGame.
  updateGame: (id: string, patch: Partial<InstalledGame>) => void;
  // Обрабатываем конструкцию: updateGameByAppId.
  updateGameByAppId: (appId: string, patch: Partial<InstalledGame>) => void;
  // Обрабатываем конструкцию: addFolder.
  addFolder: (folder: string) => void;
  // Обрабатываем конструкцию: removeFolder.
  removeFolder: (folder: string) => void;
  // Обрабатываем конструкцию: setScanStatus.
  setScanStatus: (status: ScanStatus) => void;
  // Обрабатываем конструкцию: setScanProgress.
  setScanProgress: (progress: GameScanProgress | null) => void;
  // Обрабатываем конструкцию: setCoverProgress.
  setCoverProgress: (progress: GameCoverProgress | null) => void;
  // Обрабатываем конструкцию: setError.
  setError: (error: string | null) => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс PersistedInstalledGames с контрактом данных.
interface PersistedInstalledGames {
  // Обрабатываем конструкцию: games.
  games?: InstalledGame[];
  // Обрабатываем конструкцию: folders.
  folders?: string[];
  // Обрабатываем конструкцию: removedIds.
  removedIds?: string[];
  // Обрабатываем конструкцию: lastScannedAt.
  lastScannedAt?: number | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию sanitizeGame.
function sanitizeGame(value: unknown): InstalledGame | null {
  // Проверяем бизнес-условие: typeof value !== object || value === null.
  if (typeof value !== "object" || value === null) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const game = value as Partial<InstalledGame>.
  const game = value as Partial<InstalledGame>;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: typeof game.id !== string || typeof game.name !== strin….
  if (
    // Обрабатываем конструкцию: typeof game.id.
    typeof game.id !== "string" ||
    // Обрабатываем конструкцию: typeof game.name.
    typeof game.name !== "string" ||
    // Обрабатываем конструкцию: typeof game.executablePath.
    typeof game.executablePath !== "string" ||
    // Обрабатываем конструкцию: typeof game.installPath.
    typeof game.installPath !== "string"
    // Закрываем выражение или список аргументов.
  ) {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: { ...game, name: game.name.trim() || game.executablePat….
  return {
    // Разворачиваем ...game в коллекцию.
    ...game,
    // Обрабатываем конструкцию: name.
    name: game.name.trim() || game.executablePath,
    // Обрабатываем конструкцию: launchCount.
    launchCount: typeof game.launchCount === "number" ? game.launchCount : 0,
    // Разворачиваем ...(typeof game.lastLaunchedAt === number ? {… в коллекцию.
    ...(typeof game.lastLaunchedAt === "number"
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        { lastLaunchedAt: game.lastLaunchedAt }
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        { lastLaunchedAt: undefined }),
    // Закрываем текущий блок.
  } as InstalledGame;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function migratePersistedGames(
  // Обрабатываем конструкцию: persisted.
  persisted: Partial<PersistedInstalledGames> | undefined
  // Закрываем выражение или список аргументов.
): {
  // Обрабатываем конструкцию: games.
  games: InstalledGame[];
  // Обрабатываем конструкцию: folders.
  folders: string[];
  // Обрабатываем конструкцию: removedIds.
  removedIds: string[];
  // Обрабатываем конструкцию: lastScannedAt.
  lastScannedAt: number | null;
  // Закрываем текущий блок.
} {
  // Обрабатываем конструкцию: const games = (persisted?.games ?? []) .map(sanitizeGam….
  const games = (persisted?.games ?? [])
    // Продолжаем цепочку вызовов.
    .map(sanitizeGame)
    // Продолжаем цепочку вызовов.
    .filter((game): game is InstalledGame => game !== null)
    // Продолжаем цепочку вызовов.
    .slice(0, MAX_INSTALLED_GAMES)
    // Продолжаем цепочку вызовов.
    .map((game) => ({ ...game, id: gameIdFromPath(game.executablePath) }));
  // Обрабатываем конструкцию: const folders = (persisted?.folders ?? []).filter( (fol….
  const folders = (persisted?.folders ?? []).filter(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (folder) => typeof folder === "string" && folder.trim() !== ""
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { games, folders, // Версия 4 аннулирует накопленные «у….
  return {
    // Передаём поле games в объект.
    games,
    // Передаём поле folders в объект.
    folders,
    // Сохраняем пояснение разработчика: // Версия 4 аннулирует накопленные «удаления»: они делались …
    // Версия 4 аннулирует накопленные «удаления»: они делались против
    // Сохраняем пояснение разработчика: // старого сканера, который путал игры с мусором, и против с…
    // старого сканера, который путал игры с мусором, и против старого
    // Сохраняем пояснение разработчика: // формата id (платформа в префиксе). Теперь id строится тол…
    // формата id (платформа в префиксе). Теперь id строится только из пути
    // Сохраняем пояснение разработчика: // к exe, поэтому удаление не отменяется переклассификацией …
    // к exe, поэтому удаление не отменяется переклассификацией источника
    // Сохраняем пояснение разработчика: // и остаётся окончательным для всех последующих версий.
    // и остаётся окончательным для всех последующих версий.
    // Обрабатываем конструкцию: removedIds.
    removedIds: [],
    // Обрабатываем конструкцию: lastScannedAt.
    lastScannedAt:
      // Обрабатываем конструкцию: typeof persisted?.lastScannedAt.
      typeof persisted?.lastScannedAt === "number"
        ? // Обрабатываем конструкцию: ?.
          // Продолжаем предыдущую конструкцию.
          persisted.lastScannedAt
        : // Обрабатываем конструкцию: :.
          // Продолжаем предыдущую конструкцию.
          null,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Игры, удалённые крестиком. Сканер их не возвращает снова: …
 * Игры, удалённые крестиком. Сканер их не возвращает снова: без этого
 // Сохраняем пояснение разработчика: * списка находка возвращалась бы на страницу «Игры» при кажд…
 * списка находка возвращалась бы на страницу «Игры» при каждом
 // Сохраняем пояснение разработчика: * пересканировании.
 * пересканировании.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function filterRemovedGames(
  // Обрабатываем конструкцию: games.
  games: InstalledGame[],
  // Обрабатываем конструкцию: removedIds.
  removedIds: readonly string[]
  // Закрываем выражение или список аргументов.
): InstalledGame[] {
  // Проверяем бизнес-условие: removedIds.length === 0.
  if (removedIds.length === 0) {
    // Возвращаем результат: games.
    return games;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const removed = new Set(removedIds).
  const removed = new Set(removedIds);
  // — разделитель логических блоков —

  // Возвращаем результат: games.filter((game) => !removed.has(game.id)).
  return games.filter((game) => !removed.has(game.id));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useInstalledGamesStore = create<InstalledGamesState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (set) => ({
      // Обрабатываем конструкцию: games.
      games: [],
      // Обрабатываем конструкцию: folders.
      folders: [],
      // Обрабатываем конструкцию: removedIds.
      removedIds: [],
      // Обрабатываем конструкцию: scanStatus.
      scanStatus: "idle",
      // Обрабатываем конструкцию: scanProgress.
      scanProgress: null,
      // Обрабатываем конструкцию: coverProgress.
      coverProgress: null,
      // Обрабатываем конструкцию: lastScannedAt.
      lastScannedAt: null,
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: setGames.
      setGames: (games) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: const previous = new Map(state.games.map((game) => [gam….
          const previous = new Map(state.games.map((game) => [game.id, game]));
          // — разделитель логических блоков —

          // Возвращаем результат: { games: games.slice(0, MAX_INSTALLED_GAMES).map((game)….
          return {
            // Обрабатываем конструкцию: games.
            games: games.slice(0, MAX_INSTALLED_GAMES).map((game) => {
              // Обрабатываем конструкцию: const before = previous.get(game.id).
              const before = previous.get(game.id);
              // — разделитель логических блоков —

              // Проверяем бизнес-условие: before === undefined.
              if (before === undefined) {
                // Возвращаем результат: game.
                return game;
                // Закрываем текущий блок.
              }
              // — разделитель логических блоков —

              // Сохраняем пояснение разработчика: // Обложка и AppID — добыча прошлых сканов и событий докачки…
              // Обложка и AppID — добыча прошлых сканов и событий докачки.
              // Сохраняем пояснение разработчика: // Сканер не всегда в курсе (кэш-файл мог быть не прочитан,
              // Сканер не всегда в курсе (кэш-файл мог быть не прочитан,
              // Сохраняем пояснение разработчика: // поиск ещё не завершён), поэтому терять их нельзя.
              // поиск ещё не завершён), поэтому терять их нельзя.
              // Обрабатываем конструкцию: const lostCover = (game.coverPath === null || game.cove….
              const lostCover =
                // Обрабатываем конструкцию: (game.coverPath === null || game.coverPath === undefine….
                (game.coverPath === null || game.coverPath === undefined) &&
                // Обрабатываем конструкцию: before.
                before.coverPath;
              // Обрабатываем конструкцию: const lostAppid = (game.appid === null || game.appid ==….
              const lostAppid =
                // Обрабатываем конструкцию: (game.appid === null || game.appid === undefined).
                (game.appid === null || game.appid === undefined) &&
                // Обрабатываем конструкцию: before.
                before.appid;
              // — разделитель логических блоков —

              // Возвращаем результат: { ...game, ...(lostCover ? { coverPath: before.coverPat….
              return {
                // Разворачиваем ...game в коллекцию.
                ...game,
                // Разворачиваем ...(lostCover ? { coverPath: before.coverPath… в коллекцию.
                ...(lostCover ? { coverPath: before.coverPath } : {}),
                // Разворачиваем ...(lostAppid ? { appid: before.appid } : {}) в коллекцию.
                ...(lostAppid ? { appid: before.appid } : {}),
                // Закрываем текущий блок.
              };
              // Закрываем текущий блок.
            }),
            // Обрабатываем конструкцию: scanStatus.
            scanStatus: "done",
            // Обрабатываем конструкцию: scanProgress.
            scanProgress: null,
            // Обрабатываем конструкцию: lastScannedAt.
            lastScannedAt: Date.now(),
            // Обрабатываем конструкцию: error.
            error: null,
            // Закрываем текущий блок.
          };
          // Закрываем текущий блок.
        }),
      // Обрабатываем конструкцию: addGame.
      addGame: (game) =>
        // Обрабатываем конструкцию: set.
        set(
          // Продолжаем предыдущую конструкцию.
          (state) =>
            // Обрабатываем конструкцию: state.
            state.games.some((item) => item.id === game.id)
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                state
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                {
                  // Обрабатываем конструкцию: games.
                  games: [game, ...state.games].slice(0, MAX_INSTALLED_GAMES),
                  // Обрабатываем конструкцию: scanStatus.
                  scanStatus: state.scanStatus,
                  // Закрываем текущий блок.
                }
          // Закрываем выражение или список аргументов.
        ),
      // Сохраняем пояснение разработчика:
      /**
       // Сохраняем пояснение разработчика: * Удаление карточки. Игра исчезает совсем — и добавленная вр…
       * Удаление карточки. Игра исчезает совсем — и добавленная вручную, и
       // Сохраняем пояснение разработчика: * найденная сканером. Чтобы находка сканера не вернулась при…
       * найденная сканером. Чтобы находка сканера не вернулась при следующей
       // Сохраняем пояснение разработчика: * проверке, её id попадает в список удалённых.
       * проверке, её id попадает в список удалённых.
       // Сохраняем пояснение разработчика: 
       */
      // Обрабатываем конструкцию: removeGame.
      removeGame: (id) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: const target = state.games.find((game) => game.id === i….
          const target = state.games.find((game) => game.id === id);
          // — разделитель логических блоков —

          // Проверяем бизнес-условие: target === undefined.
          if (target === undefined) {
            // Возвращаем результат: state.
            return state;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Возвращаем результат: { games: state.games.filter((game) => game.id !== id), ….
          return {
            // Обрабатываем конструкцию: games.
            games: state.games.filter((game) => game.id !== id),
            // Обрабатываем конструкцию: removedIds.
            removedIds: state.removedIds.includes(id)
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                state.removedIds
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                [id, ...state.removedIds].slice(0, MAX_REMOVED_GAMES),
            // Закрываем текущий блок.
          };
          // Закрываем текущий блок.
        }),
      // Обрабатываем конструкцию: updateGame.
      updateGame: (id, patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: games.
          games: state.games.map(
            // Продолжаем предыдущую конструкцию.
            (game) =>
              // Обрабатываем конструкцию: game.
              game.id === id ? { ...game, ...patch } : game
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })),
      // Сохраняем пояснение разработчика: // Обложки докачиваются в фоне: событие не знает id карточки…
      // Обложки докачиваются в фоне: событие не знает id карточки,
      // Сохраняем пояснение разработчика: // только appid из известной базы.
      // только appid из известной базы.
      // Обрабатываем конструкцию: updateGameByAppId.
      updateGameByAppId: (appId, patch) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: games.
          games: state.games.map(
            // Продолжаем предыдущую конструкцию.
            (game) =>
              // Обрабатываем конструкцию: game.
              game.appid === appId ? { ...game, ...patch } : game
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: addFolder.
      addFolder: (folder) =>
        // Обрабатываем конструкцию: set.
        set(
          // Продолжаем предыдущую конструкцию.
          (state) =>
            // Обрабатываем конструкцию: state.
            state.folders.some(
              // Объявляем функцию-обработчик или стрелочную функцию.
              (item) => item.toLowerCase() === folder.toLowerCase()
              // Закрываем выражение или список аргументов.
            )
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                state
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                { folders: [...state.folders, folder] }
          // Закрываем выражение или список аргументов.
        ),
      // Обрабатываем конструкцию: removeFolder.
      removeFolder: (folder) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: folders.
          folders: state.folders.filter(
            // Объявляем функцию-обработчик или стрелочную функцию.
            (item) => item.toLowerCase() !== folder.toLowerCase()
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: setScanStatus.
      setScanStatus: (scanStatus) => set({ scanStatus }),
      // Обрабатываем конструкцию: setScanProgress.
      setScanProgress: (scanProgress) => set({ scanProgress }),
      // Обрабатываем конструкцию: setCoverProgress.
      setCoverProgress: (coverProgress) => set({ coverProgress }),
      // Обрабатываем конструкцию: setError.
      setError: (error) =>
        // Обрабатываем конструкцию: set.
        set({ error, scanStatus: error === null ? "done" : "error" }),
      // Закрываем текущий блок.
    }),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:installed-games",
      // Обрабатываем конструкцию: version.
      version: INSTALLED_GAMES_STORE_VERSION,
      // Обрабатываем конструкцию: partialize.
      partialize: (state): PersistedInstalledGames => ({
        // Обрабатываем конструкцию: games.
        games: state.games,
        // Обрабатываем конструкцию: folders.
        folders: state.folders,
        // Обрабатываем конструкцию: removedIds.
        removedIds: state.removedIds,
        // Обрабатываем конструкцию: lastScannedAt.
        lastScannedAt: state.lastScannedAt,
        // Закрываем текущий блок.
      }),
      // Обрабатываем конструкцию: migrate.
      migrate: (persisted) => {
        // Обрабатываем конструкцию: const migrated = migratePersistedGames( persisted as Pa….
        const migrated = migratePersistedGames(
          // Обрабатываем конструкцию: persisted.
          persisted as Partial<PersistedInstalledGames> | undefined
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Возвращаем результат: { games: migrated.games, folders: migrated.folders, rem….
        return {
          // Обрабатываем конструкцию: games.
          games: migrated.games,
          // Обрабатываем конструкцию: folders.
          folders: migrated.folders,
          // Обрабатываем конструкцию: removedIds.
          removedIds: migrated.removedIds,
          // Обрабатываем конструкцию: lastScannedAt.
          lastScannedAt: migrated.lastScannedAt,
          // Закрываем текущий блок.
        };
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: merge.
      merge: (persisted, current) => {
        // Обрабатываем конструкцию: const source = persisted as Partial<PersistedInstalledG….
        const source = persisted as
          // Обрабатываем конструкцию: Partial.
          Partial<PersistedInstalledGames> | undefined;
        // — разделитель логических блоков —

        // Возвращаем результат: { ...current, games: source?.games ?? current.games, fo….
        return {
          // Разворачиваем ...current в коллекцию.
          ...current,
          // Обрабатываем конструкцию: games.
          games: source?.games ?? current.games,
          // Обрабатываем конструкцию: folders.
          folders: source?.folders ?? current.folders,
          // Обрабатываем конструкцию: removedIds.
          removedIds: source?.removedIds ?? current.removedIds,
          // Обрабатываем конструкцию: lastScannedAt.
          lastScannedAt: source?.lastScannedAt ?? current.lastScannedAt,
          // Закрываем текущий блок.
        };
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —
