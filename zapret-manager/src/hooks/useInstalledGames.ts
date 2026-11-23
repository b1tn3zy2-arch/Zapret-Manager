// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @tauri-apps/api/event.
import { listen } from "@tauri-apps/api/event";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт GAME_AUTORESCAN_INTERVAL_MS.
  GAME_AUTORESCAN_INTERVAL_MS,
  // Подключаем именованный импорт GAME_COVER_EVENT.
  GAME_COVER_EVENT,
  // Подключаем именованный импорт GAME_SCAN_EVENT.
  GAME_SCAN_EVENT,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/gameScan.
import { scanInstalledGames, startInstalledGamesScan } from "@/lib/gameScan";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
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
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { KnownGameMatchSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseInstalledGamesResult {
  // Обрабатываем конструкцию: games.
  games: InstalledGame[];
  // Обрабатываем конструкцию: folders.
  folders: string[];
  // Обрабатываем конструкцию: scanStatus.
  scanStatus: ScanStatus;
  // Обрабатываем конструкцию: progress.
  progress: GameScanProgress | null;
  // Сохраняем пояснение разработчика: Ход докачки обложек.
  /** Ход докачки обложек. */
  // Обрабатываем конструкцию: coverProgress.
  coverProgress: GameCoverProgress | null;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: lastScannedAt.
  lastScannedAt: number | null;
  // Обрабатываем конструкцию: addManualGame.
  addManualGame: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: removeGame.
  removeGame: (id: string) => void;
  // Обрабатываем конструкцию: updateGame.
  updateGame: (id: string, patch: Partial<InstalledGame>) => void;
  // Обрабатываем конструкцию: addFolder.
  addFolder: (folder: string) => Promise<void>;
  // Обрабатываем конструкцию: rescan.
  rescan: () => Promise<void>;
  // Обрабатываем конструкцию: removeFolder.
  removeFolder: (folder: string) => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useInstalledGames(): UseInstalledGamesResult {
  // Обрабатываем конструкцию: const games = useInstalledGamesStore((state) => state.g….
  const games = useInstalledGamesStore((state) => state.games);
  // Обрабатываем конструкцию: const folders = useInstalledGamesStore((state) => state….
  const folders = useInstalledGamesStore((state) => state.folders);
  // Обрабатываем конструкцию: const scanStatus = useInstalledGamesStore((state) => st….
  const scanStatus = useInstalledGamesStore((state) => state.scanStatus);
  // Обрабатываем конструкцию: const progress = useInstalledGamesStore((state) => stat….
  const progress = useInstalledGamesStore((state) => state.scanProgress);
  // Обрабатываем конструкцию: const coverProgress = useInstalledGamesStore((state) =>….
  const coverProgress = useInstalledGamesStore((state) => state.coverProgress);
  // Обрабатываем конструкцию: const error = useInstalledGamesStore((state) => state.e….
  const error = useInstalledGamesStore((state) => state.error);
  // Обрабатываем конструкцию: const lastScannedAt = useInstalledGamesStore((state) =>….
  const lastScannedAt = useInstalledGamesStore((state) => state.lastScannedAt);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: startInstalledGamesScan.
    startInstalledGamesScan();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const subscription = listen<GameScanProgress>(GAME_SCAN….
    const subscription = listen<GameScanProgress>(GAME_SCAN_EVENT, (event) => {
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().setScanProgress(event.payload);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const covers = listen<GameCoverProgress>(GAME_COVER_EVE….
    const covers = listen<GameCoverProgress>(GAME_COVER_EVENT, (event) => {
      // Обрабатываем конструкцию: handleCoverEvent.
      handleCoverEvent(event.payload);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { void subscription.then((unlisten) => { unlisten….
    return () => {
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Обрабатываем конструкцию: void covers.then((unlisten) => { unlisten(); }).
      void covers.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const addManualGame = useCallback((game: InstalledGame)….
  const addManualGame = useCallback((game: InstalledGame) => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().addGame(game);
    // Обрабатываем конструкцию: fetchManualCover.
    fetchManualCover(game);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const removeGame = useCallback((id: string) => { useIns….
  const removeGame = useCallback((id: string) => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().removeGame(id);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const updateGame = useCallback( (id: string, patch: Par….
  const updateGame = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (id: string, patch: Partial<InstalledGame>) => {
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().updateGame(id, patch);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    []
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Пересканирование по кнопке: раньше повторный скан можно б…
  // Пересканирование по кнопке: раньше повторный скан можно было запустить
  // Сохраняем пояснение разработчика: // только удалением папки, поэтому новая установленная игра …
  // только удалением папки, поэтому новая установленная игра не появлялась,
  // Сохраняем пояснение разработчика: // пока приложение не перезапускали.
  // пока приложение не перезапускали.
  // Обрабатываем конструкцию: const rescan = useCallback(async () => { await scanInst….
  const rescan = useCallback(async () => {
    // Ожидаем завершение асинхронной операции await scanInstalledGames().
    await scanInstalledGames();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const addFolder = useCallback(async (folder: string) =>….
  const addFolder = useCallback(async (folder: string) => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().addFolder(folder);
    // Ожидаем завершение асинхронной операции await scanInstalledGames().
    await scanInstalledGames();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const removeFolder = useCallback(async (folder: string)….
  const removeFolder = useCallback(async (folder: string) => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.getState().removeFolder(folder);
    // Ожидаем завершение асинхронной операции await scanInstalledGames().
    await scanInstalledGames();
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo( () => ({ games, folders, scanStatus, progress,….
  return useMemo(
    // Объявляем функцию-обработчик или стрелочную функцию.
    () => ({
      // Передаём поле games в объект.
      games,
      // Передаём поле folders в объект.
      folders,
      // Передаём поле scanStatus в объект.
      scanStatus,
      // Передаём поле progress в объект.
      progress,
      // Передаём поле coverProgress в объект.
      coverProgress,
      // Передаём поле error в объект.
      error,
      // Передаём поле lastScannedAt в объект.
      lastScannedAt,
      // Передаём поле addManualGame в объект.
      addManualGame,
      // Передаём поле removeGame в объект.
      removeGame,
      // Передаём поле updateGame в объект.
      updateGame,
      // Передаём поле addFolder в объект.
      addFolder,
      // Передаём поле removeFolder в объект.
      removeFolder,
      // Передаём поле rescan в объект.
      rescan,
      // Закрываем текущий блок.
    }),
    // Открываем массив.
    [
      // Обрабатываем конструкцию: games.
      games,
      // Обрабатываем конструкцию: folders.
      folders,
      // Обрабатываем конструкцию: scanStatus.
      scanStatus,
      // Обрабатываем конструкцию: progress.
      progress,
      // Обрабатываем конструкцию: coverProgress.
      coverProgress,
      // Обрабатываем конструкцию: error.
      error,
      // Обрабатываем конструкцию: lastScannedAt.
      lastScannedAt,
      // Обрабатываем конструкцию: addManualGame.
      addManualGame,
      // Обрабатываем конструкцию: removeGame.
      removeGame,
      // Обрабатываем конструкцию: updateGame.
      updateGame,
      // Обрабатываем конструкцию: addFolder.
      addFolder,
      // Обрабатываем конструкцию: removeFolder.
      removeFolder,
      // Обрабатываем конструкцию: rescan.
      rescan,
      // Закрываем массив или список.
    ]
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс KnownGameMatch с контрактом данных.
interface KnownGameMatch {
  // Обрабатываем конструкцию: appid.
  appid: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: cover.
  cover: string | null;
  // Обрабатываем конструкцию: domainSettingsId.
  domainSettingsId: string | null;
  // Обрабатываем конструкцию: anticheat.
  anticheat: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Событие докачки обложки в фоне.
 * Событие докачки обложки в фоне.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Скан теперь отвечает сразу, а обложки едут/backend паралле…
 * Скан теперь отвечает сразу, а обложки едут/backend параллельно. Событие
 // Сохраняем пояснение разработчика: * несёт счётчик для индикатора и, если картинка получена, ap…
 * несёт счётчик для индикатора и, если картинка получена, appid с путём
 // Сохраняем пояснение разработчика: * файла — тогда обновляется только соответствующая карточка.
 * файла — тогда обновляется только соответствующая карточка.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию handleCoverEvent.
function handleCoverEvent(payload: GameCoverProgress): void {
  // Обрабатываем конструкцию: const state = useInstalledGamesStore.getState().
  const state = useInstalledGamesStore.getState();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: state.
  state.setCoverProgress(payload);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Приоритет — id карточки: у игр не из Steam AppID мог появ…
  // Приоритет — id карточки: у игр не из Steam AppID мог появиться только
  // Сохраняем пояснение разработчика: // что (поиск по названию в фоне), и по нему карточку было н…
  // что (поиск по названию в фоне), и по нему карточку было не найти.
  // Проверяем бизнес-условие: payload.gameId.
  if (payload.gameId) {
    // Обрабатываем конструкцию: state.
    state.updateGame(payload.gameId, {
      // Разворачиваем ...(payload.coverPath ? { coverPath: payload.… в коллекцию.
      ...(payload.coverPath ? { coverPath: payload.coverPath } : {}),
      // Разворачиваем ...(payload.appId ? { appid: payload.appId } … в коллекцию.
      ...(payload.appId ? { appid: payload.appId } : {}),
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: payload.appId && payload.coverPath.
  if (payload.appId && payload.coverPath) {
    // Обрабатываем конструкцию: state.
    state.updateGameByAppId(payload.appId, { coverPath: payload.coverPath });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Докачивает обложку игры, добавленной вручную.
 * Докачивает обложку игры, добавленной вручную.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Обложка не нужна, чтобы игра считалась добавленной, поэтом…
 * Обложка не нужна, чтобы игра считалась добавленной, поэтому запрос идёт
 // Сохраняем пояснение разработчика: * после вставки в список и не блокирует интерфейс.
 * после вставки в список и не блокирует интерфейс.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: async.
async function fetchManualCover(game: InstalledGame): Promise<void> {
  // Проверяем бизнес-условие: game.coverPath.
  if (game.coverPath) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const path = await secureInvoke<string | null>(game_cov….
    const path = await secureInvoke<string | null>("game_cover_for", {
      // Обрабатываем конструкцию: appid.
      appid: game.appid ?? null,
      // Обрабатываем конструкцию: name.
      name: game.name,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: path !== null.
    if (path !== null) {
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore
        // Продолжаем цепочку вызовов.
        .getState()
        // Продолжаем цепочку вызовов.
        .updateGame(game.id, { coverPath: path });
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  } catch {
    // Сохраняем пояснение разработчика: // Нет сети или игра не нашлась — остаётся заглушка с назван…
    // Нет сети или игра не нашлась — остаётся заглушка с названием.
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function enrichManualGames(): Promise<void> {
  // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
  const store = useInstalledGamesStore.getState();
  // Обрабатываем конструкцию: const pending = store.games.filter( (game) => game.manu….
  const pending = store.games.filter(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (game) => game.manual === true && game.appid === undefined
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Перебираем элементы коллекции pending.
  for (const game of pending) {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const match = await secureInvoke<KnownGameMatch | null>….
      const match = await secureInvoke<KnownGameMatch | null>(
        // Обрабатываем конструкцию: match_known_game.
        "match_known_game",
        // Открываем объектный литерал.
        {
          // Обрабатываем конструкцию: name.
          name: game.name,
          // Закрываем текущий блок.
        }
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: match === null.
      if (match === null) {
        // Переходим к следующей итерации цикла.
        continue;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const enriched = { ...game, appid: match.appid, name: m….
      const enriched = {
        // Разворачиваем ...game в коллекцию.
        ...game,
        // Обрабатываем конструкцию: appid.
        appid: match.appid,
        // Обрабатываем конструкцию: name.
        name: match.name,
        // Обрабатываем конструкцию: coverUrl.
        coverUrl: match.cover,
        // Обрабатываем конструкцию: gameSettingsId.
        gameSettingsId: match.domainSettingsId,
        // Обрабатываем конструкцию: anticheat.
        anticheat: match.anticheat as NonNullable<InstalledGame["anticheat"]>,
        // Закрываем текущий блок.
      };
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().updateGame(game.id, {
        // Обрабатываем конструкцию: appid.
        appid: enriched.appid,
        // Обрабатываем конструкцию: name.
        name: enriched.name,
        // Разворачиваем ...(match.cover === null ? {} : { coverUrl: m… в коллекцию.
        ...(match.cover === null ? {} : { coverUrl: match.cover }),
        // Разворачиваем ...(match.domainSettingsId === null ? {} : { … в коллекцию.
        ...(match.domainSettingsId === null
          ? // Обрабатываем конструкцию: ?.
            // Продолжаем предыдущую конструкцию.
            {}
          : // Обрабатываем конструкцию: :.
            // Продолжаем предыдущую конструкцию.
            { gameSettingsId: match.domainSettingsId }),
        // Обрабатываем конструкцию: anticheat.
        anticheat: match.anticheat as NonNullable<InstalledGame["anticheat"]>,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void fetchManualCover(enriched).
      void fetchManualCover(enriched);
      // Закрываем текущий блок.
    } catch {
      // Переходим к следующей итерации цикла.
      continue;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function matchManualGame(
  // Обрабатываем конструкцию: name.
  name: string
  // Закрываем выражение или список аргументов.
): Promise<KnownGameMatch | null> {
  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Возвращаем результат: await secureInvokeValidated( match_known_game, KnownGam….
    return await secureInvokeValidated(
      // Обрабатываем конструкцию: match_known_game.
      "match_known_game",
      // Обрабатываем конструкцию: KnownGameMatchSchema.
      KnownGameMatchSchema.nullable(),
      // Открываем объектный литерал.
      {
        // Передаём поле name в объект.
        name,
        // Закрываем текущий блок.
      }
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useInstalledGamesStartup(): void {
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: startInstalledGamesScan.
    startInstalledGamesScan();
    // Обрабатываем конструкцию: void enrichManualGames().
    void enrichManualGames();
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Пока приложение живёт, сканер сам повторяет обход каждые …
    // Пока приложение живёт, сканер сам повторяет обход каждые десять минут:
    // Сохраняем пояснение разработчика: // freshly installed игра появляется в списке без нажатий и …
    // freshly installed игра появляется в списке без нажатий и без
    // Сохраняем пояснение разработчика: // перезапуска. Повторный вызов scanInstalledGames параллель…
    // перезапуска. Повторный вызов scanInstalledGames параллельно
    // Сохраняем пояснение разработчика: // безопасен — внутри он ждёт предыдущий скан.
    // безопасен — внутри он ждёт предыдущий скан.
    // Обрабатываем конструкцию: const rescanTimer = window.setInterval(() => { void sca….
    const rescanTimer = window.setInterval(() => {
      // Обрабатываем конструкцию: void scanInstalledGames().
      void scanInstalledGames();
      // Закрываем текущий блок.
    }, GAME_AUTORESCAN_INTERVAL_MS);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const subscription = listen<GameScanProgress>(GAME_SCAN….
    const subscription = listen<GameScanProgress>(GAME_SCAN_EVENT, (event) => {
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().setScanProgress(event.payload);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const covers = listen<GameCoverProgress>(GAME_COVER_EVE….
    const covers = listen<GameCoverProgress>(GAME_COVER_EVENT, (event) => {
      // Обрабатываем конструкцию: handleCoverEvent.
      handleCoverEvent(event.payload);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(rescanTimer); void subscri….
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(rescanTimer);
      // Обрабатываем конструкцию: void subscription.then((unlisten) => { unlisten(); }).
      void subscription.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Обрабатываем конструкцию: void covers.then((unlisten) => { unlisten(); }).
      void covers.then((unlisten) => {
        // Обрабатываем конструкцию: unlisten.
        unlisten();
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, []);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
