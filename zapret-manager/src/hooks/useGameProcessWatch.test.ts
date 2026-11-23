// Импортируем зависимости из модуля @testing-library/react.
import { renderHook, waitFor } from "@testing-library/react";
// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it, vi } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useGameProcessWatch.
import { useGameProcessWatch } from "@/hooks/useGameProcessWatch";
// Импортируем зависимости из модуля @/stores/useGameRuntimeStore.
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const invokeMock = vi.fn( async (_command: string, _arg….
const invokeMock = vi.fn(
  // Обрабатываем конструкцию: async.
  async (_command: string, _args?: unknown) => [] as string[]
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Обрабатываем конструкцию: vi.
vi.mock("@/lib/secureInvoke", () => ({
  // Обрабатываем конструкцию: secureInvoke.
  secureInvoke: (command: string, args?: unknown) => invokeMock(command, args),
  // Закрываем текущий блок.
}));
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  // Возвращаем результат: { id: gd, name: Geometry Dash, appid: 322170, platform:….
  return {
    // Обрабатываем конструкцию: id.
    id: "gd",
    // Обрабатываем конструкцию: name.
    name: "Geometry Dash",
    // Обрабатываем конструкцию: appid.
    appid: "322170",
    // Обрабатываем конструкцию: platform.
    platform: "steam",
    // Обрабатываем конструкцию: source.
    source: "steam",
    // Обрабатываем конструкцию: installPath.
    installPath: "C:\\Games\\Geometry Dash",
    // Обрабатываем конструкцию: executablePath.
    executablePath: "C:\\Games\\Geometry Dash\\GeometryDash.exe",
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
describe("useGameProcessWatch", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockClear();
    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockImplementation(async () => [] as string[]);
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().clearAll();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("снимает защёлку, когда игра завершилась", async () => {
    // Сохраняем пояснение разработчика: // Баг из жизни: игра запущена вне приложения (через Steam),…
    // Баг из жизни: игра запущена вне приложения (через Steam), карточка
    // Сохраняем пояснение разработчика: // помечена запущенной, процесс закрыт — а отметка оставалас…
    // помечена запущенной, процесс закрыт — а отметка оставалась навсегда.
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunningByPath("gd");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockImplementation(async () => []);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: renderHook.
    renderHook(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: useGameProcessWatch.
        useGameProcessWatch([
          // Обрабатываем конструкцию: game.
          game({
            // Обрабатываем конструкцию: id.
            id: "gd",
            // Обрабатываем конструкцию: executablePath.
            executablePath: "C:\\Games\\Geometry Dash\\GeometryDash.exe",
            // Закрываем текущий блок.
          }),
          // Закрываем массив или список.
        ])
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(useGameRuntimeSt….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(useGameRuntimeStore.getState().isRunning("gd")).toBe(false);
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ставит защёлку, пока процесс игры виден в системе", async () => {
    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockImplementation(async () => [
      // Обрабатываем конструкцию: c:\\games\\geometry dash\\geometrydash.exe.
      "c:\\games\\geometry dash\\geometrydash.exe",
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: renderHook.
    renderHook(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: useGameProcessWatch.
        useGameProcessWatch([
          // Обрабатываем конструкцию: game.
          game({
            // Обрабатываем конструкцию: id.
            id: "gd",
            // Обрабатываем конструкцию: executablePath.
            executablePath: "C:\\Games\\Geometry Dash\\GeometryDash.exe",
            // Закрываем текущий блок.
          }),
          // Закрываем массив или список.
        ])
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { expect(useGameRuntimeSt….
    await waitFor(() => {
      // Обрабатываем конструкцию: expect.
      expect(useGameRuntimeStore.getState().isRunning("gd")).toBe(true);
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не трогает отметки других игр", async () => {
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunningByPath("gd");
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunningByPath("portal");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: invokeMock.
    invokeMock.mockImplementation(async () => [
      // Обрабатываем конструкцию: c:\\games\\geometry dash\\geometrydash.exe.
      "c:\\games\\geometry dash\\geometrydash.exe",
      // Закрываем массив или список.
    ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: renderHook.
    renderHook(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: useGameProcessWatch.
        useGameProcessWatch([
          // Обрабатываем конструкцию: game.
          game({
            // Обрабатываем конструкцию: id.
            id: "gd",
            // Обрабатываем конструкцию: executablePath.
            executablePath: "C:\\Games\\Geometry Dash\\GeometryDash.exe",
            // Закрываем текущий блок.
          }),
          // Обрабатываем конструкцию: game.
          game({
            // Обрабатываем конструкцию: id.
            id: "portal",
            // Обрабатываем конструкцию: executablePath.
            executablePath: "C:\\Games\\Portal\\portal2.exe",
            // Закрываем текущий блок.
          }),
          // Закрываем массив или список.
        ])
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Ожидаем завершение асинхронной операции await waitFor(() => { // Portal не найден в с….
    await waitFor(() => {
      // Сохраняем пояснение разработчика: // Portal не найден в списке процессов — его защёлка снята;
      // Portal не найден в списке процессов — его защёлка снята;
      // Обрабатываем конструкцию: const state = useGameRuntimeStore.getState().
      const state = useGameRuntimeStore.getState();
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: expect.
      expect(state.runningByPath["portal"]).toBeUndefined();
      // Сохраняем пояснение разработчика: // Geometry Dash ещё работает — его оставили.
      // Geometry Dash ещё работает — его оставили.
      // Обрабатываем конструкцию: expect.
      expect(state.runningByPath["gd"]).toBe(true);
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
