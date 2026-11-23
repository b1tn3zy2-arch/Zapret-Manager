// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт GAME_SCAN_START_DELAY_MS.
  GAME_SCAN_START_DELAY_MS,
  // Подключаем именованный импорт GAME_SCAN_TIMEOUT_MS.
  GAME_SCAN_TIMEOUT_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/installedGames.
import { mergeScannedGames } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import {
  // Подключаем именованный импорт filterRemovedGames.
  filterRemovedGames,
  // Подключаем именованный импорт useInstalledGamesStore.
  useInstalledGamesStore,
  // Закрываем текущий блок.
} from "@/stores/useInstalledGamesStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// Импортируем зависимости из модуля @/types/ipcSchemas.
import { InstalledGameSchema } from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvokeValidated } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Обрабатываем конструкцию: let started = false.
let started = false;
// Обрабатываем конструкцию: let running: Promise<InstalledGame[]> | null = null.
let running: Promise<InstalledGame[]> | null = null;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function scanInstalledGames(): Promise<InstalledGame[]> {
  // Сохраняем пояснение разработчика: // Скан идёт долго: два обхода диска параллельно только меша…
  // Скан идёт долго: два обхода диска параллельно только мешают
  // Сохраняем пояснение разработчика: // друг другу. Второй вызов ждёт первый.
  // друг другу. Второй вызов ждёт первый.
  // Проверяем бизнес-условие: running !== null.
  if (running !== null) {
    // Возвращаем результат: running.
    return running;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: running.
  running = runScan();
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Возвращаем результат: await running.
    return await running;
    // Закрываем текущий блок.
  } finally {
    // Обрабатываем конструкцию: running.
    running = null;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: async.
async function runScan(): Promise<InstalledGame[]> {
  // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
  const store = useInstalledGamesStore.getState();
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: store.
  store.setScanStatus("scanning");
  // Обрабатываем конструкцию: store.
  store.setError(null);
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const scanned = await withTimeout( secureInvokeValidate….
    const scanned = await withTimeout(
      // Обрабатываем конструкцию: secureInvokeValidated.
      secureInvokeValidated(
        // Обрабатываем конструкцию: scan_installed_games.
        "scan_installed_games",
        // Обрабатываем конструкцию: InstalledGameSchema.
        InstalledGameSchema.array(),
        // Открываем объектный литерал.
        {
          // Обрабатываем конструкцию: userFolders.
          userFolders: store.folders,
          // Закрываем текущий блок.
        }
        // Закрываем выражение или список аргументов.
      ),
      // Обрабатываем конструкцию: GAME_SCAN_TIMEOUT_MS.
      GAME_SCAN_TIMEOUT_MS
      // Закрываем выражение или список аргументов.
    );
    // Сохраняем пояснение разработчика: // игры, удалённые крестиком, остаются удалёнными и после
    // игры, удалённые крестиком, остаются удалёнными и после
    // Сохраняем пояснение разработчика: // пересканирования — иначе карточка возвращалась бы через п…
    // пересканирования — иначе карточка возвращалась бы через пару секунд
    // Обрабатываем конструкцию: const merged = filterRemovedGames( mergeScannedGames(sc….
    const merged = filterRemovedGames(
      // Обрабатываем конструкцию: mergeScannedGames.
      mergeScannedGames(scanned.map(normalizeGame), store.games),
      // Обрабатываем конструкцию: store.
      store.removedIds
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.setGames(merged);
    // — разделитель логических блоков —

    // Возвращаем результат: merged.
    return merged;
    // Закрываем текущий блок.
  } catch (caught) {
    // Обрабатываем конструкцию: store.
    store.setError(caught instanceof Error ? caught.message : String(caught));
    // — разделитель логических блоков —

    // Возвращаем результат: store.games.
    return store.games;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Скан не должен висеть вечно: если обход диска затянулся, и…
 * Скан не должен висеть вечно: если обход диска затянулся, интерфейс
 // Сохраняем пояснение разработчика: * получает ошибку и может повторить попытку.
 * получает ошибку и может повторить попытку.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: async.
async function withTimeout<T>(
  // Обрабатываем конструкцию: promise.
  promise: Promise<T>,
  // Обрабатываем конструкцию: timeoutMs.
  timeoutMs: number
  // Закрываем выражение или список аргументов.
): Promise<T> {
  // Обрабатываем конструкцию: let timer = 0.
  let timer = 0;
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Возвращаем результат: await Promise.race([ promise, new Promise<never>((_reso….
    return await Promise.race([
      // Обрабатываем конструкцию: promise.
      promise,
      // Создаём экземпляр Promise.
      new Promise<never>((_resolve, reject) => {
        // Обрабатываем конструкцию: timer.
        timer = window.setTimeout(() => {
          // Обрабатываем конструкцию: reject.
          reject(new Error(translateKey("log.scanTimeout")));
          // Закрываем текущий блок.
        }, timeoutMs);
        // Закрываем текущий блок.
      }),
      // Закрываем массив или список.
    ]);
    // Закрываем текущий блок.
  } finally {
    // Обрабатываем конструкцию: window.
    window.clearTimeout(timer);
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию normalizeGame.
function normalizeGame(game: InstalledGame): InstalledGame {
  // Возвращаем результат: { ...game, ...(game.lastLaunchedAt === null || game.las….
  return {
    // Разворачиваем ...game в коллекцию.
    ...game,
    // Разворачиваем ...(game.lastLaunchedAt === null || game.last… в коллекцию.
    ...(game.lastLaunchedAt === null || game.lastLaunchedAt === undefined
      ? // Обрабатываем конструкцию: ?.
        // Продолжаем предыдущую конструкцию.
        {}
      : // Обрабатываем конструкцию: :.
        // Продолжаем предыдущую конструкцию.
        { lastLaunchedAt: game.lastLaunchedAt }),
    // Обрабатываем конструкцию: launchCount.
    launchCount: game.launchCount ?? 0,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function startInstalledGamesScan(): void {
  // Проверяем бизнес-условие: started.
  if (started) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: started.
  started = true;
  // Обрабатываем конструкцию: window.
  window.setTimeout(() => {
    // Обрабатываем конструкцию: void scanInstalledGames().
    void scanInstalledGames();
    // Закрываем текущий блок.
  }, GAME_SCAN_START_DELAY_MS);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
