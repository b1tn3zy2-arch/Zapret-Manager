// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import {
  // Подключаем именованный импорт selectActiveStrategy.
  selectActiveStrategy,
  // Подключаем именованный импорт selectRunningStrategies.
  selectRunningStrategies,
  // Подключаем именованный импорт selectStrategies.
  selectStrategies,
  // Подключаем именованный импорт selectStrategiesByService.
  selectStrategiesByService,
  // Подключаем именованный импорт selectStrategyById.
  selectStrategyById,
  // Закрываем текущий блок.
} from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types.
import type { Strategy } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию makeStrategy.
function makeStrategy(overrides: Partial<Strategy> = {}): Strategy {
  // Возвращаем результат: { id: st_1, name: General ALT, filename: general-alt.ba….
  return {
    // Обрабатываем конструкцию: id.
    id: "st_1",
    // Обрабатываем конструкцию: name.
    name: "General ALT",
    // Обрабатываем конструкцию: filename.
    filename: "general-alt.bat",
    // Обрабатываем конструкцию: path.
    path: "C:\\zapret\\general-alt.bat",
    // Обрабатываем конструкцию: description.
    description: "Базовая",
    // Обрабатываем конструкцию: services.
    services: ["discord", "youtube"],
    // Обрабатываем конструкцию: techniques.
    techniques: ["faketls"],
    // Обрабатываем конструкцию: fileType.
    fileType: "zapret",
    // Обрабатываем конструкцию: status.
    status: "idle",
    // Обрабатываем конструкцию: size.
    size: 2_048,
    // Обрабатываем конструкцию: modifiedAt.
    modifiedAt: 1_700_000_000_000,
    // Разворачиваем ...overrides в коллекцию.
    ...overrides,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("useStrategiesStore: мутации", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().clearAll();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет стратегию с новым id", () => {
    // Обрабатываем конструкцию: const id = useStrategiesStore.getState().addStrategy({ ….
    const id = useStrategiesStore.getState().addStrategy({
      // Обрабатываем конструкцию: name.
      name: "Новая",
      // Обрабатываем конструкцию: filename.
      filename: "new.bat",
      // Обрабатываем конструкцию: path.
      path: "C:\\new.bat",
      // Обрабатываем конструкцию: description.
      description: "Новая",
      // Обрабатываем конструкцию: services.
      services: ["discord"],
      // Обрабатываем конструкцию: techniques.
      techniques: [],
      // Обрабатываем конструкцию: fileType.
      fileType: "zapret",
      // Обрабатываем конструкцию: size.
      size: 1,
      // Обрабатываем конструкцию: modifiedAt.
      modifiedAt: 0,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const [strategy] = selectStrategies(useStrategiesStore.….
    const [strategy] = selectStrategies(useStrategiesStore.getState());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(id).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(strategy?.id).toBe(id);
    // Обрабатываем конструкцию: expect.
    expect(strategy?.status).toBe("idle");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("обновляет стратегию по id", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().updateStrategy("st_1", { name: "Новое имя" });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: selectStrategyById.
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.name
      // Закрываем выражение или список аргументов.
    ).toBe("Новое имя");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("удаляет стратегию и сбрасывает активную", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setActiveStrategy("st_1");
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().removeStrategy("st_1");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectStrategies(useStrategiesStore.getState())).toHaveLength(0);
    // Обрабатываем конструкцию: expect.
    expect(useStrategiesStore.getState().activeStrategyId).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пересканирование сохраняет статус запущенной стратегии", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .setStrategies([makeStrategy({ status: "running", pid: 42 })]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .setStrategies([makeStrategy({ filename: "general-alt-2.bat" })]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const [strategy] = selectStrategies(useStrategiesStore.….
    const [strategy] = selectStrategies(useStrategiesStore.getState());
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(strategy?.status).toBe("running");
    // Обрабатываем конструкцию: expect.
    expect(strategy?.pid).toBe(42);
    // Обрабатываем конструкцию: expect.
    expect(strategy?.filename).toBe("general-alt-2.bat");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пересканирование сбрасывает активную стратегию, если её нет", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setActiveStrategy("st_1");
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useStrategiesStore.getState().activeStrategyId).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("активная стратегия сбрасывает статус у других", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .setStrategies([
        // Обрабатываем конструкцию: makeStrategy.
        makeStrategy({ id: "st_1", status: "running" }),
        // Обрабатываем конструкцию: makeStrategy.
        makeStrategy({ id: "st_2" }),
        // Закрываем массив или список.
      ]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setActiveStrategy("st_2");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: selectStrategyById.
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.status
      // Закрываем выражение или список аргументов.
    ).toBe("stopped");
    // Обрабатываем конструкцию: expect.
    expect(selectActiveStrategy(useStrategiesStore.getState())?.id).toBe(
      // Обрабатываем конструкцию: st_2.
      "st_2"
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("снятие активной стратегии переводит её в stopped", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .setStrategies([makeStrategy({ id: "st_1", status: "running" })]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setActiveStrategy(null);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectRunningStrategies(useStrategiesStore.getState())).toHaveLength(
      // Обрабатываем конструкцию: 0.
      0
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("setStatus проставляет время запуска и чистит ошибку", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setError("st_1", "сбой");
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStatus("st_1", "running");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const strategy = selectStrategyById(useStrategiesStore.….
    const strategy = selectStrategyById(useStrategiesStore.getState(), "st_1");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(strategy?.status).toBe("running");
    // Обрабатываем конструкцию: expect.
    expect(strategy?.error).toBeUndefined();
    // Обрабатываем конструкцию: expect.
    expect(strategy?.lastRun).toBeTypeOf("number");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("setError переводит стратегию в статус ошибки", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setError("st_1", "сбой");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: selectStrategyById.
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.status
      // Закрываем выражение или список аргументов.
    ).toBe("error");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("setPid сохраняет pid процесса", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setPid("st_1", 4242);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(selectStrategyById(useStrategiesStore.getState(), "st_1")?.pid).toBe(
      // Обрабатываем конструкцию: 4242.
      4242
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("фильтрует стратегии по сервису", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .setStrategies([
        // Обрабатываем конструкцию: makeStrategy.
        makeStrategy({ id: "st_1", services: ["discord"] }),
        // Обрабатываем конструкцию: makeStrategy.
        makeStrategy({ id: "st_2", services: ["youtube"] }),
        // Закрываем массив или список.
      ]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: selectStrategiesByService.
      selectStrategiesByService(useStrategiesStore.getState(), "youtube")
      // Закрываем выражение или список аргументов.
    ).toHaveLength(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("управляет флагом загрузки и ошибкой скана", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setLoading(true);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setScanError("папка не найдена");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useStrategiesStore.getState().loading).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(useStrategiesStore.getState().error).toBe("папка не найдена");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: expect.
    expect(useStrategiesStore.getState().error).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("clearAll сбрасывает состояние", () => {
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore.getState().clearAll();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const state = useStrategiesStore.getState().
    const state = useStrategiesStore.getState();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(state.strategies).toEqual([]);
    // Обрабатываем конструкцию: expect.
    expect(state.lastScanAt).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(state.error).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
