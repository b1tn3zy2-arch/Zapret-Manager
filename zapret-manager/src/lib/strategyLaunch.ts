// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke } from "@/lib/secureInvoke";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/gameUtils.
import { enabledGames } from "@/lib/gameUtils";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/types.
import type { GameSettings, InjectionReport, InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface NativeGamePayload {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: name.
  name: string;
  // Обрабатываем конструкцию: domains.
  domains: string[];
  // Обрабатываем конструкцию: ips.
  ips: string[];
  // Обрабатываем конструкцию: ports.
  ports: number[];
  // Сохраняем пояснение разработчика: Игра с античитом: игровую UDP-группу в winws не добавляем
  /** Игра с античитом: игровую UDP-группу в winws не добавляем */
  // Обрабатываем конструкцию: dropUdpFilter.
  dropUdpFilter: boolean;
  // Сохраняем пояснение разработчика: Игра с античитом: список игровых адресов через --ipset не по…
  /** Игра с античитом: список игровых адресов через --ipset не подставляем */
  // Обрабатываем конструкцию: dropIpset.
  dropIpset: boolean;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyRunResult {
  // Обрабатываем конструкцию: pid.
  pid: number;
  // Обрабатываем конструкцию: logPath.
  logPath: string;
  // Сохраняем пояснение разработчика: id игр, чьи домены и порты попали в конфиг запущенной страте…
  /** id игр, чьи домены и порты попали в конфиг запущенной стратегии */
  // Обрабатываем конструкцию: gamesInjected.
  gamesInjected: string[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameTuning {
  // Обрабатываем конструкцию: gameId.
  gameId: string;
  // Обрабатываем конструкцию: gameName.
  gameName: string;
  // Обрабатываем конструкцию: requiresEacTuning.
  requiresEacTuning: boolean;
  // Обрабатываем конструкцию: usesGamelift.
  usesGamelift: boolean;
  // Обрабатываем конструкцию: ports.
  ports: number[];
  // Обрабатываем конструкцию: addedPorts.
  addedPorts: number[];
  // Обрабатываем конструкцию: dropUdpFilter.
  dropUdpFilter: boolean;
  // Обрабатываем конструкцию: dropIpset.
  dropIpset: boolean;
  // Обрабатываем конструкцию: notes.
  notes: string[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface DiagnosticResult {
  // Обрабатываем конструкцию: gameId.
  gameId: string;
  // Обрабатываем конструкцию: code.
  code: string;
  // Обрабатываем конструкцию: message.
  message: string;
  // Обрабатываем конструкцию: recommendation.
  recommendation: string;
  // Обрабатываем конструкцию: logPaths.
  logPaths: string[];
  // Обрабатываем конструкцию: applied.
  applied: string[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface ConnectivityReport {
  // Обрабатываем конструкцию: dnsOk.
  dnsOk: boolean;
  // Обрабатываем конструкцию: dnsAddress.
  dnsAddress: string | null;
  // Обрабатываем конструкцию: dnsError.
  dnsError: string | null;
  // Обрабатываем конструкцию: tcp.
  tcp: {
    // Обрабатываем конструкцию: target.
    target: string;
    // Обрабатываем конструкцию: port.
    port: number;
    // Обрабатываем конструкцию: status.
    status: string;
    // Обрабатываем конструкцию: latencyMs.
    latencyMs: number | null;
    // Закрываем текущий блок.
  }[];
  // Обрабатываем конструкцию: udpStatus.
  udpStatus: string;
  // Обрабатываем конструкцию: udpNote.
  udpNote: string;
  // Обрабатываем конструкцию: verdict.
  verdict: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Подбор параметров стратегии под конкретную игру.
/** Подбор параметров стратегии под конкретную игру. */
// Обрабатываем конструкцию: export.
export async function tuneGame(
  // Обрабатываем конструкцию: game.
  game: InstalledGame,
  // Обрабатываем конструкцию: profile.
  profile: GameSettings | undefined
  // Закрываем выражение или список аргументов.
): Promise<GameTuning> {
  // Возвращаем результат: secureInvoke<GameTuning>(tune_strategy_for_game, { game….
  return secureInvoke<GameTuning>("tune_strategy_for_game", {
    // Обрабатываем конструкцию: gameId.
    gameId: game.id,
    // Обрабатываем конструкцию: gameName.
    gameName: game.name,
    // Обрабатываем конструкцию: installPath.
    installPath: game.installPath,
    // Обрабатываем конструкцию: basePorts.
    basePorts: profile?.ports ?? [],
    // Обрабатываем конструкцию: domains.
    domains: profile?.domains ?? [],
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function analyzeGameLogs(
  // Обрабатываем конструкцию: game.
  game: InstalledGame,
  // Обрабатываем конструкцию: tuning.
  tuning: GameTuning | null
  // Закрываем выражение или список аргументов.
): Promise<DiagnosticResult> {
  // Возвращаем результат: secureInvoke<DiagnosticResult>(analyze_game_logs, { inp….
  return secureInvoke<DiagnosticResult>("analyze_game_logs", {
    // Обрабатываем конструкцию: input.
    input: {
      // Обрабатываем конструкцию: gameId.
      gameId: game.id,
      // Обрабатываем конструкцию: gameName.
      gameName: game.name,
      // Обрабатываем конструкцию: ports.
      ports: tuning?.ports ?? [],
      // Обрабатываем конструкцию: applied.
      applied: tuning?.notes ?? [],
      // Закрываем текущий блок.
    },
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function checkGameConnectivity(): Promise<ConnectivityReport> {
  // Возвращаем результат: secureInvoke<ConnectivityReport>(check_game_connectivit….
  return secureInvoke<ConnectivityReport>("check_game_connectivity");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface EndpointReport {
  // Обрабатываем конструкцию: host.
  host: string;
  // Обрабатываем конструкцию: ok.
  ok: boolean;
  // Обрабатываем конструкцию: statusCode.
  statusCode: number | null;
  // Обрабатываем конструкцию: latencyMs.
  latencyMs: number | null;
  // Обрабатываем конструкцию: stage.
  stage: string;
  // Обрабатываем конструкцию: error.
  error: string | null;
  // Обрабатываем конструкцию: hint.
  hint: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Настоящий TLS-хендшейк к сервисам игры: так видно, подходит …
/** Настоящий TLS-хендшейк к сервисам игры: так видно, подходит ли стратегия. */
// Обрабатываем конструкцию: export.
export async function checkGameEndpoints(
  // Обрабатываем конструкцию: hosts.
  hosts: readonly string[]
  // Закрываем выражение или список аргументов.
): Promise<EndpointReport[]> {
  // Возвращаем результат: secureInvoke<EndpointReport[]>(check_game_endpoints, { ….
  return secureInvoke<EndpointReport[]>("check_game_endpoints", { hosts });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface GameEndpoint {
  // Обрабатываем конструкцию: ip.
  ip: string;
  // Обрабатываем конструкцию: port.
  port: number;
  // Обрабатываем конструкцию: region.
  region: string | null;
  // Обрабатываем конструкцию: source.
  source: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface TrafficReport {
  // Обрабатываем конструкцию: ip.
  ip: string;
  // Обрабатываем конструкцию: port.
  port: number;
  // Обрабатываем конструкцию: outbound.
  outbound: number;
  // Обрабатываем конструкцию: inbound.
  inbound: number;
  // Обрабатываем конструкцию: tampered.
  tampered: number;
  // Обрабатываем конструкцию: dropped.
  dropped: number;
  // Обрабатываем конструкцию: verdict.
  verdict: string;
  // Обрабатываем конструкцию: message.
  message: string;
  // Обрабатываем конструкцию: logPath.
  logPath: string | null;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Сервер, который игра назначила на матч: читается из лога дви…
/** Сервер, который игра назначила на матч: читается из лога движка. */
// Обрабатываем конструкцию: export.
export async function detectGameEndpoints(): Promise<GameEndpoint[]> {
  // Возвращаем результат: secureInvoke<GameEndpoint[]>(detect_game_endpoints).
  return secureInvoke<GameEndpoint[]>("detect_game_endpoints");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика: Что обход делает с пакетами к игровому серверу — по debug-ло…
/** Что обход делает с пакетами к игровому серверу — по debug-логу winws. */
// Обрабатываем конструкцию: export.
export async function analyzeGameTraffic(
  // Обрабатываем конструкцию: ip.
  ip: string,
  // Обрабатываем конструкцию: port.
  port: number
  // Закрываем выражение или список аргументов.
): Promise<TrafficReport> {
  // Возвращаем результат: secureInvoke<TrafficReport>(analyze_traffic, { ip, port….
  return secureInvoke<TrafficReport>("analyze_traffic", { ip, port });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию toNativeGames.
function toNativeGames(
  // Обрабатываем конструкцию: games.
  games: readonly GameSettings[],
  // Обрабатываем конструкцию: tuning.
  tuning: GameTuning | null
  // Закрываем выражение или список аргументов.
): NativeGamePayload[] {
  // Возвращаем результат: enabledGames(games).map((game) => { const own = tuning?….
  return enabledGames(games).map((game) => {
    // Обрабатываем конструкцию: const own = tuning?.gameId === game.id ? tuning : null.
    const own = tuning?.gameId === game.id ? tuning : null;
    // — разделитель логических блоков —

    // Возвращаем результат: { id: game.id, name: game.name, domains: game.domains, ….
    return {
      // Обрабатываем конструкцию: id.
      id: game.id,
      // Обрабатываем конструкцию: name.
      name: game.name,
      // Обрабатываем конструкцию: domains.
      domains: game.domains,
      // Обрабатываем конструкцию: ips.
      ips: game.ipRanges,
      // Обрабатываем конструкцию: ports.
      ports: own?.ports ?? game.ports,
      // Обрабатываем конструкцию: dropUdpFilter.
      dropUdpFilter: own?.dropUdpFilter ?? false,
      // Обрабатываем конструкцию: dropIpset.
      dropIpset: own?.dropIpset ?? false,
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function launchStrategy(
  // Обрабатываем конструкцию: strategyId.
  strategyId: string,
  // Обрабатываем конструкцию: path.
  path: string,
  // Обрабатываем конструкцию: tuning.
  tuning: GameTuning | null = null
  // Закрываем выражение или список аргументов.
): Promise<StrategyRunResult> {
  // Обрабатываем конструкцию: const store = useSettingsStore.getState().
  const store = useSettingsStore.getState();
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: !store.loaded.
  if (!store.loaded) {
    // Ожидаем завершение асинхронной операции await store.loadFromFile().
    await store.loadFromFile();
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const settings = useSettingsStore.getState().settings.
  const settings = useSettingsStore.getState().settings;
  // Обрабатываем конструкцию: const engine = settings.advanced.strategyEngine.
  const engine = settings.advanced.strategyEngine;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: engine === legacy.
  if (engine === "legacy") {
    // Обрабатываем конструкцию: const active = enabledGames(settings.games).
    const active = enabledGames(settings.games);
    // — разделитель логических блоков —

    // Перебираем элементы коллекции active.
    for (const game of active) {
      // Ожидаем завершение асинхронной операции await secureInvoke<InjectionReport>(inject_ou….
      await secureInvoke<InjectionReport>("inject_outlast", {
        // Обрабатываем конструкцию: strategyPath.
        strategyPath: path,
        // Обрабатываем конструкцию: domains.
        domains: game.domains,
        // Обрабатываем конструкцию: ips.
        ips: game.ipRanges,
        // Обрабатываем конструкцию: ports.
        ports: game.ports,
        // Обрабатываем конструкцию: createBackupFlag.
        createBackupFlag: game.createBackup,
        // Закрываем текущий блок.
      });
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const result = await secureInvoke<Omit<StrategyRunResul….
    const result = await secureInvoke<Omit<StrategyRunResult, "gamesInjected">>(
      // Обрабатываем конструкцию: run_strategy.
      "run_strategy",
      // Открываем объектный литерал.
      { strategyId, path }
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Возвращаем результат: { ...result, gamesInjected: active.map((game) => game.i….
    return { ...result, gamesInjected: active.map((game) => game.id) };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: const games = toNativeGames(settings.games, tuning).
  const games = toNativeGames(settings.games, tuning);
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: engine === native.
  if (engine === "native") {
    // Сохраняем пояснение разработчика: // Жёсткий режим: конфиг должен разбираться, иначе запуск па…
    // Жёсткий режим: конфиг должен разбираться, иначе запуск падает с
    // Сохраняем пояснение разработчика: // понятной ошибкой вместо тихого отката на старый движок.
    // понятной ошибкой вместо тихого отката на старый движок.
    // Обрабатываем конструкцию: const result = await secureInvoke<Omit<StrategyRunResul….
    const result = await secureInvoke<Omit<StrategyRunResult, "gamesInjected">>(
      // Обрабатываем конструкцию: run_strategy_native.
      "run_strategy_native",
      // Открываем объектный литерал.
      { strategyId, path, games }
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Возвращаем результат: { ...result, gamesInjected: games.map((game) => game.id….
    return { ...result, gamesInjected: games.map((game) => game.id) };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Сохраняем пояснение разработчика: // auto: движок выбирается по самой стратегии
  // auto: движок выбирается по самой стратегии
  // Обрабатываем конструкцию: const result = await secureInvoke<Omit<StrategyRunResul….
  const result = await secureInvoke<Omit<StrategyRunResult, "gamesInjected">>(
    // Обрабатываем конструкцию: run_strategy_auto.
    "run_strategy_auto",
    // Открываем объектный литерал.
    { strategyId, path, games }
    // Закрываем выражение или список аргументов.
  );
  // — разделитель логических блоков —

  // Возвращаем результат: { ...result, gamesInjected: games.map((game) => game.id….
  return { ...result, gamesInjected: games.map((game) => game.id) };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
