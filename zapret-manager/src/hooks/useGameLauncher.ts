// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля react.
import { useCallback, useEffect, useRef, useState } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/i18n/core.
import { translateKey } from "@/i18n/core";
// Импортируем зависимости из модуля @/hooks/useStrategyRunner.
import { useStrategyRunner } from "@/hooks/useStrategyRunner";
// Импортируем зависимости из модуля @/lib/strategyLaunch.
import {
  // Подключаем именованный импорт analyzeGameLogs.
  analyzeGameLogs,
  // Подключаем именованный импорт analyzeGameTraffic.
  analyzeGameTraffic,
  // Подключаем именованный импорт checkGameConnectivity.
  checkGameConnectivity,
  // Подключаем именованный импорт checkGameEndpoints.
  checkGameEndpoints,
  // Подключаем именованный импорт detectGameEndpoints.
  detectGameEndpoints,
  // Подключаем именованный импорт tuneGame.
  tuneGame,
  // Подключаем именованный импорт type ConnectivityReport.
  type ConnectivityReport,
  // Подключаем именованный импорт type EndpointReport.
  type EndpointReport,
  // Подключаем именованный импорт type GameEndpoint.
  type GameEndpoint,
  // Подключаем именованный импорт type GameTuning.
  type GameTuning,
  // Подключаем именованный импорт type TrafficReport.
  type TrafficReport,
  // Закрываем текущий блок.
} from "@/lib/strategyLaunch";
// Импортируем зависимости из модуля @/lib/constants.
import {
  // Подключаем именованный импорт GAME_FAST_EXIT_MS.
  GAME_FAST_EXIT_MS,
  // Подключаем именованный импорт GAME_LAUNCH_CHECK_MS.
  GAME_LAUNCH_CHECK_MS,
  // Подключаем именованный импорт GAME_LAUNCH_HIDE_DELAY_MS.
  GAME_LAUNCH_HIDE_DELAY_MS,
  // Подключаем именованный импорт GAME_LAUNCH_POLL_MS.
  GAME_LAUNCH_POLL_MS,
  // Подключаем именованный импорт GAME_LAUNCH_TOAST_MS.
  GAME_LAUNCH_TOAST_MS,
  // Закрываем текущий блок.
} from "@/lib/constants";
// Импортируем зависимости из модуля @/lib/installedGames.
import { findGameProfile } from "@/lib/installedGames";
// Импортируем зависимости из модуля @/stores/useGameRuntimeStore.
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
// Импортируем зависимости из модуля @/stores/useLogsStore.
import { useLogsStore } from "@/stores/useLogsStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useVpnCoreStore.
import { useVpnCoreStore } from "@/stores/useVpnCoreStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame, LaunchMode, LogEntry, Strategy } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export type LaunchPromptKind = "chooseBypass" | "noStrategy" | "failedBefore";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Итог подготовки обхода: стратегия готова, её нет вовсе или
 * Итог подготовки обхода: стратегия готова, её нет вовсе или
 // Сохраняем пояснение разработчика: * запуск не удался. Разные исходы требуют разной реакции
 * запуск не удался. Разные исходы требуют разной реакции
 // Сохраняем пояснение разработчика: * интерфейса.
 * интерфейса.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export type EnsureStrategyResult = "ready" | "no-strategy" | "failed";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface LaunchPrompt {
  // Обрабатываем конструкцию: kind.
  kind: LaunchPromptKind;
  // Обрабатываем конструкцию: game.
  game: InstalledGame | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameDiagnosis {
  // Обрабатываем конструкцию: gameId.
  gameId: string;
  // Обрабатываем конструкцию: gameName.
  gameName: string;
  // Сохраняем пояснение разработчика: Игра, к которой относится проверка.
  /** Игра, к которой относится проверка. */
  // Обрабатываем конструкцию: game.
  game: InstalledGame;
  // Обрабатываем конструкцию: loading.
  loading: boolean;
  // Обрабатываем конструкцию: code.
  code: string | null;
  // Обрабатываем конструкцию: message.
  message: string | null;
  // Обрабатываем конструкцию: recommendation.
  recommendation: string | null;
  // Обрабатываем конструкцию: logPaths.
  logPaths: string[];
  // Обрабатываем конструкцию: applied.
  applied: string[];
  // Обрабатываем конструкцию: endpoints.
  endpoints: EndpointReport[];
  // Обрабатываем конструкцию: checkingEndpoints.
  checkingEndpoints: boolean;
  // Обрабатываем конструкцию: recheckEndpoints.
  recheckEndpoints: () => Promise<void>;
  // Обрабатываем конструкцию: connectivity.
  connectivity: ConnectivityReport | null;
  // Обрабатываем конструкцию: servers.
  servers: GameEndpoint[];
  // Обрабатываем конструкцию: traffic.
  traffic: TrafficReport | null;
  // Обрабатываем конструкцию: checkTraffic.
  checkTraffic: () => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface UseGameLauncherResult {
  // Обрабатываем конструкцию: launchingId.
  launchingId: string | null;
  // Обрабатываем конструкцию: prompt.
  prompt: LaunchPrompt | null;
  // Обрабатываем конструкцию: toast.
  toast: string | null;
  // Обрабатываем конструкцию: runningGames.
  runningGames: Record<string, number[]>;
  // Сохраняем пояснение разработчика: Игры, запущенные вне приложения: их нашли по пути к файлу.
  /** Игры, запущенные вне приложения: их нашли по пути к файлу. */
  // Обрабатываем конструкцию: runningByPath.
  runningByPath: Record<string, boolean>;
  // Обрабатываем конструкцию: diagnosis.
  diagnosis: GameDiagnosis | null;
  // Обрабатываем конструкцию: launch.
  launch: (game: InstalledGame) => Promise<void>;
  // Обрабатываем конструкцию: closeGame.
  closeGame: (game: InstalledGame) => Promise<void>;
  // Сохраняем пояснение разработчика: Пользователь выбрал способ запуска в диалоге первого запуска…
  /** Пользователь выбрал способ запуска в диалоге первого запуска. */
  // Обрабатываем конструкцию: choosePrompt.
  choosePrompt: (mode: LaunchMode) => Promise<void>;
  // Сохраняем пояснение разработчика: Диалог провала: подключить VPN вместо обхода.
  /** Диалог провала: подключить VPN вместо обхода. */
  // Обрабатываем конструкцию: launchWithVpn.
  launchWithVpn: () => void;
  // Сохраняем пояснение разработчика: Заново открыть диалог выбора способа запуска для игры.
  /** Заново открыть диалог выбора способа запуска для игры. */
  // Обрабатываем конструкцию: rechooseLaunchMode.
  rechooseLaunchMode: (game: InstalledGame) => void;
  // Обрабатываем конструкцию: dismissPrompt.
  dismissPrompt: () => void;
  // Обрабатываем конструкцию: diagnose.
  diagnose: (game: InstalledGame) => Promise<void>;
  // Обрабатываем конструкцию: dismissDiagnosis.
  dismissDiagnosis: () => void;
  // Сохраняем пояснение разработчика: Обход не справился: показать предложение включить VPN.
  /** Обход не справился: показать предложение включить VPN. */
  // Обрабатываем конструкцию: bypassFailed.
  bypassFailed: boolean;
  // Обрабатываем конструкцию: dismissBypassFailure.
  dismissBypassFailure: () => void;
  // Сохраняем пояснение разработчика: Повторить запуск после неудачи.
  /** Повторить запуск после неудачи. */
  // Обрабатываем конструкцию: retryLaunch.
  retryLaunch: () => Promise<void>;
  // Сохраняем пояснение разработчика: Переключить дашборд в режим VPN и подключиться.
  /** Переключить дашборд в режим VPN и подключиться. */
  // Обрабатываем конструкцию: enableVpn.
  enableVpn: () => void;
  // Сохраняем пояснение разработчика: Перезапустить обход с профилем игры.
  /** Перезапустить обход с профилем игры. */
  // Обрабатываем конструкцию: restartBypass.
  restartBypass: (game: InstalledGame) => Promise<void>;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем псевдоним типа AddLog.
type AddLog = (entry: Pick<LogEntry, "level" | "source" | "message">) => void;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useGameLauncher(): UseGameLauncherResult {
  // Обрабатываем конструкцию: const [launchingId, setLaunchingId] = useState<string |….
  const [launchingId, setLaunchingId] = useState<string | null>(null);
  // Обрабатываем конструкцию: const runningGames = useGameRuntimeStore((state) => sta….
  const runningGames = useGameRuntimeStore((state) => state.running);
  // Обрабатываем конструкцию: const runningByPath = useGameRuntimeStore((state) => st….
  const runningByPath = useGameRuntimeStore((state) => state.runningByPath);
  // Обрабатываем конструкцию: const [prompt, setPrompt] = useState<LaunchPrompt | nul….
  const [prompt, setPrompt] = useState<LaunchPrompt | null>(null);
  // Обрабатываем конструкцию: const [toast, setToast] = useState<string | null>(null).
  const [toast, setToast] = useState<string | null>(null);
  // Обрабатываем конструкцию: const [diagnosis, setDiagnosis] = useState<GameDiagnosi….
  const [diagnosis, setDiagnosis] = useState<GameDiagnosis | null>(null);
  // Обрабатываем конструкцию: const [bypassFailed, setBypassFailed] = useState(false).
  const [bypassFailed, setBypassFailed] = useState(false);
  // Обрабатываем конструкцию: const [failedGame, setFailedGame] = useState<InstalledG….
  const [failedGame, setFailedGame] = useState<InstalledGame | null>(null);
  // Обрабатываем конструкцию: const setActivePage = useAppStore((state) => state.setA….
  const setActivePage = useAppStore((state) => state.setActivePage);
  // Обрабатываем конструкцию: const setDashboardMode = useAppStore((state) => state.s….
  const setDashboardMode = useAppStore((state) => state.setDashboardMode);
  // Обрабатываем конструкцию: const requestAutoConnect = useVpnCoreStore( (state) => ….
  const requestAutoConnect = useVpnCoreStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.requestAutoConnect
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const tuningsRef = useRef<Map<string, GameTuning>>(new ….
  const tuningsRef = useRef<Map<string, GameTuning>>(new Map());
  // Обрабатываем конструкцию: const { run, stop, checkStatus } = useStrategyRunner().
  const { run, stop, checkStatus } = useStrategyRunner();
  // Обрабатываем конструкцию: const addLog = useLogsStore((state) => state.addLog).
  const addLog = useLogsStore((state) => state.addLog);
  // Обрабатываем конструкцию: const strategies = useStrategiesStore((state) => state.….
  const strategies = useStrategiesStore((state) => state.strategies);
  // Обрабатываем конструкцию: const lastStrategyId = useSettingsStore( (state) => sta….
  const lastStrategyId = useSettingsStore(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (state) => state.settings.lastStrategyId
    // Закрываем выражение или список аргументов.
  );
  // Обрабатываем конструкцию: const gamesSettings = useSettingsStore((state) => state….
  const gamesSettings = useSettingsStore((state) => state.settings.games);
  // Обрабатываем конструкцию: const updateGameSettings = useSettingsStore((state) => ….
  const updateGameSettings = useSettingsStore((state) => state.updateGame);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const finishLaunch = useCallback( async (game: Installe….
  const finishLaunch = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame, mode: LaunchMode) => {
      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const pids = await secureInvoke<number[]>(launch_game, ….
        const pids = await secureInvoke<number[]>("launch_game", {
          // Обрабатываем конструкцию: executablePath.
          executablePath: game.executablePath,
          // Обрабатываем конструкцию: launchArgs.
          launchArgs: game.launchArgs ?? null,
          // Обрабатываем конструкцию: workingDir.
          workingDir: game.installPath,
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.gameLaunched", {
            // Обрабатываем конструкцию: name.
            name: game.name,
            // Обрабатываем конструкцию: pid.
            pid: pids[0] ?? 0,
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Обрабатываем конструкцию: setToast.
        setToast(
          // Обрабатываем конструкцию: translateKey.
          translateKey(
            // Обрабатываем конструкцию: mode.
            mode === "plain"
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                "settings.games.installed.launch.activePlain"
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                "settings.games.installed.launch.active"
            // Закрываем выражение или список аргументов.
          )
          // Закрываем выражение или список аргументов.
        );
        // Обрабатываем конструкцию: useGameRuntimeStore.
        useGameRuntimeStore.getState().markRunning(game.id, pids);
        // Обрабатываем конструкцию: recordLaunch.
        recordLaunch(game.id);
        // — разделитель логических блоков —

        // Сохраняем пояснение разработчика: // Контроль «обход не отвалился» имеет смысл только когда об…
        // Контроль «обход не отвалился» имеет смысл только когда обходом
        // Сохраняем пояснение разработчика: // и запускали: обычный старт живёт без стратегии.
        // и запускали: обычный старт живёт без стратегии.
        // Проверяем бизнес-условие: mode === bypass.
        if (mode === "bypass") {
          // Обрабатываем конструкцию: verifyBypass.
          verifyBypass(game, addLog);
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: window.
        window.setTimeout(() => {
          // Обрабатываем конструкцию: void secureInvoke(hide_main_window).catch(() => undefin….
          void secureInvoke("hide_main_window").catch(() => undefined);
          // Закрываем текущий блок.
        }, GAME_LAUNCH_HIDE_DELAY_MS);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: window.
        window.setTimeout(() => {
          // Обрабатываем конструкцию: setToast.
          setToast(null);
          // Закрываем текущий блок.
        }, GAME_LAUNCH_TOAST_MS);
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.gameLaunchFailed", {
            // Обрабатываем конструкцию: name.
            name: game.name,
            // Обрабатываем конструкцию: error.
            error: caught instanceof Error ? caught.message : String(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Обрабатываем конструкцию: setToast.
        setToast(translateKey("settings.games.installed.launch.failed"));
        // Закрываем текущий блок.
      } finally {
        // Обрабатываем конструкцию: setLaunchingId.
        setLaunchingId(null);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const ensureStrategy = useCallback( async ( requiredGam….
  const ensureStrategy = useCallback(
    // Обрабатываем конструкцию: async.
    async (
      // Обрабатываем конструкцию: requiredGameId.
      requiredGameId: string | null,
      // Обрабатываем конструкцию: tuning.
      tuning: GameTuning | null
      // Закрываем выражение или список аргументов.
    ): Promise<EnsureStrategyResult> => {
      // Обрабатываем конструкцию: const running = strategies.find((item) => item.status =….
      const running = strategies.find((item) => item.status === "running");
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: running !== undefined.
      if (running !== undefined) {
        // Сохраняем пояснение разработчика: // Обход уже работает. Если он был запущен без доменов и пор…
        // Обход уже работает. Если он был запущен без доменов и портов этой
        // Сохраняем пояснение разработчика: // игры, её трафик не проходит через обход — перезапускаем с…
        // игры, её трафик не проходит через обход — перезапускаем с ними.
        // Проверяем бизнес-условие: requiredGameId === null || useStrategiesStore.getState(….
        if (
          // Обрабатываем конструкцию: requiredGameId.
          requiredGameId === null ||
          // Обрабатываем конструкцию: useStrategiesStore.
          useStrategiesStore.getState().injectedGameIds.includes(requiredGameId)
          // Закрываем выражение или список аргументов.
        ) {
          // Возвращаем результат: ready.
          return "ready";
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("log.gameProfileApplying"),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Пробуем выполнить блок с обработкой ошибок.
        try {
          // Ожидаем завершение асинхронной операции await stop(running.id, running.path).
          await stop(running.id, running.path);
          // Закрываем текущий блок.
        } catch {
          // Сохраняем пояснение разработчика: // даже если остановка не удалась, запускаем профиль заново:
          // даже если остановка не удалась, запускаем профиль заново:
          // Сохраняем пояснение разработчика: // это пересоздаст процесс обхода с нужными доменами и порта…
          // это пересоздаст процесс обхода с нужными доменами и портами
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const target = pickStrategy(strategies, lastStrategyId).
      const target = pickStrategy(strategies, lastStrategyId);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: target === undefined.
      if (target === undefined) {
        // Обрабатываем конструкцию: setPrompt.
        setPrompt({ kind: "noStrategy", game: null });
        // — разделитель логических блоков —

        // Возвращаем результат: no-strategy.
        return "no-strategy";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "info",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: translateKey(
          // Обрабатываем конструкцию: settings.games.installed.launch.strategyStarting.
          "settings.games.installed.launch.strategyStarting"
          // Закрываем выражение или список аргументов.
        ),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Ожидаем завершение асинхронной операции await run(target.id, target.path, tuning).
        await run(target.id, target.path, tuning);
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey(
            // Обрабатываем конструкцию: settings.games.installed.launch.strategyFailed.
            "settings.games.installed.launch.strategyFailed",
            // Открываем объектный литерал.
            {
              // Обрабатываем конструкцию: error.
              error: caught instanceof Error ? caught.message : String(caught),
              // Закрываем текущий блок.
            }
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Возвращаем результат: failed.
        return "failed";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const storeRunning = useStrategiesStore .getState() .st….
      const storeRunning = useStrategiesStore
        // Продолжаем цепочку вызовов.
        .getState()
        // Продолжаем цепочку вызовов.
        .strategies.some(
          // Объявляем функцию-обработчик или стрелочную функцию.
          (item) => item.id === target.id && item.status === "running"
          // Закрываем выражение или список аргументов.
        );
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: storeRunning.
      if (storeRunning) {
        // Возвращаем результат: ready.
        return "ready";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const status = await checkStatus(target.id).catch(() =>….
      const status = await checkStatus(target.id).catch(() => null);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: status?.running === true.
      if (status?.running === true) {
        // Обрабатываем конструкцию: useStrategiesStore.
        useStrategiesStore.getState().setStatus(target.id, "running");
        // Обрабатываем конструкцию: useStrategiesStore.
        useStrategiesStore
          // Продолжаем цепочку вызовов.
          .getState()
          // Продолжаем цепочку вызовов.
          .setPid(target.id, status.winwsPids[0] ?? 0);
        // — разделитель логических блоков —

        // Возвращаем результат: ready.
        return "ready";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await run(target.id, target.path, tuning).cat….
      await run(target.id, target.path, tuning).catch(() => undefined);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const retry = await checkStatus(target.id).catch(() => ….
      const retry = await checkStatus(target.id).catch(() => null);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: retry?.running === true.
      if (retry?.running === true) {
        // Обрабатываем конструкцию: useStrategiesStore.
        useStrategiesStore.getState().setStatus(target.id, "running");
        // Обрабатываем конструкцию: useStrategiesStore.
        useStrategiesStore
          // Продолжаем цепочку вызовов.
          .getState()
          // Продолжаем цепочку вызовов.
          .setPid(target.id, retry.winwsPids[0] ?? 0);
        // — разделитель логических блоков —

        // Возвращаем результат: ready.
        return "ready";
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: addLog.
      addLog({
        // Обрабатываем конструкцию: level.
        level: "error",
        // Обрабатываем конструкцию: source.
        source: "user",
        // Обрабатываем конструкцию: message.
        message: translateKey(
          // Обрабатываем конструкцию: settings.games.installed.launch.strategyFailed.
          "settings.games.installed.launch.strategyFailed",
          // Открываем объектный литерал.
          {
            // Обрабатываем конструкцию: error.
            error: translateKey(
              // Обрабатываем конструкцию: settings.games.installed.launch.strategyNotRunning.
              "settings.games.installed.launch.strategyNotRunning"
              // Закрываем выражение или список аргументов.
            ),
            // Закрываем текущий блок.
          }
          // Закрываем выражение или список аргументов.
        ),
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Возвращаем результат: failed.
      return "failed";
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, checkStatus, lastStrategyId, run, stop, strategies]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const start = useCallback( async (game: InstalledGame):….
  const start = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame): Promise<void> => {
      // Сохраняем пояснение разработчика: // Профиль ищем по gameSettingsId и по названию: у ручных иг…
      // Профиль ищем по gameSettingsId и по названию: у ручных игр
      // Сохраняем пояснение разработчика: // идентификатора нет, а домены встроенного пресета им всё р…
      // идентификатора нет, а домены встроенного пресета им всё равно нужны.
      // Обрабатываем конструкцию: const bypass = findGameProfile(game, gamesSettings).
      const bypass = findGameProfile(game, gamesSettings);
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Подгонка портов и фильтров под игру делается до старта ст…
      // Подгонка портов и фильтров под игру делается до старта стратегии:
      // Сохраняем пояснение разработчика: // EAC-игры теряют UDP-группу и --ipset, GameLift получает п…
      // EAC-игры теряют UDP-группу и --ipset, GameLift получает порты.
      // Обрабатываем конструкцию: let tuning: GameTuning | null = null.
      let tuning: GameTuning | null = null;
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: tuning.
        tuning = await tuneGame(game, bypass);
        // Обрабатываем конструкцию: tuningsRef.
        tuningsRef.current.set(game.id, tuning);
        // — разделитель логических блоков —

        // Перебираем элементы коллекции tuning.notes.
        for (const note of tuning.notes) {
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "info",
            // Обрабатываем конструкцию: source.
            source: "strategy",
            // Обрабатываем конструкцию: message.
            message: `${game.name}: ${note}`,
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "warn",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey(
            // Обрабатываем конструкцию: settings.games.installed.launch.tuningFailed.
            "settings.games.installed.launch.tuningFailed",
            // Открываем объектный литерал.
            { error: caught instanceof Error ? caught.message : String(caught) }
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: bypass !== undefined && !bypass.enabled.
      if (bypass !== undefined && !bypass.enabled) {
        // Обрабатываем конструкцию: updateGameSettings.
        updateGameSettings(bypass.id, { enabled: true });
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey(
            // Обрабатываем конструкцию: settings.games.installed.launch.bypassAutoOn.
            "settings.games.installed.launch.bypassAutoOn",
            // Открываем объектный литерал.
            {
              // Обрабатываем конструкцию: name.
              name: game.name,
              // Закрываем текущий блок.
            }
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Профиль включается до запуска обхода: иначе его домены и …
      // Профиль включается до запуска обхода: иначе его домены и порты
      // Сохраняем пояснение разработчика: // не попадут в конфиг winws, и игра не сможет зайти в матч.
      // не попадут в конфиг winws, и игра не сможет зайти в матч.
      // Обрабатываем конструкцию: const prepared = await ensureStrategy(bypass?.id ?? nul….
      const prepared = await ensureStrategy(bypass?.id ?? null, tuning);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: prepared === failed.
      if (prepared === "failed") {
        // Обрабатываем конструкцию: setBypassFailed.
        setBypassFailed(true);
        // Обрабатываем конструкцию: setFailedGame.
        setFailedGame(game);
        // Обрабатываем конструкцию: setLaunchingId.
        setLaunchingId(null);
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: prepared !== ready.
      if (prepared !== "ready") {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await finishLaunch(game, bypass).
      await finishLaunch(game, "bypass");
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, ensureStrategy, finishLaunch, gamesSettings, updateGameSettings]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: Запуск в выбранном пользователем режиме: с обходом или без н…
  /** Запуск в выбранном пользователем режиме: с обходом или без него. */
  // Обрабатываем конструкцию: const runWithMode = useCallback( async (game: Installed….
  const runWithMode = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame, mode: LaunchMode): Promise<void> => {
      // Проверяем бизнес-условие: mode === plain.
      if (mode === "plain") {
        // Сохраняем пояснение разработчика: // Без обхода — просто старт exe: стратегии не трогаем и не
        // Без обхода — просто старт exe: стратегии не трогаем и не
        // Сохраняем пояснение разработчика: // включаем профиль игры, он мог быть выключен намеренно.
        // включаем профиль игры, он мог быть выключен намеренно.
        // Ожидаем завершение асинхронной операции await finishLaunch(game, plain).
        await finishLaunch(game, "plain");
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await start(game).
      await start(game);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [finishLaunch, start]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const launch = useCallback( async (game: InstalledGame)….
  const launch = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame) => {
      // Проверяем бизнес-условие: launchingId !== null.
      if (launchingId !== null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setLaunchingId.
      setLaunchingId(game.id);
      // Обрабатываем конструкцию: setToast.
      setToast(
        // Обрабатываем конструкцию: translateKey.
        translateKey("settings.games.installed.launch.starting", {
          // Обрабатываем конструкцию: name.
          name: game.name,
          // Закрываем текущий блок.
        })
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Прошлый запуск с обходом закрылся слишком быстро: сперва
      // Прошлый запуск с обходом закрылся слишком быстро: сперва
      // Сохраняем пояснение разработчика: // предлагаем VPN — молча повторять неудачу бессмысленно.
      // предлагаем VPN — молча повторять неудачу бессмысленно.
      // Проверяем бизнес-условие: game.failedLaunchAt !== undefined.
      if (game.failedLaunchAt !== undefined) {
        // Обрабатываем конструкцию: setPrompt.
        setPrompt({ kind: "failedBefore", game });
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Сохраняем пояснение разработчика: // Первый запуск: способ выбирает пользователь, выбор сохран…
      // Первый запуск: способ выбирает пользователь, выбор сохраняется
      // Сохраняем пояснение разработчика: // на карточке игры.
      // на карточке игры.
      // Проверяем бизнес-условие: game.bypassChoice === undefined.
      if (game.bypassChoice === undefined) {
        // Обрабатываем конструкцию: setPrompt.
        setPrompt({ kind: "chooseBypass", game });
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await runWithMode(game, game.bypassChoice).
      await runWithMode(game, game.bypassChoice);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [launchingId, runWithMode]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const choosePrompt = useCallback( async (mode: LaunchMo….
  const choosePrompt = useCallback(
    // Обрабатываем конструкцию: async.
    async (mode: LaunchMode): Promise<void> => {
      // Проверяем бизнес-условие: prompt === null.
      if (prompt === null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const { game } = prompt.
      const { game } = prompt;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setPrompt.
      setPrompt(null);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: game === null.
      if (game === null) {
        // Обрабатываем конструкцию: setLaunchingId.
        setLaunchingId(null);
        // — разделитель логических блоков —

        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().updateGame(game.id, {
        // Обрабатываем конструкцию: bypassChoice.
        bypassChoice: mode,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await runWithMode(game, mode).
      await runWithMode(game, mode);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [prompt, runWithMode]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const dismissPrompt = useCallback(() => { setPrompt(nul….
  const dismissPrompt = useCallback(() => {
    // Обрабатываем конструкцию: setPrompt.
    setPrompt(null);
    // Обрабатываем конструкцию: setLaunchingId.
    setLaunchingId(null);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: Смена способа запуска по кнопке на карточке: заново показыва…
  /** Смена способа запуска по кнопке на карточке: заново показываем выбор. */
  // Обрабатываем конструкцию: const rechooseLaunchMode = useCallback( (game: Installe….
  const rechooseLaunchMode = useCallback(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (game: InstalledGame): void => {
      // Проверяем бизнес-условие: launchingId !== null.
      if (launchingId !== null) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setLaunchingId.
      setLaunchingId(game.id);
      // Обрабатываем конструкцию: setPrompt.
      setPrompt({ kind: "chooseBypass", game });
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [launchingId]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Настоящий TLS-хендшейк к сервисам игры: показывает, подхо…
  // Настоящий TLS-хендшейк к сервисам игры: показывает, подходит ли текущая
  // Сохраняем пояснение разработчика: // стратегия, вместо догадок по логам античита.
  // стратегия, вместо догадок по логам античита.
  // Обрабатываем конструкцию: const probeEndpoints = useCallback( async (game: Instal….
  const probeEndpoints = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame): Promise<void> => {
      // Обрабатываем конструкцию: const profile = findGameProfile(game, gamesSettings).
      const profile = findGameProfile(game, gamesSettings);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: profile === undefined.
      if (profile === undefined) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, checkingEndpoints: true }
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const reports = await checkGameEndpoints(profile.domain….
        const reports = await checkGameEndpoints(profile.domains);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: setDiagnosis.
        setDiagnosis(
          // Продолжаем предыдущую конструкцию.
          (current) =>
            // Обрабатываем конструкцию: current.
            current === null
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                current
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                { ...current, endpoints: reports, checkingEndpoints: false }
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: const blocked = reports.filter((report) => !report.ok).
        const blocked = reports.filter((report) => !report.ok);
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: blocked.length > 0.
        if (blocked.length > 0) {
          // Обрабатываем конструкцию: addLog.
          addLog({
            // Обрабатываем конструкцию: level.
            level: "warn",
            // Обрабатываем конструкцию: source.
            source: "user",
            // Обрабатываем конструкцию: message.
            message: `${game.name}: ${blocked.length} из ${reports.length} сервисов недоступны (${blocked
              // Продолжаем предыдущую конструкцию.
              .map((report) => report.host)
              // Продолжаем предыдущую конструкцию.
              .join(", ")})`,
            // Закрываем текущий блок.
          });
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: setDiagnosis.
        setDiagnosis(
          // Продолжаем предыдущую конструкцию.
          (current) =>
            // Обрабатываем конструкцию: current.
            current === null
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                current
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                {
                  // Разворачиваем ...current в коллекцию.
                  ...current,
                  // Обрабатываем конструкцию: checkingEndpoints.
                  checkingEndpoints: false,
                  // Обрабатываем конструкцию: endpoints.
                  endpoints: [
                    // Открываем объектный литерал.
                    {
                      // Обрабатываем конструкцию: host.
                      host: "—",
                      // Обрабатываем конструкцию: ok.
                      ok: false,
                      // Обрабатываем конструкцию: statusCode.
                      statusCode: null,
                      // Обрабатываем конструкцию: latencyMs.
                      latencyMs: null,
                      // Обрабатываем конструкцию: stage.
                      stage: "check",
                      // Обрабатываем конструкцию: error.
                      error:
                        // Обрабатываем конструкцию: caught.
                        caught instanceof Error
                          ? // Продолжаем предыдущую конструкцию.
                            caught.message
                          : // Продолжаем предыдущую конструкцию.
                            String(caught),
                      // Обрабатываем конструкцию: hint.
                      hint: translateKey(
                        // Обрабатываем конструкцию: settings.games.installed.diagnose.checkFailed.
                        "settings.games.installed.diagnose.checkFailed"
                        // Закрываем выражение или список аргументов.
                      ),
                      // Закрываем текущий блок.
                    },
                    // Закрываем массив или список.
                  ],
                  // Закрываем текущий блок.
                }
          // Закрываем выражение или список аргументов.
        );
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, gamesSettings]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Достижимость самих игровых серверов: резолвится ли домен …
  // Достижимость самих игровых серверов: резолвится ли домен и доходит ли
  // Сохраняем пояснение разработчика: // TCP до портов Steam/GameLift. Показывает, работает ли обх…
  // TCP до портов Steam/GameLift. Показывает, работает ли обход вообще,
  // Сохраняем пояснение разработчика: // а не только «не сломалась ли игра».
  // а не только «не сломалась ли игра».
  // Обрабатываем конструкцию: const probeConnectivity = useCallback(async (): Promise….
  const probeConnectivity = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const report = await checkGameConnectivity().
      const report = await checkGameConnectivity();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, connectivity: report }
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    } catch {
      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, connectivity: null }
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Сервер, назначенный на матч, и разбор пакетов к нему по d…
  // Сервер, назначенный на матч, и разбор пакетов к нему по debug-логу winws:
  // Сохраняем пояснение разработчика: // единственный способ отличить «обход рвёт соединение» от «…
  // единственный способ отличить «обход рвёт соединение» от «пакеты не доходят».
  // Обрабатываем конструкцию: const probeTraffic = useCallback(async (): Promise<void….
  const probeTraffic = useCallback(async (): Promise<void> => {
    // Пробуем выполнить блок с обработкой ошибок.
    try {
      // Обрабатываем конструкцию: const servers = await detectGameEndpoints().
      const servers = await detectGameEndpoints();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, servers }
        // Закрываем выражение или список аргументов.
      );
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const target = servers[0].
      const target = servers[0];
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: target === undefined.
      if (target === undefined) {
        // Завершаем функцию без возвращаемого значения.
        return;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const report = await analyzeGameTraffic(target.ip, targ….
      const report = await analyzeGameTraffic(target.ip, target.port);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, traffic: report }
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    } catch {
      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis(
        // Продолжаем предыдущую конструкцию.
        (current) =>
          // Обрабатываем конструкцию: current.
          current === null ? current : { ...current, traffic: null }
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const diagnose = useCallback( async (game: InstalledGam….
  const diagnose = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame): Promise<void> => {
      // Обрабатываем конструкцию: const cached = tuningsRef.current.get(game.id) ?? null.
      const cached = tuningsRef.current.get(game.id) ?? null;
      // Обрабатываем конструкцию: const profile = findGameProfile(game, gamesSettings).
      const profile = findGameProfile(game, gamesSettings);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: setDiagnosis.
      setDiagnosis({
        // Обрабатываем конструкцию: gameId.
        gameId: game.id,
        // Обрабатываем конструкцию: gameName.
        gameName: game.name,
        // Передаём поле game в объект.
        game,
        // Обрабатываем конструкцию: loading.
        loading: true,
        // Обрабатываем конструкцию: code.
        code: null,
        // Обрабатываем конструкцию: message.
        message: null,
        // Обрабатываем конструкцию: recommendation.
        recommendation: null,
        // Обрабатываем конструкцию: logPaths.
        logPaths: [],
        // Обрабатываем конструкцию: applied.
        applied: cached?.notes ?? [],
        // Обрабатываем конструкцию: endpoints.
        endpoints: [],
        // Обрабатываем конструкцию: checkingEndpoints.
        checkingEndpoints: false,
        // Обрабатываем конструкцию: recheckEndpoints.
        recheckEndpoints: async () => undefined,
        // Обрабатываем конструкцию: connectivity.
        connectivity: null,
        // Обрабатываем конструкцию: servers.
        servers: [],
        // Обрабатываем конструкцию: traffic.
        traffic: null,
        // Обрабатываем конструкцию: checkTraffic.
        checkTraffic: async () => undefined,
        // Закрываем текущий блок.
      });
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: const result = await analyzeGameLogs(game, cached).
        const result = await analyzeGameLogs(game, cached);
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: setDiagnosis.
        setDiagnosis({
          // Обрабатываем конструкцию: gameId.
          gameId: game.id,
          // Обрабатываем конструкцию: gameName.
          gameName: game.name,
          // Передаём поле game в объект.
          game,
          // Обрабатываем конструкцию: loading.
          loading: false,
          // Обрабатываем конструкцию: code.
          code: result.code,
          // Обрабатываем конструкцию: message.
          message: result.message,
          // Обрабатываем конструкцию: recommendation.
          recommendation: result.recommendation,
          // Обрабатываем конструкцию: logPaths.
          logPaths: result.logPaths,
          // Обрабатываем конструкцию: applied.
          applied: result.applied,
          // Обрабатываем конструкцию: endpoints.
          endpoints: [],
          // Обрабатываем конструкцию: checkingEndpoints.
          checkingEndpoints: false,
          // Обрабатываем конструкцию: recheckEndpoints.
          recheckEndpoints: async () => undefined,
          // Обрабатываем конструкцию: connectivity.
          connectivity: null,
          // Обрабатываем конструкцию: servers.
          servers: [],
          // Обрабатываем конструкцию: traffic.
          traffic: null,
          // Обрабатываем конструкцию: checkTraffic.
          checkTraffic: async () => undefined,
          // Закрываем текущий блок.
        });
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: result.code === "NO_FAILURE_MARKERS" ? "info" : "warn",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: `${game.name}: ${result.message}`,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: setDiagnosis.
        setDiagnosis({
          // Обрабатываем конструкцию: gameId.
          gameId: game.id,
          // Обрабатываем конструкцию: gameName.
          gameName: game.name,
          // Передаём поле game в объект.
          game,
          // Обрабатываем конструкцию: loading.
          loading: false,
          // Обрабатываем конструкцию: code.
          code: "UNKNOWN",
          // Обрабатываем конструкцию: message.
          message: translateKey("settings.games.installed.diagnose.failed", {
            // Обрабатываем конструкцию: error.
            error: caught instanceof Error ? caught.message : String(caught),
            // Закрываем текущий блок.
          }),
          // Обрабатываем конструкцию: recommendation.
          recommendation: null,
          // Обрабатываем конструкцию: logPaths.
          logPaths: [],
          // Обрабатываем конструкцию: applied.
          applied: cached?.notes ?? [],
          // Обрабатываем конструкцию: endpoints.
          endpoints: [],
          // Обрабатываем конструкцию: checkingEndpoints.
          checkingEndpoints: false,
          // Обрабатываем конструкцию: recheckEndpoints.
          recheckEndpoints: async () => undefined,
          // Обрабатываем конструкцию: connectivity.
          connectivity: null,
          // Обрабатываем конструкцию: servers.
          servers: [],
          // Обрабатываем конструкцию: traffic.
          traffic: null,
          // Обрабатываем конструкцию: checkTraffic.
          checkTraffic: async () => undefined,
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: profile !== undefined.
      if (profile !== undefined) {
        // Обрабатываем конструкцию: setDiagnosis.
        setDiagnosis(
          // Продолжаем предыдущую конструкцию.
          (current) =>
            // Обрабатываем конструкцию: current.
            current === null
              ? // Обрабатываем конструкцию: ?.
                // Продолжаем предыдущую конструкцию.
                current
              : // Обрабатываем конструкцию: :.
                // Продолжаем предыдущую конструкцию.
                {
                  // Разворачиваем ...current в коллекцию.
                  ...current,
                  // Обрабатываем конструкцию: checkingEndpoints.
                  checkingEndpoints: true,
                  // Обрабатываем конструкцию: recheckEndpoints.
                  recheckEndpoints: async () => {
                    // Ожидаем завершение асинхронной операции await probeEndpoints(game).
                    await probeEndpoints(game);
                    // Закрываем текущий блок.
                  },
                  // Обрабатываем конструкцию: servers.
                  servers: [],
                  // Обрабатываем конструкцию: traffic.
                  traffic: null,
                  // Обрабатываем конструкцию: checkTraffic.
                  checkTraffic: async () => {
                    // Ожидаем завершение асинхронной операции await probeTraffic().
                    await probeTraffic();
                    // Закрываем текущий блок.
                  },
                  // Закрываем текущий блок.
                }
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Ожидаем завершение асинхронной операции await probeEndpoints(game).
        await probeEndpoints(game);
        // Ожидаем завершение асинхронной операции await probeTraffic().
        await probeTraffic();
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await probeConnectivity().
      await probeConnectivity();
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, gamesSettings, probeConnectivity, probeEndpoints, probeTraffic]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const dismissDiagnosis = useCallback(() => { setDiagnos….
  const dismissDiagnosis = useCallback(() => {
    // Обрабатываем конструкцию: setDiagnosis.
    setDiagnosis(null);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const closeGame = useCallback( async (game: InstalledGa….
  const closeGame = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame) => {
      // Обрабатываем конструкцию: const pids = useGameRuntimeStore.getState().pidsOf(game….
      const pids = useGameRuntimeStore.getState().pidsOf(game.id);
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Проверяем бизнес-условие: pids.length > 0.
        if (pids.length > 0) {
          // Ожидаем завершение асинхронной операции await secureInvoke<boolean>(close_game, { pid….
          await secureInvoke<boolean>("close_game", { pids });
          // Закрываем текущий блок.
        }
        // — разделитель логических блоков —

        // Сохраняем пояснение разработчика: // Игра могла быть запущена не приложением или перезапустить…
        // Игра могла быть запущена не приложением или перезапуститься
        // Сохраняем пояснение разработчика: // сама: тогда её находит только путь к файлу.
        // сама: тогда её находит только путь к файлу.
        // Ожидаем завершение асинхронной операции await secureInvoke<boolean>(close_game_by_pat….
        await secureInvoke<boolean>("close_game_by_path", {
          // Обрабатываем конструкцию: executablePath.
          executablePath: game.executablePath,
          // Закрываем текущий блок.
        });
        // — разделитель логических блоков —

        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "info",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("settings.games.installed.closedGame", {
            // Обрабатываем конструкцию: name.
            name: game.name,
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "error",
          // Обрабатываем конструкцию: source.
          source: "user",
          // Обрабатываем конструкцию: message.
          message: translateKey("settings.games.installed.closeGameFailed", {
            // Обрабатываем конструкцию: error.
            error: caught instanceof Error ? caught.message : String(caught),
            // Закрываем текущий блок.
          }),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: useGameRuntimeStore.
      useGameRuntimeStore.getState().markStopped(game.id);
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const dismissBypassFailure = useCallback(() => { setByp….
  const dismissBypassFailure = useCallback(() => {
    // Обрабатываем конструкцию: setBypassFailed.
    setBypassFailed(false);
    // Обрабатываем конструкцию: setFailedGame.
    setFailedGame(null);
    // Закрываем текущий блок.
  }, []);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const retryLaunch = useCallback(async (): Promise<void>….
  const retryLaunch = useCallback(async (): Promise<void> => {
    // Обрабатываем конструкцию: const game = failedGame.
    const game = failedGame;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setBypassFailed.
    setBypassFailed(false);
    // Обрабатываем конструкцию: setFailedGame.
    setFailedGame(null);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: game === null.
    if (game === null) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await start(game).
    await start(game);
    // Закрываем текущий блок.
  }, [failedGame, start]);
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const enableVpn = useCallback(() => { setBypassFailed(f….
  const enableVpn = useCallback(() => {
    // Обрабатываем конструкцию: setBypassFailed.
    setBypassFailed(false);
    // Обрабатываем конструкцию: setFailedGame.
    setFailedGame(null);
    // Обрабатываем конструкцию: setActivePage.
    setActivePage("dashboard");
    // Обрабатываем конструкцию: setDashboardMode.
    setDashboardMode("vpn");
    // Обрабатываем конструкцию: requestAutoConnect.
    requestAutoConnect();
    // Закрываем текущий блок.
  }, [requestAutoConnect, setActivePage, setDashboardMode]);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: Из диалога провала: подключаем VPN вместо повторной попытки …
  /** Из диалога провала: подключаем VPN вместо повторной попытки обхода. */
  // Обрабатываем конструкцию: const launchWithVpn = useCallback((): void => { const g….
  const launchWithVpn = useCallback((): void => {
    // Обрабатываем конструкцию: const game = prompt?.game ?? null.
    const game = prompt?.game ?? null;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: setPrompt.
    setPrompt(null);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: game !== null.
    if (game !== null) {
      // Сохраняем пояснение разработчика: // Выбор сделан: маркер провала не нужен. Если и VPN не спра…
      // Выбор сделан: маркер провала не нужен. Если и VPN не справится,
      // Сохраняем пояснение разработчика: // быстрая остановка игры проставит его заново.
      // быстрая остановка игры проставит его заново.
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().updateGame(game.id, {
        // Обрабатываем конструкцию: failedLaunchAt.
        failedLaunchAt: undefined,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: enableVpn.
    enableVpn();
    // Закрываем текущий блок.
  }, [enableVpn, prompt]);
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // Перезапуск обхода с профилем игры: стратегия останавливае…
  // Перезапуск обхода с профилем игры: стратегия останавливается и
  // Сохраняем пояснение разработчика: // поднимается заново уже с доменами и портами игры.
  // поднимается заново уже с доменами и портами игры.
  // Обрабатываем конструкцию: const restartBypass = useCallback( async (game: Install….
  const restartBypass = useCallback(
    // Обрабатываем конструкцию: async.
    async (game: InstalledGame): Promise<void> => {
      // Обрабатываем конструкцию: const bypass = findGameProfile(game, gamesSettings).
      const bypass = findGameProfile(game, gamesSettings);
      // Обрабатываем конструкцию: let tuning: GameTuning | null = null.
      let tuning: GameTuning | null = null;
      // — разделитель логических блоков —

      // Пробуем выполнить блок с обработкой ошибок.
      try {
        // Обрабатываем конструкцию: tuning.
        tuning = await tuneGame(game, bypass);
        // Обрабатываем конструкцию: tuningsRef.
        tuningsRef.current.set(game.id, tuning);
        // Закрываем текущий блок.
      } catch (caught) {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "warn",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey(
            // Обрабатываем конструкцию: settings.games.installed.launch.tuningFailed.
            "settings.games.installed.launch.tuningFailed",
            // Открываем объектный литерал.
            { error: caught instanceof Error ? caught.message : String(caught) }
            // Закрываем выражение или список аргументов.
          ),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: const prepared = await ensureStrategy(bypass?.id ?? nul….
      const prepared = await ensureStrategy(bypass?.id ?? null, tuning);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: prepared === ready.
      if (prepared === "ready") {
        // Обрабатываем конструкцию: addLog.
        addLog({
          // Обрабатываем конструкцию: level.
          level: "success",
          // Обрабатываем конструкцию: source.
          source: "strategy",
          // Обрабатываем конструкцию: message.
          message: translateKey("settings.games.installed.diagnose.restarted"),
          // Закрываем текущий блок.
        });
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    },
    // Открываем массив.
    [addLog, ensureStrategy, gamesSettings]
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: useEffect.
  useEffect(() => {
    // Обрабатываем конструкцию: const entries = Object.entries(runningGames).
    const entries = Object.entries(runningGames);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: entries.length === 0.
    if (entries.length === 0) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const timer = window.setInterval(() => { for (const [id….
    const timer = window.setInterval(() => {
      // Перебираем элементы коллекции entries.
      for (const [id, pids] of entries) {
        // Обрабатываем конструкцию: void secureInvoke<boolean>(is_game_running, { pids }) .….
        void secureInvoke<boolean>("is_game_running", { pids })
          // Продолжаем цепочку вызовов.
          .then((alive) => {
            // Сохраняем пояснение разработчика: // Строго false: null или ошибка ответа не должны считаться
            // Строго false: null или ошибка ответа не должны считаться
            // Сохраняем пояснение разработчика: // выходом игры и портить маркер провала.
            // выходом игры и портить маркер провала.
            // Проверяем бизнес-условие: alive !== false.
            if (alive !== false) {
              // Завершаем функцию без возвращаемого значения.
              return;
              // Закрываем текущий блок.
            }
            // — разделитель логических блоков —

            // Обрабатываем конструкцию: markGameExit.
            markGameExit(id);
            // Обрабатываем конструкцию: useGameRuntimeStore.
            useGameRuntimeStore.getState().markStopped(id);
            // Закрываем текущий блок.
          })
          // Продолжаем цепочку вызовов.
          .catch(() => undefined);
        // Закрываем текущий блок.
      }
      // Закрываем текущий блок.
    }, GAME_LAUNCH_POLL_MS);
    // — разделитель логических блоков —

    // Возвращаем результат: () => { window.clearInterval(timer); }.
    return () => {
      // Обрабатываем конструкцию: window.
      window.clearInterval(timer);
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }, [runningGames]);
  // — разделитель логических блоков —

  // Возвращаем результат: { launchingId, prompt, toast, runningGames, runningByPa….
  return {
    // Передаём поле launchingId в объект.
    launchingId,
    // Передаём поле prompt в объект.
    prompt,
    // Передаём поле toast в объект.
    toast,
    // Передаём поле runningGames в объект.
    runningGames,
    // Передаём поле runningByPath в объект.
    runningByPath,
    // Передаём поле diagnosis в объект.
    diagnosis,
    // Передаём поле launch в объект.
    launch,
    // Передаём поле closeGame в объект.
    closeGame,
    // Передаём поле choosePrompt в объект.
    choosePrompt,
    // Передаём поле launchWithVpn в объект.
    launchWithVpn,
    // Передаём поле rechooseLaunchMode в объект.
    rechooseLaunchMode,
    // Передаём поле dismissPrompt в объект.
    dismissPrompt,
    // Передаём поле diagnose в объект.
    diagnose,
    // Передаём поле dismissDiagnosis в объект.
    dismissDiagnosis,
    // Передаём поле bypassFailed в объект.
    bypassFailed,
    // Передаём поле dismissBypassFailure в объект.
    dismissBypassFailure,
    // Передаём поле retryLaunch в объект.
    retryLaunch,
    // Передаём поле enableVpn в объект.
    enableVpn,
    // Передаём поле restartBypass в объект.
    restartBypass,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию recordLaunch.
function recordLaunch(id: string): void {
  // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
  const store = useInstalledGamesStore.getState();
  // Обрабатываем конструкцию: const game = store.games.find((item) => item.id === id).
  const game = store.games.find((item) => item.id === id);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: game === undefined.
  if (game === undefined) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: store.
  store.updateGame(id, {
    // Обрабатываем конструкцию: lastLaunchedAt.
    lastLaunchedAt: Date.now(),
    // Обрабатываем конструкцию: launchCount.
    launchCount: game.launchCount + 1,
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Игра закрылась. Если она с обходом и прожила меньше GAME_F…
 * Игра закрылась. Если она с обходом и прожила меньше GAME_FAST_EXIT_MS,
 // Сохраняем пояснение разработчика: * запоминаем провал: следующий запуск начнётся с предложения…
 * запоминаем провал: следующий запуск начнётся с предложения VPN.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию markGameExit.
function markGameExit(id: string): void {
  // Обрабатываем конструкцию: const store = useInstalledGamesStore.getState().
  const store = useInstalledGamesStore.getState();
  // Обрабатываем конструкцию: const game = store.games.find((item) => item.id === id).
  const game = store.games.find((item) => item.id === id);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: game === undefined.
  if (game === undefined) {
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: game.bypassChoice !== bypass.
  if (game.bypassChoice !== "bypass") {
    // Сохраняем пояснение разработчика: // Обход не участвовал: быстрая остановка — не его вина.
    // Обход не участвовал: быстрая остановка — не его вина.
    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const launchedAt = game.lastLaunchedAt ?? 0.
  const launchedAt = game.lastLaunchedAt ?? 0;
  // Обрабатываем конструкцию: const lived = Date.now() - launchedAt.
  const lived = Date.now() - launchedAt;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: launchedAt > 0 && lived < GAME_FAST_EXIT_MS.
  if (launchedAt > 0 && lived < GAME_FAST_EXIT_MS) {
    // Обрабатываем конструкцию: store.
    store.updateGame(id, { failedLaunchAt: Date.now() });
    // Закрываем текущий блок.
  } else if (game.failedLaunchAt !== undefined) {
    // Сохраняем пояснение разработчика: // Прошлый запуск дотянул до нормального срока: провала боль…
    // Прошлый запуск дотянул до нормального срока: провала больше нет.
    // Обрабатываем конструкцию: store.
    store.updateGame(id, { failedLaunchAt: undefined });
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию verifyBypass.
function verifyBypass(game: InstalledGame, addLog: AddLog): void {
  // Обрабатываем конструкцию: window.
  window.setTimeout(() => {
    // Обрабатываем конструкцию: const running = useStrategiesStore .getState() .strateg….
    const running = useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .strategies.some((item) => item.status === "running");
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: running.
    if (running) {
      // Завершаем функцию без возвращаемого значения.
      return;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: addLog.
    addLog({
      // Обрабатываем конструкцию: level.
      level: "warn",
      // Обрабатываем конструкцию: source.
      source: "user",
      // Обрабатываем конструкцию: message.
      message: translateKey("settings.games.installed.launch.bypassLost", {
        // Обрабатываем конструкцию: name.
        name: game.name,
        // Закрываем текущий блок.
      }),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, GAME_LAUNCH_CHECK_MS);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function pickStrategy(
  // Обрабатываем конструкцию: strategies.
  strategies: readonly Strategy[],
  // Обрабатываем конструкцию: lastStrategyId.
  lastStrategyId: string | null
  // Закрываем выражение или список аргументов.
): Strategy | undefined {
  // Обрабатываем конструкцию: const usable = strategies.filter((item) => item.error =….
  const usable = strategies.filter((item) => item.error === undefined);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: usable.length === 0.
  if (usable.length === 0) {
    // Возвращаем результат: undefined.
    return undefined;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const ratings = useStrategyRatingStore.getState().recor….
  const ratings = useStrategyRatingStore.getState().records;
  // Обрабатываем конструкцию: const scores = usable .map((item) => ({ id: item.id, sc….
  const scores = usable
    // Продолжаем цепочку вызовов.
    .map((item) => ({ id: item.id, score: ratings[item.id]?.ratingScore }))
    // Сохраняем пояснение разработчика: // Отсеиваем и null (нет замеров), и undefined (записи о стр…
    // Отсеиваем и null (нет замеров), и undefined (записи о стратегии
    // Сохраняем пояснение разработчика: // вообще нет): потенциально лучший список должен остаться п…
    // вообще нет): потенциально лучший список должен остаться пустым,
    // Сохраняем пояснение разработчика: // иначе победа достаётся случайной стратегии.
    // иначе победа достаётся случайной стратегии.
    // Продолжаем цепочку вызовов.
    .filter(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (item): item is { id: string; score: number } => item.score !== null
      // Закрываем выражение или список аргументов.
    )
    // Продолжаем цепочку вызовов.
    .filter(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (item): item is { id: string; score: number } => item.score !== undefined
      // Закрываем выражение или список аргументов.
    )
    // Продолжаем цепочку вызовов.
    .sort((left, right) => right.score - left.score);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: scores.length > 0.
  if (scores.length > 0) {
    // Обрабатываем конструкцию: const best = usable.find((item) => item.id === scores[0….
    const best = usable.find((item) => item.id === scores[0]?.id);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: best.
    if (best) {
      // Возвращаем результат: best.
      return best;
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const last = usable.find((item) => item.id === lastStra….
  const last = usable.find((item) => item.id === lastStrategyId);
  // — разделитель логических блоков —

  // Возвращаем результат: last ?? usable[0].
  return last ?? usable[0];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
