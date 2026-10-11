import { beforeEach, describe, expect, it } from "vitest";

import { averageLatency } from "@/lib/bypassScore";
import { pickStrategy } from "@/hooks/useGameLauncher";
import { useBypassScoreStore } from "@/stores/useBypassScoreStore";
import { useToastsStore } from "@/stores/useToastsStore";
import { MOCK_STRATEGIES } from "@/stores/mocks/strategies";
import type { PingResult, Strategy } from "@/types";

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

function ping(patch: Partial<PingResult> = {}): PingResult {
  return { host: "discord.com", latencyMs: 30, success: true, ...patch };
}

describe("тосты приложения", () => {
  beforeEach(() => {
    useToastsStore.getState().clear();
  });

  it("добавляет уведомление", () => {
    useToastsStore.getState().push("success", "Заголовок", "Текст");

    const [toast] = useToastsStore.getState().toasts;

    expect(toast?.title).toBe("Заголовок");
    expect(toast?.kind).toBe("success");
  });

  it("ограничивает количество тостов", () => {
    for (let index = 0; index < 8; index += 1) {
      useToastsStore.getState().push("info", `Тост ${index}`, "");
    }

    expect(useToastsStore.getState().toasts.length).toBeLessThanOrEqual(4);
    expect(useToastsStore.getState().toasts.at(-1)?.title).toBe("Тост 7");
  });

  it("закрывает тост по id", () => {
    useToastsStore.getState().push("info", "Один", "");
    const id = useToastsStore.getState().toasts[0]?.id ?? 0;

    useToastsStore.getState().dismiss(id);

    expect(useToastsStore.getState().toasts).toHaveLength(0);
  });
});

describe("счёт обхода", () => {
  beforeEach(() => {
    useBypassScoreStore.getState().reset();
  });

  it("считает среднюю задержку по успешным замерам", () => {
    expect(
      averageLatency([ping({ latencyMs: 20 }), ping({ latencyMs: 40 })])
    ).toBe(30);
  });

  it("возвращает null, если успешных замеров нет", () => {
    expect(
      averageLatency([ping({ success: false, latencyMs: null })])
    ).toBeNull();
  });

  it("выбирает самый быстрый обход", () => {
    const store = useBypassScoreStore.getState();

    store.record("slow", 200, false);
    store.record("fast", 20, false);

    expect(useBypassScoreStore.getState().best(["slow", "fast"])).toBe("fast");
  });

  it("наказывает провальный запуск", () => {
    const store = useBypassScoreStore.getState();

    store.record("failed", 0, true);
    store.record("ok", 150, false);

    expect(useBypassScoreStore.getState().best(["failed", "ok"])).toBe("ok");
  });

  it("возвращает null, когда оценок нет", () => {
    expect(useBypassScoreStore.getState().best(["a", "b"])).toBeNull();
  });
});

describe("выбор стратегии для игры", () => {
  beforeEach(() => {
    useBypassScoreStore.getState().reset();
  });

  it("падает на последнюю, если оценок нет", () => {
    const strategies = [strategy({ id: "a" }), strategy({ id: "b" })];

    expect(pickStrategy(strategies, "b")?.id).toBe("b");
  });

  it("предпочитает самый быстрый обход", () => {
    useBypassScoreStore.getState().record("slow", 300, false);
    useBypassScoreStore.getState().record("fast", 25, false);

    const strategies = [strategy({ id: "slow" }), strategy({ id: "fast" })];

    expect(pickStrategy(strategies, "slow")?.id).toBe("fast");
    expect(pickStrategy(strategies, null)?.id).toBe("fast");
  });

  it("пропускает стратегии с ошибкой", () => {
    const strategies = [
      strategy({ id: "broken", error: "сбой" }),
      strategy({ id: "ok" }),
    ];

    expect(pickStrategy(strategies, "broken")?.id).toBe("ok");
  });

  it("возвращает undefined для пустого списка", () => {
    expect(pickStrategy([], "a")).toBeUndefined();
  });
});

describe("моки стратегий для тестов", () => {
  it("содержат уникальные идентификаторы", () => {
    const ids = MOCK_STRATEGIES.map((item) => item.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});
