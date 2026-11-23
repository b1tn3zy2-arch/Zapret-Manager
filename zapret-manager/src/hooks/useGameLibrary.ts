// Импортируем зависимости из модуля react.
import { useCallback } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/gameUtils.
import { generateGameId } from "@/lib/gameUtils";
// Импортируем зависимости из модуля @/lib/settingsLimits.
import { MAX_GAMES } from "@/lib/settingsLimits";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseGameLibraryResult {
  // Обрабатываем конструкцию: games.
  games: GameSettings[];
  // Обрабатываем конструкцию: updateGame.
  updateGame: (id: string, patch: Partial<GameSettings>) => void;
  // Обрабатываем конструкцию: addGame.
  addGame: (seed?: Partial<GameSettings>) => GameSettings | null;
  // Обрабатываем конструкцию: removeGame.
  removeGame: (id: string) => void;
  // Обрабатываем конструкцию: resetGames.
  resetGames: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useGameLibrary(): UseGameLibraryResult {
  // Обрабатываем конструкцию: const games = useSettingsStore((state) => state.setting….
  const games = useSettingsStore((state) => state.settings.games);
  // Обрабатываем конструкцию: const updateGameInStore = useSettingsStore((state) => s….
  const updateGameInStore = useSettingsStore((state) => state.updateGame);
  // Обрабатываем конструкцию: const addGameToStore = useSettingsStore((state) => stat….
  const addGameToStore = useSettingsStore((state) => state.addGame);
  // Обрабатываем конструкцию: const removeGameFromStore = useSettingsStore((state) =>….
  const removeGameFromStore = useSettingsStore((state) => state.removeGame);
  // Обрабатываем конструкцию: const resetGamesInStore = useSettingsStore((state) => s….
  const resetGamesInStore = useSettingsStore((state) => state.resetGames);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const updateGame = useCallback( (id: string, patch: Par….
  const updateGame = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (id: string, patch: Partial<GameSettings>): void => {
      // Обрабатываем конструкцию: updateGameInStore.
      updateGameInStore(id, patch);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [updateGameInStore]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const addGame = useCallback( (seed?: Partial<GameSettin….
  const addGame = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (seed?: Partial<GameSettings>): GameSettings | null => {
      // Обрабатываем конструкцию: const current = useSettingsStore.getState().settings.ga….
      const current = useSettingsStore.getState().settings.games;
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: current.length >= MAX_GAMES.
      if (current.length >= MAX_GAMES) {
        // Возвращаем результат: null.
        return null;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const name = seed?.name ??.
      const name = seed?.name ?? "";
      // Обрабатываем конструкцию: const game: GameSettings = { id: generateGameId( name =….
      const game: GameSettings = {
        // Обрабатываем конструкцию: id.
        id: generateGameId(
          // Обрабатываем конструкцию: name.
          name === "" ? "game" : name,
          // Обрабатываем конструкцию: current.
          current.map((item) => item.id)
          // Закрываем выражение или список аргументов.
        ),
        // Передаём поле name в объект.
        name,
        // Обрабатываем конструкцию: icon.
        icon: seed?.icon ?? "Gamepad2",
        // Обрабатываем конструкцию: enabled.
        enabled: seed?.enabled ?? false,
        // Обрабатываем конструкцию: builtin.
        builtin: false,
        // Обрабатываем конструкцию: domains.
        domains: seed?.domains ?? [],
        // Обрабатываем конструкцию: ipRanges.
        ipRanges: seed?.ipRanges ?? [],
        // Обрабатываем конструкцию: ports.
        ports: seed?.ports ?? [],
        // Обрабатываем конструкцию: autoRestore.
        autoRestore: seed?.autoRestore ?? true,
        // Обрабатываем конструкцию: createBackup.
        createBackup: seed?.createBackup ?? true,
        // Обрабатываем конструкцию: createdAt.
        createdAt: Date.now(),
        // Закрываем текущий блок.
      };
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addGameToStore.
      addGameToStore(game);
      // — разделитель логических блоков —

      // Возвращаем результат: game.
      return game;
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addGameToStore]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const removeGame = useCallback( (id: string): void => {….
  const removeGame = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (id: string): void => {
      // Обрабатываем конструкцию: removeGameFromStore.
      removeGameFromStore(id);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [removeGameFromStore]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const resetGames = useCallback((): void => { resetGames….
  const resetGames = useCallback((): void => {
    // Обрабатываем конструкцию: resetGamesInStore.
    resetGamesInStore();
    // Закрываем текущий блок.
  }, [resetGamesInStore]);
  // — разделитель логических блоков —

  // Возвращаем результат: { games, updateGame, addGame, removeGame, resetGames, }.
  return {
    // Передаём поле games в объект.
    games,
    // Передаём поле updateGame в объект.
    updateGame,
    // Передаём поле addGame в объект.
    addGame,
    // Передаём поле removeGame в объект.
    removeGame,
    // Передаём поле resetGames в объект.
    resetGames,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
