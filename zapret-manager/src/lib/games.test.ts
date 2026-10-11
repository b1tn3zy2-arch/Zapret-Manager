import { describe, expect, it } from "vitest";

import { BUILTIN_GAMES, getDefaultGames } from "@/lib/defaultGames";
import {
  countFilled,
  enabledGames,
  formatGameStats,
  generateGameId,
  gameHasEntries,
  slugifyGameName,
} from "@/lib/gameUtils";
import { buildGameFile, parseGameFile } from "@/lib/gameFile";
import { isValidDomain, isValidIpRange } from "@/lib/gameValidation";
import type { GameSettings } from "@/types";

function custom(patch: Partial<GameSettings> = {}): GameSettings {
  return {
    id: "custom",
    name: "Моя игра",
    icon: "Gamepad2",
    enabled: false,
    builtin: false,
    domains: ["example.com"],
    ipRanges: [],
    ports: [27015],
    autoRestore: true,
    createBackup: true,
    createdAt: 0,
    ...patch,
  };
}

describe("встроенные игры", () => {
  it("содержат Outlast Trials с приоритетом и builtin", () => {
    const outlast = BUILTIN_GAMES.find((game) => game.id === "outlast-trials");

    expect(outlast).toBeDefined();
    expect(outlast?.builtin).toBe(true);
  });

  it("выключены по умолчанию", () => {
    expect(BUILTIN_GAMES.every((game) => game.enabled === false)).toBe(true);
  });

  it("имеют уникальные id", () => {
    const ids = BUILTIN_GAMES.map((game) => game.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("возвращают глубокую копию", () => {
    const first = getDefaultGames();
    const second = getDefaultGames();

    first[0]?.domains.push("mutated.example");

    expect(second[0]?.domains).not.toContain("mutated.example");
    expect(BUILTIN_GAMES[0]?.domains).not.toContain("mutated.example");
  });
});

describe("slugifyGameName", () => {
  it("превращает название в слаг", () => {
    expect(slugifyGameName("My Game")).toBe("my-game");
    expect(slugifyGameName("  Counter-Strike 2  ")).toBe("counter-strike-2");
  });

  it("подставляет заглушку для пустого названия", () => {
    expect(slugifyGameName("")).toBe("game");
    expect(slugifyGameName("!!!")).toBe("game");
  });
});

describe("generateGameId", () => {
  it("возвращает слаг, если он свободен", () => {
    expect(generateGameId("Dota 2", [])).toBe("dota-2");
  });

  it("добавляет суффикс при конфликте", () => {
    expect(generateGameId("Dota 2", ["dota-2"])).toBe("dota-2-2");
    expect(generateGameId("Dota 2", ["dota-2", "dota-2-2"])).toBe("dota-2-3");
  });
});

describe("formatGameStats", () => {
  it("считает только заполненные значения", () => {
    const stats = formatGameStats(
      custom({ domains: ["a.com", "", "b.com"], ipRanges: ["1.2.3.0/24"] })
    );

    expect(stats).toBe("2 домена · 1 IP · 1 порт");
  });

  it("различает окончания", () => {
    expect(formatGameStats(custom({ domains: [] }))).toContain("0 доменов");
    expect(formatGameStats(custom({ domains: ["a.com"] }))).toContain(
      "1 домен"
    );
    expect(
      formatGameStats(custom({ domains: ["a.com", "b.com", "c.com"] }))
    ).toContain("3 домена");
    expect(
      formatGameStats(custom({ domains: ["a.com", "b.com", "c.com", "d.com"] }))
    ).toContain("4 домена");
    expect(
      formatGameStats(
        custom({
          domains: Array.from({ length: 11 }, (_, i) => `d${i}.com`),
        })
      )
    ).toContain("11 доменов");
    expect(
      formatGameStats(custom({ domains: ["a.com"], ports: [1, 2, 3, 4, 5] }))
    ).toContain("5 портов");
  });
});

describe("enabledGames", () => {
  it("оставляет только включённые игры с записями", () => {
    const list = [
      custom({ id: "a", enabled: true }),
      custom({ id: "b", enabled: false }),
      custom({ id: "c", enabled: true, domains: [] }),
      custom({ id: "d", enabled: true, ipRanges: ["1.2.3.0/24"], domains: [] }),
    ];

    expect(enabledGames(list).map((game) => game.id)).toEqual(["a", "d"]);
  });
});

describe("gameHasEntries", () => {
  it("учитывает домены и диапазоны", () => {
    expect(gameHasEntries(custom({ domains: [""], ipRanges: [] }))).toBe(false);
    expect(
      gameHasEntries(custom({ domains: [], ipRanges: ["1.2.3.0/24"] }))
    ).toBe(true);
  });
});

describe("countFilled", () => {
  it("не считает пустые строки", () => {
    expect(countFilled(["a", "  ", "b"])).toBe(2);
  });
});

describe("isValidDomain", () => {
  it("принимает обычные домены", () => {
    expect(isValidDomain("steampowered.com")).toBeNull();
    expect(isValidDomain("a-b.example.co.uk")).toBeNull();
  });

  it("отклоняет мусор", () => {
    expect(isValidDomain("не домен")).not.toBeNull();
    expect(isValidDomain("example")).not.toBeNull();
  });

  it("пропускает пустое значение", () => {
    expect(isValidDomain("")).toBeNull();
  });
});

describe("isValidIpRange", () => {
  it("принимает CIDR", () => {
    expect(isValidIpRange("203.0.113.0/24")).toBeNull();
    expect(isValidIpRange("0.0.0.0/0")).toBeNull();
  });

  it("отклоняет неверный префикс", () => {
    expect(isValidIpRange("203.0.113.0/33")).not.toBeNull();
    expect(isValidIpRange("203.0.113.0")).not.toBeNull();
  });

  it("отклоняет неверный адрес", () => {
    expect(isValidIpRange("300.0.113.0/24")).not.toBeNull();
  });
});

describe("файл игры", () => {
  it("строит и разбирает файл без потерь", () => {
    const game = custom({
      domains: ["a.com", "b.com"],
      ipRanges: ["1.2.3.0/24"],
      ports: [27015, 27016],
    });

    const file = buildGameFile(game);
    const parsed = parseGameFile(JSON.stringify(file));

    expect(parsed).toEqual({
      name: game.name,
      domains: ["a.com", "b.com"],
      ipRanges: ["1.2.3.0/24"],
      ports: [27015, 27016],
    });
  });

  it("возвращает null на мусоре", () => {
    expect(parseGameFile("не json")).toBeNull();
    expect(parseGameFile("{}")).toBeNull();
    expect(parseGameFile('{"game":{"name":"","domains":[]}}')).toBeNull();
  });

  it("отбрасывает значения неверного типа", () => {
    const parsed = parseGameFile(
      '{"game":{"name":"X","domains":[1,"a.com"],"ports":["x",27015,99999]}}'
    );

    expect(parsed).toEqual({
      name: "X",
      domains: ["a.com"],
      ipRanges: [],
      ports: [27015],
    });
  });
});
