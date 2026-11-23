// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useGameRuntimeStore.
import { useGameRuntimeStore } from "@/stores/useGameRuntimeStore";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useGameRuntimeStore: защёлка «запущена вне приложения»", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().clearAll();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("markRunningByPath помечает игру запущенной", () => {
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunningByPath("gd");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useGameRuntimeStore.getState().
    const state = useGameRuntimeStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.isRunning("gd")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(state.runningByPath["gd"]).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("clearRunningByPath снимает защёлку", () => {
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().markRunningByPath("gd");
    // Обрабатываем конструкцию: useGameRuntimeStore.
    useGameRuntimeStore.getState().clearRunningByPath("gd");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useGameRuntimeStore.getState().
    const state = useGameRuntimeStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.isRunning("gd")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(state.runningByPath["gd"]).toBeUndefined();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("clearRunningByPath по неизвестной игре — пустая операция", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: useGameRuntimeStore.
        useGameRuntimeStore.getState().clearRunningByPath("none")
      // Закрываем выражение или список аргументов.
    ).not.toThrow();
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: useGameRuntimeStore.
      useGameRuntimeStore.getState().runningByPath["none"]
      // Закрываем выражение или список аргументов.
    ).toBeUndefined();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("markStopped снимает и защёлку, и дерево процессов", () => {
    // Обрабатываем конструкцию: const store = useGameRuntimeStore.getState().
    const store = useGameRuntimeStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.markRunningByPath("gd");
    // Обрабатываем конструкцию: store.
    store.markRunning("gd", [101, 102]);
    // Сохраняем пояснение разработчика: // Повторный запуск через приложение затирает защёлку пути.
    // Повторный запуск через приложение затирает защёлку пути.
    // Обрабатываем конструкцию: expect.
    expect(store.runningByPath["gd"]).toBeUndefined();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: store.
    store.markStopped("gd");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(store.isRunning("gd")).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(store.pidsOf("gd")).toEqual([]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
