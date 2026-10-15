import { describe, expect, it } from "vitest";

import {
  getDefaultGames,
  mergeBuiltinGame,
  mergeBuiltinGames,
} from "@/lib/defaultGames";
import { MAX_GAMES } from "@/lib/settingsLimits";
import { validateSettings } from "@/lib/settingsSchema";
import type { GameSettings } from "@/types";

const outlast = getDefaultGames().find(
  (game) => game.id === "outlast-trials"
) as GameSettings;

describe("mergeBuiltinGame", () => {
  it("добавляет новые порты из встроенных настроек", () => {
    const stored: GameSettings = { ...outlast, ports: [27015, 3478] };
    const merged = mergeBuiltinGame(stored);

    expect(merged.ports).toContain(7795);
    expect(merged.ports).toContain(7830);
    expect(merged.ports.length).toBeGreaterThan(stored.ports.length);
  });

  it("сохраняет пользовательские домены и добавляет встроенные", () => {
    const stored: GameSettings = {
      ...outlast,
      domains: ["my-custom.example"],
    };
    const merged = mergeBuiltinGame(stored);

    expect(merged.domains).toContain("my-custom.example");
    expect(merged.domains).toContain("rbg-services.com");
  });

  it("не трогает игры без встроенного пресета", () => {
    const custom: GameSettings = { ...outlast, id: "custom-game" };

    expect(mergeBuiltinGame(custom)).toBe(custom);
  });

  it("не меняет пользовательские флаги игры", () => {
    const stored: GameSettings = {
      ...outlast,
      enabled: true,
      autoRestore: false,
      createBackup: false,
    };
    const merged = mergeBuiltinGame(stored);

    expect(merged.enabled).toBe(true);
    expect(merged.autoRestore).toBe(false);
    expect(merged.createBackup).toBe(false);
  });

  it("возвращает встроенный домен, удалённый пользователем", () => {
    const stored: GameSettings = {
      ...outlast,
      domains: outlast.domains.filter(
        (domain) => domain !== "rbg-services.com"
      ),
    };

    expect(mergeBuiltinGame(stored).domains).toContain("rbg-services.com");
  });
});

describe("mergeBuiltinGames", () => {
  it("добавляет встроенные игры, которых нет в файле", () => {
    const merged = mergeBuiltinGames([
      { ...outlast, enabled: true },
      { ...outlast, id: "custom-game", builtin: false },
    ]);
    const ids = merged.map((game) => game.id);

    expect(ids).toContain("outlast-trials");
    expect(ids).toContain("custom-game");
    expect(ids).toContain("escape-from-tarkov");
    expect(
      merged.find((game) => game.id === "escape-from-tarkov")?.enabled
    ).toBe(false);
    expect(merged.find((game) => game.id === "outlast-trials")?.enabled).toBe(
      true
    );
  });

  it("не превышает лимит игр", () => {
    const many: GameSettings[] = Array.from(
      { length: MAX_GAMES },
      (_, index) => ({
        ...outlast,
        id: `custom-${index}`,
        builtin: false,
      })
    );
    const merged = mergeBuiltinGames(many);

    expect(merged.length).toBe(MAX_GAMES);
  });

  it("не добавляет дубликаты встроенных игр", () => {
    const merged = mergeBuiltinGames(getDefaultGames());
    const ids = merged.map((game) => game.id);

    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("устаревшая копия игры в settings.json", () => {
  // Реальный случай: файл сохранён до появления rbg-services.com и
  // диапазона GameLift, из-за чего обход не покрывал трафик Outlast.
  const stale = {
    ...outlast,
    enabled: false,
    domains: ["steampowered.com"],
    ports: [27015, 27016],
  };

  it("дополняется доменом и портами GameLift при валидации", () => {
    const settings = validateSettings({ games: [stale] });
    const game = settings.games.find((item) => item.id === "outlast-trials");

    expect(game?.domains).toContain("rbg-services.com");
    expect(game?.ports).toContain(7777);
    expect(game?.ports).toContain(7830);
    expect(game?.enabled).toBe(false);
  });

  it("идентичен дефолтам, когда в файле была полная копия", () => {
    const settings = validateSettings({ games: [stale] });
    const defaults = getDefaultGames().find(
      (item) => item.id === "outlast-trials"
    );

    expect(settings.games.find((item) => item.id === "outlast-trials")).toEqual(
      defaults
    );
  });
});
