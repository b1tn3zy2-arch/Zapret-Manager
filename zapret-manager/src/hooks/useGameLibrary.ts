import { useCallback } from "react";

import { generateGameId } from "@/lib/gameUtils";
import { MAX_GAMES } from "@/lib/settingsLimits";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { GameSettings } from "@/types";

export interface UseGameLibraryResult {
  games: GameSettings[];
  updateGame: (id: string, patch: Partial<GameSettings>) => void;
  addGame: (seed?: Partial<GameSettings>) => GameSettings | null;
  removeGame: (id: string) => void;
  resetGames: () => void;
}

export function useGameLibrary(): UseGameLibraryResult {
  const games = useSettingsStore((state) => state.settings.games);
  const updateGameInStore = useSettingsStore((state) => state.updateGame);
  const addGameToStore = useSettingsStore((state) => state.addGame);
  const removeGameFromStore = useSettingsStore((state) => state.removeGame);
  const resetGamesInStore = useSettingsStore((state) => state.resetGames);

  const updateGame = useCallback(
    (id: string, patch: Partial<GameSettings>): void => {
      updateGameInStore(id, patch);
    },
    [updateGameInStore]
  );

  const addGame = useCallback(
    (seed?: Partial<GameSettings>): GameSettings | null => {
      const current = useSettingsStore.getState().settings.games;

      if (current.length >= MAX_GAMES) {
        return null;
      }

      const name = seed?.name ?? "";
      const game: GameSettings = {
        id: generateGameId(
          name === "" ? "game" : name,
          current.map((item) => item.id)
        ),
        name,
        icon: seed?.icon ?? "Gamepad2",
        enabled: seed?.enabled ?? false,
        priority: false,
        builtin: false,
        domains: seed?.domains ?? [],
        ipRanges: seed?.ipRanges ?? [],
        ports: seed?.ports ?? [],
        autoRestore: seed?.autoRestore ?? true,
        createBackup: seed?.createBackup ?? true,
        createdAt: Date.now(),
      };

      addGameToStore(game);

      return game;
    },
    [addGameToStore]
  );

  const removeGame = useCallback(
    (id: string): void => {
      removeGameFromStore(id);
    },
    [removeGameFromStore]
  );

  const resetGames = useCallback((): void => {
    resetGamesInStore();
  }, [resetGamesInStore]);

  return {
    games,
    updateGame,
    addGame,
    removeGame,
    resetGames,
  };
}
