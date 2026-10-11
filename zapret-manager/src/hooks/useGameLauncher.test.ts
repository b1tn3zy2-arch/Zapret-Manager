import { describe, expect, it } from "vitest";

import { pickStrategy } from "@/hooks/useGameLauncher";
import type { Strategy } from "@/types";

function strategy(patch: Partial<Strategy>): Strategy {
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

describe("выбор стратегии для запуска игры", () => {
  it("берёт последнюю использованную", () => {
    const strategies = [
      strategy({ id: "a" }),
      strategy({ id: "b" }),
      strategy({ id: "c" }),
    ];

    expect(pickStrategy(strategies, "c")?.id).toBe("c");
  });

  it("падает на первую рабочую, если последней нет", () => {
    const strategies = [strategy({ id: "a" }), strategy({ id: "b" })];

    expect(pickStrategy(strategies, "missing")?.id).toBe("a");
  });

  it("возвращает undefined, когда стратегий нет", () => {
    expect(pickStrategy([], "a")).toBeUndefined();
  });
});
