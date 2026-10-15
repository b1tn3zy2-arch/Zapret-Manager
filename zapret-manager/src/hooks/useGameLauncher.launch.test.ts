import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useGameLauncher } from "@/hooks/useGameLauncher";
import { useSettingsStore } from "@/stores/useSettingsStore";
import { useStrategiesStore } from "@/stores/useStrategiesStore";
import { useVpnStore } from "@/stores/useVpnStore";
import type { InstalledGame, Strategy } from "@/types";

const invokeMock = vi.fn(async (command: string, _args?: unknown) => {
  if (command === "run_strategy_native" || command === "run_strategy") {
    return { pid: 4242, logPath: "C:\\temp\\log.txt" };
  }

  if (command === "launch_game") {
    return 777;
  }

  if (command === "check_strategy_status") {
    return {
      running: true,
      winwsPids: [4242],
      startedAt: 1_700_000_000_000,
      uptime: 12,
    };
  }

  return null;
});

vi.mock("@tauri-apps/api/core", () => ({
  invoke: (command: string, args?: unknown) => invokeMock(command, args),
}));

vi.mock("@/i18n/core", () => ({
  translateKey: (key: string) => key,
}));

function strategy(patch: Partial<Strategy> = {}): Strategy {
  return {
    id: "alt-1",
    name: "ALT 1",
    filename: "alt-1.bat",
    path: "C:\\strategies\\alt-1.bat",
    description: "",
    services: [],
    techniques: [],
    fileType: "zapret",
    status: "idle",
    size: 1,
    ...patch,
  };
}

function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  return {
    id: "steam-portal",
    name: "Portal 2",
    appid: "620",
    platform: "steam",
    source: "steam",
    installPath: "C:\\Games\\Portal 2",
    executablePath: "C:\\Games\\Portal 2\\portal2.exe",
    launchCount: 0,
    ...patch,
  };
}

describe("запуск игры с обходом", () => {
  beforeEach(() => {
    invokeMock.mockClear();
    useStrategiesStore.setState({
      strategies: [strategy()],
      error: null,
      injectedGameIds: [],
    });
    useSettingsStore.setState((state) => ({
      settings: { ...state.settings, lastStrategyId: "alt-1", games: [] },
    }));
    useVpnStore.setState({
      activeConfigId: "cfg-1",
      status: {
        state: "disconnected",
        interface: null,
        endpoint: null,
        handshakeAt: null,
        bytesIn: null,
        bytesOut: null,
        uptimeSec: null,
        error: null,
      },
      killSwitchActive: false,
    });
  });

  it("поднимает стратегию, если она не запущена, и стартует игру", async () => {
    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game());
    });

    await waitFor(() => {
      expect(invokeMock.mock.calls[0]?.[0]).toMatch(/^run_strategy/);
    });
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      executablePath: expect.any(String),
      launchArgs: null,
      workingDir: expect.any(String),
    });
    expect(result.current.launchingId).toBeNull();
  });

  it("не запускает стратегию повторно, если она уже работает", async () => {
    useStrategiesStore.setState({
      strategies: [strategy({ status: "running" })],
    });
    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game());
    });

    expect(invokeMock.mock.calls[0]?.[0]).toBe("launch_game");
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      executablePath: expect.any(String),
      launchArgs: null,
      workingDir: expect.any(String),
    });
  });

  it("перезапускает работающий обход, если он запущен без доменов игры", async () => {
    useStrategiesStore.setState({
      strategies: [strategy({ status: "running" })],
      injectedGameIds: [],
    });
    useSettingsStore.setState((state) => ({
      settings: {
        ...state.settings,
        games: [
          {
            id: "portal",
            name: "Portal 2",
            icon: "Gamepad2",
            enabled: false,
            builtin: false,
            domains: ["portal2.example"],
            ipRanges: [],
            ports: [27015],
            autoRestore: true,
            createBackup: true,
            createdAt: 0,
          },
        ],
      },
    }));

    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game({ gameSettingsId: "portal" }));
    });

    // обход сначала останавливается и стартует заново с профилем игры
    expect(invokeMock).toHaveBeenCalledWith("stop_strategy", {
      strategyId: "alt-1",
    });
    expect(invokeMock).toHaveBeenCalledWith(
      "run_strategy_auto",
      expect.objectContaining({
        games: [
          expect.objectContaining({
            id: "portal",
            domains: ["portal2.example"],
            ports: [27015],
          }),
        ],
      })
    );
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      executablePath: expect.any(String),
      launchArgs: null,
      workingDir: expect.any(String),
    });
  });

  it("не перезапускает обход, если профиль игры уже применён", async () => {
    useStrategiesStore.setState({
      strategies: [strategy({ status: "running" })],
      injectedGameIds: ["portal"],
    });
    useSettingsStore.setState((state) => ({
      settings: {
        ...state.settings,
        games: [
          {
            id: "portal",
            name: "Portal 2",
            icon: "Gamepad2",
            enabled: true,
            builtin: false,
            domains: ["portal2.example"],
            ipRanges: [],
            ports: [27015],
            autoRestore: true,
            createBackup: true,
            createdAt: 0,
          },
        ],
      },
    }));

    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game({ gameSettingsId: "portal" }));
    });

    expect(invokeMock).not.toHaveBeenCalledWith("stop_strategy", {
      strategyId: "alt-1",
    });
    expect(invokeMock.mock.calls[0]?.[0]).toBe("launch_game");
  });

  it("находит профиль по названию, когда игра добавлена вручную", async () => {
    useStrategiesStore.setState({
      strategies: [strategy()],
      injectedGameIds: [],
    });
    useSettingsStore.setState((state) => ({
      settings: {
        ...state.settings,
        games: [
          {
            id: "outlast-trials",
            name: "Outlast Trials",
            icon: "Gamepad2",
            enabled: false,
            builtin: true,
            domains: ["rbg-services.com"],
            ipRanges: [],
            ports: [7777, 7830],
            autoRestore: true,
            createBackup: true,
            createdAt: 0,
          },
        ],
      },
    }));

    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(
        game({
          id: "manual-outlast",
          name: "The Outlast Trials",
          source: "userFolder",
          platform: "custom",
          manual: true,
        })
      );
    });

    expect(invokeMock).toHaveBeenCalledWith(
      "run_strategy_auto",
      expect.objectContaining({
        games: [expect.objectContaining({ id: "outlast-trials" })],
      })
    );
  });

  it("без стратегии показывает подсказку и не запускает игру", async () => {
    useStrategiesStore.setState({ strategies: [] });
    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game());
    });

    expect(result.current.prompt?.kind).toBe("noStrategy");
    expect(invokeMock).not.toHaveBeenCalledWith("launch_game", {
      executablePath: expect.any(String),
      launchArgs: null,
      workingDir: expect.any(String),
    });
  });

  it("предупреждает об античите до запуска", async () => {
    const { result } = renderHook(() => useGameLauncher());

    await act(async () => {
      await result.current.launch(game({ anticheat: "battleye" }));
    });

    expect(result.current.prompt?.kind).toBe("anticheat");
    expect(invokeMock).not.toHaveBeenCalledWith("launch_game", {
      executablePath: expect.any(String),
      launchArgs: null,
      workingDir: expect.any(String),
    });
  });
});
