import { beforeEach, describe, expect, it } from "vitest";

import { useStrategiesStore } from "@/stores/useStrategiesStore";
import {
  selectActiveStrategy,
  selectRunningStrategies,
  selectStrategies,
  selectStrategiesByService,
  selectStrategyById,
} from "@/stores/useStrategiesStore";
import type { Strategy } from "@/types";

function makeStrategy(overrides: Partial<Strategy> = {}): Strategy {
  return {
    id: "st_1",
    name: "General ALT",
    filename: "general-alt.bat",
    path: "C:\\zapret\\general-alt.bat",
    description: "Базовая",
    services: ["discord", "youtube"],
    techniques: ["faketls"],
    fileType: "zapret",
    status: "idle",
    size: 2_048,
    modifiedAt: 1_700_000_000_000,
    ...overrides,
  };
}

describe("useStrategiesStore: мутации", () => {
  beforeEach(() => {
    useStrategiesStore.getState().clearAll();
  });

  it("добавляет стратегию с новым id", () => {
    const id = useStrategiesStore.getState().addStrategy({
      name: "Новая",
      filename: "new.bat",
      path: "C:\\new.bat",
      description: "Новая",
      services: ["discord"],
      techniques: [],
      fileType: "zapret",
      size: 1,
      modifiedAt: 0,
    });

    const [strategy] = selectStrategies(useStrategiesStore.getState());

    expect(id).toBeTypeOf("string");
    expect(strategy?.id).toBe(id);
    expect(strategy?.status).toBe("idle");
  });

  it("обновляет стратегию по id", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().updateStrategy("st_1", { name: "Новое имя" });

    expect(
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.name
    ).toBe("Новое имя");
  });

  it("удаляет стратегию и сбрасывает активную", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().setActiveStrategy("st_1");
    useStrategiesStore.getState().removeStrategy("st_1");

    expect(selectStrategies(useStrategiesStore.getState())).toHaveLength(0);
    expect(useStrategiesStore.getState().activeStrategyId).toBeNull();
  });

  it("пересканирование сохраняет статус запущенной стратегии", () => {
    useStrategiesStore
      .getState()
      .setStrategies([makeStrategy({ status: "running", pid: 42 })]);
    useStrategiesStore
      .getState()
      .setStrategies([makeStrategy({ filename: "general-alt-2.bat" })]);

    const [strategy] = selectStrategies(useStrategiesStore.getState());

    expect(strategy?.status).toBe("running");
    expect(strategy?.pid).toBe(42);
    expect(strategy?.filename).toBe("general-alt-2.bat");
  });

  it("пересканирование сбрасывает активную стратегию, если её нет", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().setActiveStrategy("st_1");
    useStrategiesStore.getState().setStrategies([]);

    expect(useStrategiesStore.getState().activeStrategyId).toBeNull();
  });

  it("активная стратегия сбрасывает статус у других", () => {
    useStrategiesStore
      .getState()
      .setStrategies([
        makeStrategy({ id: "st_1", status: "running" }),
        makeStrategy({ id: "st_2" }),
      ]);
    useStrategiesStore.getState().setActiveStrategy("st_2");

    expect(
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.status
    ).toBe("stopped");
    expect(selectActiveStrategy(useStrategiesStore.getState())?.id).toBe(
      "st_2"
    );
  });

  it("снятие активной стратегии переводит её в stopped", () => {
    useStrategiesStore
      .getState()
      .setStrategies([makeStrategy({ id: "st_1", status: "running" })]);
    useStrategiesStore.getState().setActiveStrategy(null);

    expect(selectRunningStrategies(useStrategiesStore.getState())).toHaveLength(
      0
    );
  });

  it("setStatus проставляет время запуска и чистит ошибку", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().setError("st_1", "сбой");
    useStrategiesStore.getState().setStatus("st_1", "running");

    const strategy = selectStrategyById(useStrategiesStore.getState(), "st_1");

    expect(strategy?.status).toBe("running");
    expect(strategy?.error).toBeUndefined();
    expect(strategy?.lastRun).toBeTypeOf("number");
  });

  it("setError переводит стратегию в статус ошибки", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().setError("st_1", "сбой");

    expect(
      selectStrategyById(useStrategiesStore.getState(), "st_1")?.status
    ).toBe("error");
  });

  it("setPid сохраняет pid процесса", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().setPid("st_1", 4242);

    expect(selectStrategyById(useStrategiesStore.getState(), "st_1")?.pid).toBe(
      4242
    );
  });

  it("фильтрует стратегии по сервису", () => {
    useStrategiesStore
      .getState()
      .setStrategies([
        makeStrategy({ id: "st_1", services: ["discord"] }),
        makeStrategy({ id: "st_2", services: ["youtube"] }),
      ]);

    expect(
      selectStrategiesByService(useStrategiesStore.getState(), "youtube")
    ).toHaveLength(1);
  });

  it("управляет флагом загрузки и ошибкой скана", () => {
    useStrategiesStore.getState().setLoading(true);
    useStrategiesStore.getState().setScanError("папка не найдена");

    expect(useStrategiesStore.getState().loading).toBe(true);
    expect(useStrategiesStore.getState().error).toBe("папка не найдена");

    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    expect(useStrategiesStore.getState().error).toBeNull();
  });

  it("clearAll сбрасывает состояние", () => {
    useStrategiesStore.getState().setStrategies([makeStrategy()]);
    useStrategiesStore.getState().clearAll();

    const state = useStrategiesStore.getState();

    expect(state.strategies).toEqual([]);
    expect(state.lastScanAt).toBeNull();
    expect(state.error).toBeNull();
  });
});
