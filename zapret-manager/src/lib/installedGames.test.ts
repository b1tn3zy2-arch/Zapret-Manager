import { describe, expect, it } from "vitest";

import {
  gameBypass,
  isBypassEnabled,
  manualGame,
  mergeScannedGames,
  PLATFORM_LABEL_KEYS,
  SOURCE_LABEL_KEYS,
  usesAnticheat,
} from "@/lib/installedGames";
import { getDefaultGames } from "@/lib/defaultGames";
import type { InstalledGame } from "@/types";

function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  return {
    id: "steam-portal",
    name: "Portal",
    appid: "620",
    platform: "steam",
    source: "steam",
    installPath: "D:\\Steam\\Portal",
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    anticheat: "none",
    launchCount: 0,
    ...patch,
  };
}

describe("mergeScannedGames", () => {
  it("переносит счётчик и дату запуска из прошлого скана", () => {
    const previous = game({ lastLaunchedAt: 100, launchCount: 3 });
    const merged = mergeScannedGames([game()], [previous]);

    expect(merged[0]?.launchCount).toBe(3);
    expect(merged[0]?.lastLaunchedAt).toBe(100);
  });

  it("оставляет ручные игры, которых не нашлось на диске", () => {
    const manual = game({ id: "manual-x", manual: true });

    expect(mergeScannedGames([], [manual])).toHaveLength(1);
  });

  it("схлопывает дубли по пути к exe в разном регистре", () => {
    const first = game({ id: "a", source: "knownFolder" });
    const second = game({
      id: "b",
      platform: "custom",
      source: "userFolder",
      executablePath: "d:\\steam\\portal\\PORTAL.EXE",
    });
    const merged = mergeScannedGames([first, second], []);

    expect(merged).toHaveLength(1);
  });

  it("сортирует игры по названию", () => {
    const merged = mergeScannedGames(
      [
        game({
          name: "Zeta",
          appid: "1",
          executablePath: "D:\\Games\\zeta.exe",
        }),
        game({
          id: "x",
          name: "Alpha",
          appid: "2",
          executablePath: "D:\\Games\\alpha.exe",
        }),
      ],
      []
    );

    expect(merged.map((item) => item.name)).toEqual(["Alpha", "Zeta"]);
  });
});

describe("обход игры", () => {
  it("находит настройки по domainSettingsId", () => {
    const settings = getDefaultGames();

    expect(
      gameBypass(game({ gameSettingsId: "outlast-trials" }), settings)?.id
    ).toBe("outlast-trials");
  });

  it("возвращает false, если настройка выключена", () => {
    const settings = getDefaultGames();

    expect(
      isBypassEnabled(game({ gameSettingsId: "outlast-trials" }), settings)
    ).toBe(false);
  });

  it("возвращает true, если настройка включена", () => {
    const settings = getDefaultGames().map((item) => ({
      ...item,
      enabled: item.id === "outlast-trials",
    }));

    expect(
      isBypassEnabled(game({ gameSettingsId: "outlast-trials" }), settings)
    ).toBe(true);
  });
});

describe("античит", () => {
  it("определяет battleye и eac", () => {
    expect(usesAnticheat(game({ anticheat: "battleye" }))).toBe(true);
    expect(usesAnticheat(game({ anticheat: "eac" }))).toBe(true);
    expect(usesAnticheat(game({ anticheat: "none" }))).toBe(false);
    expect(usesAnticheat(game())).toBe(false);
  });
});

describe("ручное добавление", () => {
  it("строит игру из пути", () => {
    const created = manualGame("Моя игра", "C:\\Games\\My\\my.exe", "custom");

    expect(created.installPath).toBe("C:\\Games\\My");
    expect(created.manual).toBe(true);
    expect(created.id.startsWith("manual-")).toBe(true);
  });

  it("использует имя папки, если название пустое", () => {
    expect(
      manualGame("   ", "C:\\Games\\Portal\\portal.exe", "custom").name
    ).toBe("Portal");
  });
});

describe("ключи локализации", () => {
  it("покрывает все платформы и источники", () => {
    expect(Object.keys(PLATFORM_LABEL_KEYS)).toHaveLength(9);
    expect(Object.keys(SOURCE_LABEL_KEYS)).toHaveLength(10);
  });
});
