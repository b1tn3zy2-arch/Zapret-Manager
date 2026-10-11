import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useCallback, useEffect, useMemo } from "react";

import { GAME_SCAN_EVENT } from "@/lib/constants";
import { scanInstalledGames, startInstalledGamesScan } from "@/lib/gameScan";
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
import type { GameScanProgress, InstalledGame, ScanStatus } from "@/types";

export interface UseInstalledGamesResult {
  games: InstalledGame[];
  folders: string[];
  scanStatus: ScanStatus;
  progress: GameScanProgress | null;
  error: string | null;
  lastScannedAt: number | null;
  addManualGame: (game: InstalledGame) => void;
  removeGame: (id: string) => void;
  updateGame: (id: string, patch: Partial<InstalledGame>) => void;
  addFolder: (folder: string) => Promise<void>;
  removeFolder: (folder: string) => Promise<void>;
}

export function useInstalledGames(): UseInstalledGamesResult {
  const games = useInstalledGamesStore((state) => state.games);
  const folders = useInstalledGamesStore((state) => state.folders);
  const scanStatus = useInstalledGamesStore((state) => state.scanStatus);
  const progress = useInstalledGamesStore((state) => state.scanProgress);
  const error = useInstalledGamesStore((state) => state.error);
  const lastScannedAt = useInstalledGamesStore((state) => state.lastScannedAt);

  useEffect(() => {
    startInstalledGamesScan();

    const subscription = listen<GameScanProgress>(GAME_SCAN_EVENT, (event) => {
      useInstalledGamesStore.getState().setScanProgress(event.payload);
    });

    return () => {
      void subscription.then((unlisten) => {
        unlisten();
      });
    };
  }, []);

  const addManualGame = useCallback((game: InstalledGame) => {
    useInstalledGamesStore.getState().addGame(game);
  }, []);

  const removeGame = useCallback((id: string) => {
    useInstalledGamesStore.getState().removeGame(id);
  }, []);

  const updateGame = useCallback(
    (id: string, patch: Partial<InstalledGame>) => {
      useInstalledGamesStore.getState().updateGame(id, patch);
    },
    []
  );

  const addFolder = useCallback(async (folder: string) => {
    useInstalledGamesStore.getState().addFolder(folder);
    await scanInstalledGames();
  }, []);

  const removeFolder = useCallback(async (folder: string) => {
    useInstalledGamesStore.getState().removeFolder(folder);
    await scanInstalledGames();
  }, []);

  return useMemo(
    () => ({
      games,
      folders,
      scanStatus,
      progress,
      error,
      lastScannedAt,
      addManualGame,
      removeGame,
      updateGame,
      addFolder,
      removeFolder,
    }),
    [
      games,
      folders,
      scanStatus,
      progress,
      error,
      lastScannedAt,
      addManualGame,
      removeGame,
      updateGame,
      addFolder,
      removeFolder,
    ]
  );
}

interface KnownGameMatch {
  appid: string;
  name: string;
  cover: string | null;
  domainSettingsId: string | null;
  anticheat: string;
  bypassMode: string | null;
}

async function enrichManualGames(): Promise<void> {
  const store = useInstalledGamesStore.getState();
  const pending = store.games.filter(
    (game) => game.manual === true && game.appid === undefined
  );

  for (const game of pending) {
    try {
      const match = await invoke<KnownGameMatch | null>("match_known_game", {
        name: game.name,
      });

      if (match === null) {
        continue;
      }

      useInstalledGamesStore.getState().updateGame(game.id, {
        appid: match.appid,
        name: match.name,
        ...(match.cover === null ? {} : { coverUrl: match.cover }),
        ...(match.domainSettingsId === null
          ? {}
          : { gameSettingsId: match.domainSettingsId }),
        anticheat: match.anticheat as NonNullable<InstalledGame["anticheat"]>,
        ...(match.bypassMode === null
          ? {}
          : {
              bypassMode: match.bypassMode as NonNullable<
                InstalledGame["bypassMode"]
              >,
            }),
      });
    } catch {
      continue;
    }
  }
}

export async function matchManualGame(
  name: string
): Promise<KnownGameMatch | null> {
  try {
    return await invoke<KnownGameMatch | null>("match_known_game", { name });
  } catch {
    return null;
  }
}

export function useInstalledGamesStartup(): void {
  useEffect(() => {
    startInstalledGamesScan();
    void enrichManualGames();

    const subscription = listen<GameScanProgress>(GAME_SCAN_EVENT, (event) => {
      useInstalledGamesStore.getState().setScanProgress(event.payload);
    });

    return () => {
      void subscription.then((unlisten) => {
        unlisten();
      });
    };
  }, []);
}
