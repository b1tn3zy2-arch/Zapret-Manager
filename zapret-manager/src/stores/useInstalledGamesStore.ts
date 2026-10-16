import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GameScanProgress, InstalledGame, ScanStatus } from "@/types";

const INSTALLED_GAMES_STORE_VERSION = 2;
const MAX_INSTALLED_GAMES = 200;
const MAX_HIDDEN_GAMES = 200;

export interface InstalledGamesState {
  games: InstalledGame[];
  folders: string[];
  hiddenIds: string[];
  scanStatus: ScanStatus;
  scanProgress: GameScanProgress | null;
  lastScannedAt: number | null;
  error: string | null;
  setGames: (games: InstalledGame[]) => void;
  addGame: (game: InstalledGame) => void;
  removeGame: (id: string) => void;
  restoreHiddenGames: () => void;
  updateGame: (id: string, patch: Partial<InstalledGame>) => void;
  addFolder: (folder: string) => void;
  removeFolder: (folder: string) => void;
  setScanStatus: (status: ScanStatus) => void;
  setScanProgress: (progress: GameScanProgress | null) => void;
  setError: (error: string | null) => void;
}

interface PersistedInstalledGames {
  games?: InstalledGame[];
  folders?: string[];
  hiddenIds?: string[];
  lastScannedAt?: number | null;
}

function sanitizeGame(value: unknown): InstalledGame | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const game = value as Partial<InstalledGame>;

  if (
    typeof game.id !== "string" ||
    typeof game.name !== "string" ||
    typeof game.executablePath !== "string" ||
    typeof game.installPath !== "string"
  ) {
    return null;
  }

  return {
    ...game,
    name: game.name.trim() || game.executablePath,
    launchCount: typeof game.launchCount === "number" ? game.launchCount : 0,
    ...(typeof game.lastLaunchedAt === "number"
      ? { lastLaunchedAt: game.lastLaunchedAt }
      : { lastLaunchedAt: undefined }),
  } as InstalledGame;
}

export function migratePersistedGames(
  persisted: Partial<PersistedInstalledGames> | undefined
): {
  games: InstalledGame[];
  folders: string[];
  hiddenIds: string[];
  lastScannedAt: number | null;
} {
  const games = (persisted?.games ?? [])
    .map(sanitizeGame)
    .filter((game): game is InstalledGame => game !== null)
    .slice(0, MAX_INSTALLED_GAMES);
  const folders = (persisted?.folders ?? []).filter(
    (folder) => typeof folder === "string" && folder.trim() !== ""
  );
  const hiddenIds = [
    ...new Set(
      (persisted?.hiddenIds ?? []).filter(
        (id): id is string => typeof id === "string" && id.trim() !== ""
      )
    ),
  ].slice(0, MAX_HIDDEN_GAMES);

  return {
    games,
    folders,
    hiddenIds,
    lastScannedAt:
      typeof persisted?.lastScannedAt === "number"
        ? persisted.lastScannedAt
        : null,
  };
}

/**
 * Игры, которые пользователь убрал с экрана. Сканер их не забывает: без этого
 * списка находка возвращалась бы на страницу «Игры» при каждом пересканировании.
 */
export function filterHiddenGames(
  games: InstalledGame[],
  hiddenIds: readonly string[]
): InstalledGame[] {
  if (hiddenIds.length === 0) {
    return games;
  }

  const hidden = new Set(hiddenIds);

  return games.filter((game) => !hidden.has(game.id));
}

export const useInstalledGamesStore = create<InstalledGamesState>()(
  persist(
    (set) => ({
      games: [],
      folders: [],
      hiddenIds: [],
      scanStatus: "idle",
      scanProgress: null,
      lastScannedAt: null,
      error: null,
      setGames: (games) =>
        set({
          games: games.slice(0, MAX_INSTALLED_GAMES),
          scanStatus: "done",
          scanProgress: null,
          lastScannedAt: Date.now(),
          error: null,
        }),
      addGame: (game) =>
        set((state) =>
          state.games.some((item) => item.id === game.id)
            ? state
            : {
                games: [game, ...state.games].slice(0, MAX_INSTALLED_GAMES),
                scanStatus: state.scanStatus,
              }
        ),
      /**
       * Удаление карточки. Игры, добавленные вручную, исчезают совсем; найденные
       * сканером просто скрываются, иначе они вернулись бы при следующей
       * проверке. Скрытые можно вернуть кнопкой на странице «Игры».
       */
      removeGame: (id) =>
        set((state) => {
          const target = state.games.find((game) => game.id === id);

          if (target === undefined) {
            return state;
          }

          if (target.manual === true) {
            return {
              games: state.games.filter((game) => game.id !== id),
              hiddenIds: state.hiddenIds.filter((hidden) => hidden !== id),
            };
          }

          return {
            games: state.games.filter((game) => game.id !== id),
            hiddenIds: [id, ...state.hiddenIds]
              .filter((hidden, index, list) => list.indexOf(hidden) === index)
              .slice(0, MAX_HIDDEN_GAMES),
          };
        }),
      restoreHiddenGames: () =>
        set((state) => ({
          hiddenIds: [],
          games: state.games,
        })),
      updateGame: (id, patch) =>
        set((state) => ({
          games: state.games.map((game) =>
            game.id === id ? { ...game, ...patch } : game
          ),
        })),
      addFolder: (folder) =>
        set((state) =>
          state.folders.some(
            (item) => item.toLowerCase() === folder.toLowerCase()
          )
            ? state
            : { folders: [...state.folders, folder] }
        ),
      removeFolder: (folder) =>
        set((state) => ({
          folders: state.folders.filter(
            (item) => item.toLowerCase() !== folder.toLowerCase()
          ),
        })),
      setScanStatus: (scanStatus) => set({ scanStatus }),
      setScanProgress: (scanProgress) => set({ scanProgress }),
      setError: (error) =>
        set({ error, scanStatus: error === null ? "done" : "error" }),
    }),
    {
      name: "zapret-manager:installed-games",
      version: INSTALLED_GAMES_STORE_VERSION,
      partialize: (state): PersistedInstalledGames => ({
        games: state.games,
        folders: state.folders,
        hiddenIds: state.hiddenIds,
        lastScannedAt: state.lastScannedAt,
      }),
      migrate: (persisted) => {
        const migrated = migratePersistedGames(
          persisted as Partial<PersistedInstalledGames> | undefined
        );

        return {
          games: migrated.games,
          folders: migrated.folders,
          hiddenIds: migrated.hiddenIds,
          lastScannedAt: migrated.lastScannedAt,
        };
      },
      merge: (persisted, current) => {
        const source = persisted as
          Partial<PersistedInstalledGames> | undefined;

        return {
          ...current,
          games: source?.games ?? current.games,
          folders: source?.folders ?? current.folders,
          hiddenIds: source?.hiddenIds ?? current.hiddenIds,
          lastScannedAt: source?.lastScannedAt ?? current.lastScannedAt,
        };
      },
    }
  )
);
