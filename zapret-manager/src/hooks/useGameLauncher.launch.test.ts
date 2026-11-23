// Импортируем зависимости из модуля @testing-library/react.
import { act, renderHook, waitFor } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import { useGameLauncher } from "@/hooks/useGameLauncher";
// Импортируем зависимости из модуля @/stores/useGameRuntimeStore.
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
// Импортируем зависимости из модуля @/stores/useInstalledGamesStore.
import { useInstalledGamesStore } from "@/stores/useInstalledGamesStore";
// Импортируем зависимости из модуля @/stores/useSettingsStore.
import { useSettingsStore } from "@/stores/useSettingsStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useVpnStore.
import { useVpnStore } from "@/stores/useVpnStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame, Strategy } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию strategyCalls.
function strategyCalls(mock: { mock: { calls: unknown[][] } }): string[] {
  // Возвращаем результат: mock.mock.calls .map((call) => String(call[0])) .filter….
  return (
    // Продолжаем предыдущую конструкцию.
    mock.mock.calls
      // Продолжаем цепочку вызовов.
      .map((call) => String(call[0]))
      // Продолжаем цепочку вызовов.
      .filter(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (command) =>
          // Обрабатываем конструкцию: command.
          command.startsWith("run_strategy") || command === "launch_game"
        // Закрываем выражение или список аргументов.
      )
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// Обрабатываем конструкцию: const invokeMock = vi.fn(async (command: string, _args?….
const invokeMock = vi.fn(async (command: string, _args?: unknown) => {
  // Проверяем бизнес-условие: command === run_strategy_native || command === run_stra….
  if (command === "run_strategy_native" || command === "run_strategy") {
    // Возвращаем результат: { pid: 4242, logPath: C:\\temp\\log.txt }.
    return { pid: 4242, logPath: "C:\\temp\\log.txt" };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: command === launch_game.
  if (command === "launch_game") {
    // Возвращаем результат: [777, 778].
    return [777, 778];
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: command === check_strategy_status.
  if (command === "check_strategy_status") {
    // Возвращаем результат: { running: true, winwsPids: [4242], startedAt: 1_700_00….
    return {
      // Обрабатываем конструкцию: running.
      running: true,
      // Обрабатываем конструкцию: winwsPids.
      winwsPids: [4242],
      // Обрабатываем конструкцию: startedAt.
      startedAt: 1_700_000_000_000,
      // Обрабатываем конструкцию: uptime.
      uptime: 12,
      // Закрываем текущий блок.
    };
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: null.
  return null;
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@tauri-apps/api/core", () => ({
  // Обрабатываем конструкцию: invoke.
  invoke: (command: string, args?: unknown) => invokeMock(command, args),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/i18n/core", () => ({
  // Обрабатываем конструкцию: translateKey.
  translateKey: (key: string) => key,
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Объявляем функцию strategy.
function strategy(patch: Partial<Strategy> = {}): Strategy {
  // Возвращаем результат: { id: alt-1, name: ALT 1, filename: alt-1.bat, path: C:….
  return {
    // Обрабатываем конструкцию: id.
    id: "alt-1",
    // Обрабатываем конструкцию: name.
    name: "ALT 1",
    // Обрабатываем конструкцию: filename.
    filename: "alt-1.bat",
    // Обрабатываем конструкцию: path.
    path: "C:\\strategies\\alt-1.bat",
    // Обрабатываем конструкцию: description.
    description: "",
    // Обрабатываем конструкцию: services.
    services: [],
    // Обрабатываем конструкцию: techniques.
    techniques: [],
    // Обрабатываем конструкцию: fileType.
    fileType: "zapret",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 1,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  // Возвращаем результат: { id: steam-portal, name: Portal 2, appid: 620, platfor….
  return {
    // Обрабатываем конструкцию: id.
    id: "steam-portal",
    // Обрабатываем конструкцию: name.
    name: "Portal 2",
    // Обрабатываем конструкцию: appid.
    appid: "620",
    // Обрабатываем конструкцию: platform.
    platform: "steam",
    // Обрабатываем конструкцию: source.
    source: "steam",
    // Обрабатываем конструкцию: installPath.
    installPath: "C:\\Games\\Portal 2",
    // Обрабатываем конструкцию: executablePath.
    executablePath: "C:\\Games\\Portal 2\\portal2.exe",
    // Обрабатываем конструкцию: launchCount.
    launchCount: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("запуск игры с обходом", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockClear();
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().clearAll();
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({
      // Обрабатываем конструкцию: strategies.
      strategies: [strategy()],
      // Обрабатываем конструкцию: error.
      error: null,
      // Обрабатываем конструкцию: injectedGameIds.
      injectedGameIds: [],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState((state) => ({
      // Обрабатываем конструкцию: settings.
      settings: { ...state.settings, lastStrategyId: "alt-1", games: [] },
      // Закрываем текущий блок.
    }));
    // Обрабатываем конструкцию: useVpnStore.
    useVpnStore.setState({
      // Обрабатываем конструкцию: activeConfigId.
      activeConfigId: "cfg-1",
      // Обрабатываем конструкцию: status.
      status: {
        // Обрабатываем конструкцию: state.
        state: "disconnected",
        // Обрабатываем конструкцию: interface.
        interface: null,
        // Обрабатываем конструкцию: endpoint.
        endpoint: null,
        // Обрабатываем конструкцию: handshakeAt.
        handshakeAt: null,
        // Обрабатываем конструкцию: bytesIn.
        bytesIn: null,
        // Обрабатываем конструкцию: bytesOut.
        bytesOut: null,
        // Обрабатываем конструкцию: uptimeSec.
        uptimeSec: null,
        // Обрабатываем конструкцию: error.
        error: null,
        // Закрываем текущий блок.
      },
      // Обрабатываем конструкцию: killSwitchActive.
      killSwitchActive: false,
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("хранит состояние запуска в сторе, а не в локальном хуке", async () => {
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ bypassChoi….
      await result.current.launch(game({ bypassChoice: "bypass" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(useGameRuntimeSt….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(useGameRuntimeStore.getState().isRunning("steam-portal")).toBe(
        // Обрабатываем конструкцию: true.
        true
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // состояние живёт в сторе с persist: новый экземпляр хука (…
    // состояние живёт в сторе с persist: новый экземпляр хука (переход на
    // Сохраняем пояснение разработчика: // другую страницу) сразу видит запущенную игру
    // другую страницу) сразу видит запущенную игру
    // Обрабатываем конструкцию: const second = renderHook(() => useGameLauncher()).
    const second = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // хранится всё дерево процессов, а не только PID лаунчера
    // хранится всё дерево процессов, а не только PID лаунчера
    // Обрабатываем конструкцию: expect.
    expect(second.result.current.runningGames["steam-portal"]).toEqual([
      // Обрабатываем конструкцию: 777.
      777, 778,
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: second.
    second.unmount();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("проверяет игру по всему дереву процессов", async () => {
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ bypassChoi….
      await result.current.launch(game({ bypassChoice: "bypass" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(invokeMock).toHa….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(invokeMock).toHaveBeenCalledWith("launch_game", expect.anything());
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const pids = useGameRuntimeStore.getState().pidsOf(stea….
    const pids = useGameRuntimeStore.getState().pidsOf("steam-portal");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pids.length).toBeGreaterThan(0);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunning("steam-portal", [10, 20, 30]);
    // Обрабатываем конструкцию: expect.
    expect(useGameRuntimeStore.getState().pidsOf("steam-portal")).toEqual([
      // Обрабатываем конструкцию: 10.
      10, 20, 30,
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: void result.
    void result;
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("поднимает стратегию, если она не запущена, и стартует игру", async () => {
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ bypassChoi….
      await result.current.launch(game({ bypassChoice: "bypass" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(strategyCalls(in….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(strategyCalls(invokeMock)[0]).toMatch(/^run_strategy/);
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: expect.
    expect(result.current.launchingId).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не запускает стратегию повторно, если она уже работает", async () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({
      // Обрабатываем конструкцию: strategies.
      strategies: [strategy({ status: "running" })],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ bypassChoi….
      await result.current.launch(game({ bypassChoice: "bypass" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(strategyCalls(invokeMock)[0]).toBe("launch_game");
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("перезапускает работающий обход, если он запущен без доменов игры", async () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({
      // Обрабатываем конструкцию: strategies.
      strategies: [strategy({ status: "running" })],
      // Обрабатываем конструкцию: injectedGameIds.
      injectedGameIds: [],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState((state) => ({
      // Обрабатываем конструкцию: settings.
      settings: {
        // Разворачиваем ...state.settings в коллекцию.
        ...state.settings,
        // Обрабатываем конструкцию: games.
        games: [
          // Открываем объектный литерал.
          {
            // Обрабатываем конструкцию: id.
            id: "portal",
            // Обрабатываем конструкцию: name.
            name: "Portal 2",
            // Обрабатываем конструкцию: icon.
            icon: "Gamepad2",
            // Обрабатываем конструкцию: enabled.
            enabled: false,
            // Обрабатываем конструкцию: builtin.
            builtin: false,
            // Обрабатываем конструкцию: domains.
            domains: ["portal2.example"],
            // Обрабатываем конструкцию: ipRanges.
            ipRanges: [],
            // Обрабатываем конструкцию: ports.
            ports: [27015],
            // Обрабатываем конструкцию: autoRestore.
            autoRestore: true,
            // Обрабатываем конструкцию: createBackup.
            createBackup: true,
            // Обрабатываем конструкцию: createdAt.
            createdAt: 0,
            // Закрываем текущий блок.
          },
          // Закрываем массив или список.
        ],
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch( game({ bypassCho….
      await result.current.launch(
        // Обрабатываем конструкцию: game.
        game({ bypassChoice: "bypass", gameSettingsId: "portal" })
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Сохраняем пояснение разработчика: // обход сначала останавливается и стартует заново с профиле…
    // обход сначала останавливается и стартует заново с профилем игры
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith("stop_strategy", {
      // Обрабатываем конструкцию: strategyId.
      strategyId: "alt-1",
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith(
      // Обрабатываем конструкцию: run_strategy_auto.
      "run_strategy_auto",
      // Обрабатываем конструкцию: expect.
      expect.objectContaining({
        // Обрабатываем конструкцию: games.
        games: [
          // Обрабатываем конструкцию: expect.
          expect.objectContaining({
            // Обрабатываем конструкцию: id.
            id: "portal",
            // Обрабатываем конструкцию: domains.
            domains: ["portal2.example"],
            // Обрабатываем конструкцию: ports.
            ports: [27015],
            // Закрываем текущий блок.
          }),
          // Закрываем массив или список.
        ],
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не перезапускает обход, если профиль игры уже применён", async () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({
      // Обрабатываем конструкцию: strategies.
      strategies: [strategy({ status: "running" })],
      // Обрабатываем конструкцию: injectedGameIds.
      injectedGameIds: ["portal"],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState((state) => ({
      // Обрабатываем конструкцию: settings.
      settings: {
        // Разворачиваем ...state.settings в коллекцию.
        ...state.settings,
        // Обрабатываем конструкцию: games.
        games: [
          // Открываем объектный литерал.
          {
            // Обрабатываем конструкцию: id.
            id: "portal",
            // Обрабатываем конструкцию: name.
            name: "Portal 2",
            // Обрабатываем конструкцию: icon.
            icon: "Gamepad2",
            // Обрабатываем конструкцию: enabled.
            enabled: true,
            // Обрабатываем конструкцию: builtin.
            builtin: false,
            // Обрабатываем конструкцию: domains.
            domains: ["portal2.example"],
            // Обрабатываем конструкцию: ipRanges.
            ipRanges: [],
            // Обрабатываем конструкцию: ports.
            ports: [27015],
            // Обрабатываем конструкцию: autoRestore.
            autoRestore: true,
            // Обрабатываем конструкцию: createBackup.
            createBackup: true,
            // Обрабатываем конструкцию: createdAt.
            createdAt: 0,
            // Закрываем текущий блок.
          },
          // Закрываем массив или список.
        ],
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch( game({ bypassCho….
      await result.current.launch(
        // Обрабатываем конструкцию: game.
        game({ bypassChoice: "bypass", gameSettingsId: "portal" })
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(invokeMock).not.toHaveBeenCalledWith("stop_strategy", {
      // Обрабатываем конструкцию: strategyId.
      strategyId: "alt-1",
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: expect.
    expect(strategyCalls(invokeMock)[0]).toBe("launch_game");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("находит профиль по названию, когда игра добавлена вручную", async () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({
      // Обрабатываем конструкцию: strategies.
      strategies: [strategy()],
      // Обрабатываем конструкцию: injectedGameIds.
      injectedGameIds: [],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: useSettingsStore.
    useSettingsStore.setState((state) => ({
      // Обрабатываем конструкцию: settings.
      settings: {
        // Разворачиваем ...state.settings в коллекцию.
        ...state.settings,
        // Обрабатываем конструкцию: games.
        games: [
          // Открываем объектный литерал.
          {
            // Обрабатываем конструкцию: id.
            id: "outlast-trials",
            // Обрабатываем конструкцию: name.
            name: "Outlast Trials",
            // Обрабатываем конструкцию: icon.
            icon: "Gamepad2",
            // Обрабатываем конструкцию: enabled.
            enabled: false,
            // Обрабатываем конструкцию: builtin.
            builtin: true,
            // Обрабатываем конструкцию: domains.
            domains: ["rbg-services.com"],
            // Обрабатываем конструкцию: ipRanges.
            ipRanges: [],
            // Обрабатываем конструкцию: ports.
            ports: [7777, 7830],
            // Обрабатываем конструкцию: autoRestore.
            autoRestore: true,
            // Обрабатываем конструкцию: createBackup.
            createBackup: true,
            // Обрабатываем конструкцию: createdAt.
            createdAt: 0,
            // Закрываем текущий блок.
          },
          // Закрываем массив или список.
        ],
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch( game({ id: manua….
      await result.current.launch(
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "manual-outlast",
          // Обрабатываем конструкцию: name.
          name: "The Outlast Trials",
          // Обрабатываем конструкцию: source.
          source: "userFolder",
          // Обрабатываем конструкцию: platform.
          platform: "custom",
          // Обрабатываем конструкцию: manual.
          manual: true,
          // Обрабатываем конструкцию: bypassChoice.
          bypassChoice: "bypass",
          // Закрываем текущий блок.
        })
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(invokeMock).toHaveBeenCalledWith(
      // Обрабатываем конструкцию: run_strategy_auto.
      "run_strategy_auto",
      // Обрабатываем конструкцию: expect.
      expect.objectContaining({
        // Обрабатываем конструкцию: games.
        games: [expect.objectContaining({ id: "outlast-trials" })],
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("без стратегии показывает подсказку и не запускает игру", async () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.setState({ strategies: [] });
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ bypassChoi….
      await result.current.launch(game({ bypassChoice: "bypass" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.prompt?.kind).toBe("noStrategy");
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).not.toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("первый запуск предлагает выбор способа запуска", async () => {
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game({ anticheat:….
      await result.current.launch(game({ anticheat: "battleye" }));
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.prompt?.kind).toBe("chooseBypass");
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).not.toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("выбор «без обхода» запускает игру без стратегий и сохраняется", async () => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.setState({ games: [game()], removedIds: [] });
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game()).
      await result.current.launch(game());
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.prompt?.kind).toBe("chooseBypass");
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.choosePrompt(plain).
      await result.current.choosePrompt("plain");
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(strategyCalls(invokeMock)).toEqual(["launch_game"]);
    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games[0]?.bypassChoice).toBe(
      // Обрабатываем конструкцию: plain.
      "plain"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("выбор «с обходом» запускает обход и сохраняется", async () => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.setState({ games: [game()], removedIds: [] });
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.launch(game()).
      await result.current.launch(game());
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { await result.current.….
    await act(async () => {
      // Ожидаем завершение асинхронной операции await result.current.choosePrompt(bypass).
      await result.current.choosePrompt("bypass");
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(strategyCalls(invokeMock)[0]).toMatch(/^run_strategy/);
    // Обрабатываем конструкцию: expect.
    expect(useInstalledGamesStore.getState().games[0]?.bypassChoice).toBe(
      // Обрабатываем конструкцию: bypass.
      "bypass"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("быстрый провал прошлого запуска предлагает VPN и снимает маркер", async () => {
    // Обрабатываем конструкцию: useInstalledGamesStore.
    useInstalledGamesStore.setState({
      // Обрабатываем конструкцию: games.
      games: [game({ bypassChoice: "bypass", failedLaunchAt: Date.now() })],
      // Обрабатываем конструкцию: removedIds.
      removedIds: [],
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: const { result } = renderHook(() => useGameLauncher()).
    const { result } = renderHook(() => useGameLauncher());
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await act(async () => { const failed = useIns….
    await act(async () => {
      // Обрабатываем конструкцию: const failed = useInstalledGamesStore.getState().games[….
      const failed = useInstalledGamesStore.getState().games[0];
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: failed === undefined.
      if (failed === undefined) {
        // Выбрасываем исключение throw new Error(game not seeded);.
        throw new Error("game not seeded");
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Ожидаем завершение асинхронной операции await result.current.launch(failed).
      await result.current.launch(failed);
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.prompt?.kind).toBe("failedBefore");
    // Обрабатываем конструкцию: expect.
    expect(invokeMock).not.toHaveBeenCalledWith("launch_game", {
      // Обрабатываем конструкцию: executablePath.
      executablePath: expect.any(String),
      // Обрабатываем конструкцию: launchArgs.
      launchArgs: null,
      // Обрабатываем конструкцию: workingDir.
      workingDir: expect.any(String),
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: act.
    act(() => {
      // Обрабатываем конструкцию: result.
      result.current.launchWithVpn();
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(result.current.prompt).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useInstalledGamesStore.
      useInstalledGamesStore.getState().games[0]?.failedLaunchAt
      // Закрываем выражение или список аргументов.
    ).toBeUndefined();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
