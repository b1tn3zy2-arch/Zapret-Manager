import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { GameScanProgress, InstalledGame, ScanStatus } from "@/types";

const INSTALLED_GAMES_STORE_VERSION = 1;
const MAX_INSTALLED_GAMES = 200;

export interface InstalledGamesState {
  games: InstalledGame[];
  folders: string[];
  scanStatus: ScanStatus;
  scanProgress: GameScanProgress | null;
  lastScannedAt: number | null;
  error: string | null;
  setGames: (games: InstalledGame[]) => void;
  addGame: (game: InstalledGame) => void;
  removeGame: (id: string) => void;
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
  lastScannedAt: number | null;
} {
  const games = (persisted?.games ?? [])
    .map(sanitizeGame)
    .filter((game): game is InstalledGame => game !== null)
    .slice(0, MAX_INSTALLED_GAMES);
  const folders = (persisted?.folders ?? []).filter(
    (folder) => typeof folder === "string" && folder.trim() !== ""
  );

  return {
    games,
    folders,
    lastScannedAt:
      typeof persisted?.lastScannedAt === "number"
        ? persisted.lastScannedAt
        : null,
  };
}

export const useInstalledGamesStore = create<InstalledGamesState>()(
  persist(
    (set) => ({
      games: [],
      folders: [],
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
      removeGame: (id) =>
        set((state) => ({
          games: state.games.filter((game) => game.id !== id),
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
        lastScannedAt: state.lastScannedAt,
      }),
      migrate: (persisted) => {
        const migrated = migratePersistedGames(
          persisted as Partial<PersistedInstalledGames> | undefined
        );

        return {
          games: migrated.games,
          folders: migrated.folders,
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
          lastScannedAt: source?.lastScannedAt ?? current.lastScannedAt,
        };
      },
    }
  )
);
