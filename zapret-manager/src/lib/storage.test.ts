import { describe, expect, it } from "vitest";

import { getDefaultGames } from "@/lib/defaultGames";
import { mergeBuiltinDefaults } from "@/lib/storage";
import type { GameSettings } from "@/types";

const outlast = getDefaultGames().find(
  (game) => game.id === "outlast-trials"
) as GameSettings;

describe("mergeBuiltinDefaults", () => {
  it("добавляет новые порты из встроенных настроек", () => {
    const stored: GameSettings = { ...outlast, ports: [27015, 3478] };
    const merged = mergeBuiltinDefaults(stored);

    expect(merged.ports).toContain(7795);
    expect(merged.ports).toContain(7830);
    expect(merged.ports.length).toBeGreaterThan(stored.ports.length);
  });

  it("сохраняет пользовательские домены и добавляет встроенные", () => {
    const stored: GameSettings = {
      ...outlast,
      domains: ["my-custom.example"],
    };
    const merged = mergeBuiltinDefaults(stored);

    expect(merged.domains).toContain("my-custom.example");
    expect(merged.domains).toContain("rbg-services.com");
  });

  it("не трогает игры без встроенного пресета", () => {
    const custom: GameSettings = { ...outlast, id: "custom-game" };

    expect(mergeBuiltinDefaults(custom)).toBe(custom);
  });
});
