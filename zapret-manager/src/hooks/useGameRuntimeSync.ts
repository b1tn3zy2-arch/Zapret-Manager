// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useEffect } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useGameRuntimeStore.
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Сверяет сохранённое состояние запущенных игр с реальными п…
 * Сверяет сохранённое состояние запущенных игр с реальными процессами.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Стор переживает перезапуск приложения — иначе кнопка «Закр…
 * Стор переживает перезапуск приложения — иначе кнопка «Закрыть
 // Сохраняем пояснение разработчика: * игру» исчезала бы у всё ещё работающей игры. Но после пере…
 * игру» исчезала бы у всё ещё работающей игры. Но после перезапуска
 // Сохраняем пояснение разработчика: * PID из прошлого сеанса уже ничем не соответствуют, и isRun…
 * PID из прошлого сеанса уже ничем не соответствуют, и `isRunning()`
 // Сохраняем пояснение разработчика: * отвечал бы «да» по устаревшим данным. Мёртвые записи убира…
 * отвечал бы «да» по устаревшим данным. Мёртвые записи убираются.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * То же верно для отметок «запущена вне приложения»: без про…
 * То же верно для отметок «запущена вне приложения»: без проверки
 // Сохраняем пояснение разработчика: * игра, закрытая пока приложение было выключено, оставалась …
 * игра, закрытая пока приложение было выключено, оставалась бы
 // Сохраняем пояснение разработчика: * «запущенной» вечно — отметка ставится по пути к exe, поэто…
 * «запущенной» вечно — отметка ставится по пути к exe, поэтому и
 // Сохраняем пояснение разработчика: * проверяется тем же способом.
 * проверяется тем же способом.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export function useGameRuntimeSync(): void {
  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const runtime = useGameRuntimeStore.getState().
    const runtime = useGameRuntimeStore.getState();
    // — разделитель логических блоков —

    // Перебираем элементы коллекции Object.keys(runtime.running).
    for (const gameId of Object.keys(runtime.running)) {
      // Обрабатываем конструкцию: const pids = runtime.pidsOf(gameId).
      const pids = runtime.pidsOf(gameId);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: pids.length === 0.
      if (pids.length === 0) {
        // Обрабатываем конструкцию: useGameRuntimeStore.
        useGameRuntimeStore.getState().markStopped(gameId);
        // Переходим к следующей итерации цикла.
        continue;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: void secureInvoke<boolean>(is_game_running, { pids }) .….
      void secureInvoke<boolean>("is_game_running", { pids })
        // Продолжаем цепочку вызовов.
        .then((running) => {
          // Проверяем бизнес-условие: !running.
          if (!running) {
            // Обрабатываем конструкцию: useGameRuntimeStore.
            useGameRuntimeStore.getState().markStopped(gameId);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        })
        // Продолжаем цепочку вызовов.
        .catch(() => {
          // Обрабатываем конструкцию: useGameRuntimeStore.
          useGameRuntimeStore.getState().markStopped(gameId);
          // Закрываем текущий блок.
        });
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const games = useInstalledGamesStore.getState().games.
    const games = useInstalledGamesStore.getState().games;
    // Обрабатываем конструкцию: const knownIds = new Set(games.map((game) => game.id)).
    const knownIds = new Set(games.map((game) => game.id));
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // Осиротевшие отметки: у старых версий приложения была друг…
    // Осиротевшие отметки: у старых версий приложения была другая схема
    // Сохраняем пояснение разработчика: // id игр — такие ключи уже не совпадут ни с одной карточкой…
    // id игр — такие ключи уже не совпадут ни с одной карточкой и
    // Сохраняем пояснение разработчика: // оставались бы в persist-сторе навсегда.
    // оставались бы в persist-сторе навсегда.
    // Перебираем элементы коллекции Object.keys(runtime.runningByPath).
    for (const staleKey of Object.keys(runtime.runningByPath)) {
      // Проверяем бизнес-условие: runtime.runningByPath[staleKey] === true && !knownIds.h….
      if (runtime.runningByPath[staleKey] === true && !knownIds.has(staleKey)) {
        // Обрабатываем конструкцию: useGameRuntimeStore.
        useGameRuntimeStore.getState().clearRunningByPath(staleKey);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const flagged = games.filter( (game) => runtime.running….
    const flagged = games.filter(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (game) => runtime.runningByPath[game.id] === true
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: flagged.length === 0.
    if (flagged.length === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void secureInvoke<string[]>(running_games, { paths: fla….
    void secureInvoke<string[]>("running_games", {
      // Обрабатываем конструкцию: paths.
      paths: flagged.map((game) => game.executablePath),
      // Закрываем текущий блок.
    })
      // Продолжаем цепочку вызовов.
      .then((running) => {
        // Обрабатываем конструкцию: const runningSet = new Set(running.map((path) => path.t….
        const runningSet = new Set(running.map((path) => path.toLowerCase()));
        // — разделитель логических блоков —

        // Перебираем элементы коллекции flagged.
        for (const game of flagged) {
          // Проверяем бизнес-условие: !runningSet.has(game.executablePath.toLowerCase()).
          if (!runningSet.has(game.executablePath.toLowerCase())) {
            // Обрабатываем конструкцию: useGameRuntimeStore.
            useGameRuntimeStore.getState().clearRunningByPath(game.id);
            // Закрываем текущий блок.
          }
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      })
      // Продолжаем цепочку вызовов.
      .catch(() => undefined);
    // Закрываем текущий блок.
  }, []);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
