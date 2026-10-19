import { invoke } from "@tauri-apps/api/core";

import { enabledGames } from "@/lib/gameUtils";
import { useSettingsStore } from "@/stores/useSettingsStore";
import type { GameSettings, InjectionReport, InstalledGame } from "@/types";

export interface NativeGamePayload {
  id: string;
  name: string;
  domains: string[];
  ips: string[];
  ports: number[];
  /** Игра с античитом: игровую UDP-группу в winws не добавляем */
  dropUdpFilter: boolean;
  /** Игра с античитом: список игровых адресов через --ipset не подставляем */
  dropIpset: boolean;
}

export interface StrategyRunResult {
  pid: number;
  logPath: string;
  /** id игр, чьи домены и порты попали в конфиг запущенной стратегии */
  gamesInjected: string[];
}

export interface GameTuning {
  gameId: string;
  gameName: string;
  requiresEacTuning: boolean;
  usesGamelift: boolean;
  ports: number[];
  addedPorts: number[];
  dropUdpFilter: boolean;
  dropIpset: boolean;
  notes: string[];
}

export interface DiagnosticResult {
  gameId: string;
  code: string;
  message: string;
  recommendation: string;
  logPaths: string[];
  applied: string[];
}

export interface ConnectivityReport {
  dnsOk: boolean;
  dnsAddress: string | null;
  dnsError: string | null;
  tcp: {
    target: string;
    port: number;
    status: string;
    latencyMs: number | null;
  }[];
  udpStatus: string;
  udpNote: string;
  verdict: string;
}

/** Подбор параметров стратегии под конкретную игру. */
export async function tuneGame(
  game: InstalledGame,
  profile: GameSettings | undefined
): Promise<GameTuning> {
  return invoke<GameTuning>("tune_strategy_for_game", {
    gameId: game.id,
    gameName: game.name,
    installPath: game.installPath,
    basePorts: profile?.ports ?? [],
    domains: profile?.domains ?? [],
  });
}

export async function analyzeGameLogs(
  game: InstalledGame,
  tuning: GameTuning | null
): Promise<DiagnosticResult> {
  return invoke<DiagnosticResult>("analyze_game_logs", {
    input: {
      gameId: game.id,
      gameName: game.name,
      ports: tuning?.ports ?? [],
      applied: tuning?.notes ?? [],
    },
  });
}

export async function checkGameConnectivity(): Promise<ConnectivityReport> {
  return invoke<ConnectivityReport>("check_game_connectivity");
}

export interface EndpointReport {
  host: string;
  ok: boolean;
  statusCode: number | null;
  latencyMs: number | null;
  stage: string;
  error: string | null;
  hint: string;
}

/** Настоящий TLS-хендшейк к сервисам игры: так видно, подходит ли стратегия. */
export async function checkGameEndpoints(
  hosts: readonly string[]
): Promise<EndpointReport[]> {
  return invoke<EndpointReport[]>("check_game_endpoints", { hosts });
}

export interface GameEndpoint {
  ip: string;
  port: number;
  region: string | null;
  source: string;
}

export interface TrafficReport {
  ip: string;
  port: number;
  outbound: number;
  inbound: number;
  tampered: number;
  dropped: number;
  verdict: string;
  message: string;
  logPath: string | null;
}

/** Сервер, который игра назначила на матч: читается из лога движка. */
export async function detectGameEndpoints(): Promise<GameEndpoint[]> {
  return invoke<GameEndpoint[]>("detect_game_endpoints");
}

/** Что обход делает с пакетами к игровому серверу — по debug-логу winws. */
export async function analyzeGameTraffic(
  ip: string,
  port: number
): Promise<TrafficReport> {
  return invoke<TrafficReport>("analyze_traffic", { ip, port });
}

function toNativeGames(
  games: readonly GameSettings[],
  tuning: GameTuning | null
): NativeGamePayload[] {
  return enabledGames(games).map((game) => {
    const own = tuning?.gameId === game.id ? tuning : null;

    return {
      id: game.id,
      name: game.name,
      domains: game.domains,
      ips: game.ipRanges,
      ports: own?.ports ?? game.ports,
      dropUdpFilter: own?.dropUdpFilter ?? false,
      dropIpset: own?.dropIpset ?? false,
    };
  });
}

export async function launchStrategy(
  strategyId: string,
  path: string,
  tuning: GameTuning | null = null
): Promise<StrategyRunResult> {
  const store = useSettingsStore.getState();

  if (!store.loaded) {
    await store.loadFromFile();
  }

  const settings = useSettingsStore.getState().settings;
  const engine = settings.advanced.strategyEngine;

  if (engine === "legacy") {
    const active = enabledGames(settings.games);

    for (const game of active) {
      await invoke<InjectionReport>("inject_outlast", {
        strategyPath: path,
        domains: game.domains,
        ips: game.ipRanges,
        ports: game.ports,
        createBackupFlag: game.createBackup,
      });
    }

    const result = await invoke<Omit<StrategyRunResult, "gamesInjected">>(
      "run_strategy",
      { strategyId, path }
    );

    return { ...result, gamesInjected: active.map((game) => game.id) };
  }

  const games = toNativeGames(settings.games, tuning);

  if (engine === "native") {
    // Жёсткий режим: конфиг должен разбираться, иначе запуск падает с
    // понятной ошибкой вместо тихого отката на старый движок.
    const result = await invoke<Omit<StrategyRunResult, "gamesInjected">>(
      "run_strategy_native",
      { strategyId, path, games }
    );

    return { ...result, gamesInjected: games.map((game) => game.id) };
  }

  // auto: движок выбирается по самой стратегии
  const result = await invoke<Omit<StrategyRunResult, "gamesInjected">>(
    "run_strategy_auto",
    { strategyId, path, games }
  );

  return { ...result, gamesInjected: games.map((game) => game.id) };
}
