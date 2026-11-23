// Импортируем зависимости из модуля vitest.
import { beforeEach, describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/hooks/useGameLauncher.
import { pickStrategy } from "@/hooks/useGameLauncher";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/stores/useToastsStore.
import { useToastsStore } from "@/stores/useToastsStore";
// Импортируем зависимости из модуля @/stores/mocks/strategies.
import { MOCK_STRATEGIES } from "@/stores/mocks/strategies";
// Импортируем зависимости из модуля @/types.
import type { Strategy, StrategyRatingRecord } from "@/types";
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

// Обрабатываем конструкцию: describe.
describe("тосты приложения", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useToastsStore.
    useToastsStore.getState().clear();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет уведомление", () => {
    // Обрабатываем конструкцию: useToastsStore.
    useToastsStore.getState().push("success", "Заголовок", "Текст");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const [toast] = useToastsStore.getState().toasts.
    const [toast] = useToastsStore.getState().toasts;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(toast?.title).toBe("Заголовок");
    // Обрабатываем конструкцию: expect.
    expect(toast?.kind).toBe("success");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ограничивает количество тостов", () => {
    // Запускаем цикл с инициализацией, условием и шагом.
    for (let index = 0; index < 8; index += 1) {
      // Обрабатываем конструкцию: useToastsStore.
      useToastsStore.getState().push("info", `Тост ${index}`, "");
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useToastsStore.getState().toasts.length).toBeLessThanOrEqual(4);
    // Обрабатываем конструкцию: expect.
    expect(useToastsStore.getState().toasts.at(-1)?.title).toBe("Тост 7");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("закрывает тост по id", () => {
    // Обрабатываем конструкцию: useToastsStore.
    useToastsStore.getState().push("info", "Один", "");
    // Обрабатываем конструкцию: const id = useToastsStore.getState().toasts[0]?.id ?? 0.
    const id = useToastsStore.getState().toasts[0]?.id ?? 0;
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useToastsStore.
    useToastsStore.getState().dismiss(id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(useToastsStore.getState().toasts).toHaveLength(0);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("выбор стратегии для игры", () => {
  // Обрабатываем конструкцию: beforeEach.
  beforeEach(() => {
    // Обрабатываем конструкцию: useStrategyRatingStore.
    useStrategyRatingStore.getState().clear();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("падает на последнюю, если замеров нет", () => {
    // Обрабатываем конструкцию: const strategies = [strategy({ id: a }), strategy({ id:….
    const strategies = [strategy({ id: "a" }), strategy({ id: "b" })];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, "b")?.id).toBe("b");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("предпочитает стратегию с лучшим рейтингом", () => {
    // Обрабатываем конструкцию: const rating = (id: string, score: number): StrategyRat….
    const rating = (id: string, score: number): StrategyRatingRecord => ({
      // Обрабатываем конструкцию: strategyId.
      strategyId: id,
      // Обрабатываем конструкцию: strategyHash.
      strategyHash: "hash",
      // Обрабатываем конструкцию: networkKey.
      networkKey: "network",
      // Обрабатываем конструкцию: providerLabel.
      providerLabel: null,
      // Обрабатываем конструкцию: machineKey.
      machineKey: "machine",
      // Обрабатываем конструкцию: samples.
      samples: 2,
      // Обрабатываем конструкцию: ratingScore.
      ratingScore: score,
      // Обрабатываем конструкцию: coverage.
      coverage: 1,
      // Обрабатываем конструкцию: successRate.
      successRate: 1,
      // Обрабатываем конструкцию: medianLatencyMs.
      medianLatencyMs: 100,
      // Обрабатываем конструкцию: jitterMs.
      jitterMs: 10,
      // Обрабатываем конструкцию: lastMeasuredAt.
      lastMeasuredAt: 1,
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useStrategyRatingStore.
    useStrategyRatingStore.setState({
      // Обрабатываем конструкцию: records.
      records: {
        // Обрабатываем конструкцию: slow.
        slow: rating("slow", 40),
        // Обрабатываем конструкцию: fast.
        fast: rating("fast", 88),
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const strategies = [strategy({ id: slow }), strategy({ ….
    const strategies = [strategy({ id: "slow" }), strategy({ id: "fast" })];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, "slow")?.id).toBe("fast");
    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, null)?.id).toBe("fast");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пропускает стратегии с ошибкой", () => {
    // Обрабатываем конструкцию: const strategies = [ strategy({ id: broken, error: сбой….
    const strategies = [
      // Обрабатываем конструкцию: strategy.
      strategy({ id: "broken", error: "сбой" }),
      // Обрабатываем конструкцию: strategy.
      strategy({ id: "ok" }),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(pickStrategy(strategies, "broken")?.id).toBe("ok");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает undefined для пустого списка", () => {
    // Обрабатываем конструкцию: expect.
    expect(pickStrategy([], "a")).toBeUndefined();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("моки стратегий для тестов", () => {
  // Обрабатываем конструкцию: it.
  it("содержат уникальные идентификаторы", () => {
    // Обрабатываем конструкцию: const ids = MOCK_STRATEGIES.map((item) => item.id).
    const ids = MOCK_STRATEGIES.map((item) => item.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(new Set(ids).size).toBe(ids.length);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
