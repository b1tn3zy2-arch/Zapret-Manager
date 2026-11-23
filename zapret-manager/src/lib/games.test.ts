// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/defaultGames.
import { BUILTIN_GAMES, getDefaultGames } from "@/lib/defaultGames";
// Импортируем зависимости из модуля @/lib/gameUtils.
import {
  // Подключаем именованный импорт countFilled.
  countFilled,
  // Подключаем именованный импорт coverHueFromName.
  coverHueFromName,
  // Подключаем именованный импорт enabledGames.
  enabledGames,
  // Подключаем именованный импорт formatGameStats.
  formatGameStats,
  // Подключаем именованный импорт generateGameId.
  generateGameId,
  // Подключаем именованный импорт gameHasEntries.
  gameHasEntries,
  // Подключаем именованный импорт slugifyGameName.
  slugifyGameName,
  // Закрываем текущий блок.
} from "@/lib/gameUtils";
// Импортируем зависимости из модуля @/lib/gameFile.
import { buildGameFile, parseGameFile } from "@/lib/gameFile";
// Импортируем зависимости из модуля @/lib/gameValidation.
import { isValidDomain, isValidIpRange } from "@/lib/gameValidation";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию custom.
function custom(patch: Partial<GameSettings> = {}): GameSettings {
  // Возвращаем результат: { id: custom, name: Моя игра, icon: Gamepad2, enabled: ….
  return {
    // Обрабатываем конструкцию: id.
    id: "custom",
    // Обрабатываем конструкцию: name.
    name: "Моя игра",
    // Обрабатываем конструкцию: icon.
    icon: "Gamepad2",
    // Обрабатываем конструкцию: enabled.
    enabled: false,
    // Обрабатываем конструкцию: builtin.
    builtin: false,
    // Обрабатываем конструкцию: domains.
    domains: ["example.com"],
    // Обрабатываем конструкцию: ipRanges.
    ipRanges: [],
    // Обрабатываем конструкцию: ports.
    ports: [27015],
    // Обрабатываем конструкцию: autoRestore.
    autoRestore: true,
    // Обрабатываем конструкцию: createBackup.
    createBackup: true,
    // Обрабатываем конструкцию: createdAt.
    createdAt: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("встроенные игры", () => {
  // Обрабатываем конструкцию: it.
  it("содержат Outlast Trials с приоритетом и builtin", () => {
    // Обрабатываем конструкцию: const outlast = BUILTIN_GAMES.find((game) => game.id ==….
    const outlast = BUILTIN_GAMES.find((game) => game.id === "outlast-trials");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(outlast).toBeDefined();
    // Обрабатываем конструкцию: expect.
    expect(outlast?.builtin).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("выключены по умолчанию", () => {
    // Обрабатываем конструкцию: expect.
    expect(BUILTIN_GAMES.every((game) => game.enabled === false)).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("имеют уникальные id", () => {
    // Обрабатываем конструкцию: const ids = BUILTIN_GAMES.map((game) => game.id).
    const ids = BUILTIN_GAMES.map((game) => game.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(new Set(ids).size).toBe(ids.length);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращают глубокую копию", () => {
    // Обрабатываем конструкцию: const first = getDefaultGames().
    const first = getDefaultGames();
    // Обрабатываем конструкцию: const second = getDefaultGames().
    const second = getDefaultGames();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: first.
    first[0]?.domains.push("mutated.example");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(second[0]?.domains).not.toContain("mutated.example");
    // Обрабатываем конструкцию: expect.
    expect(BUILTIN_GAMES[0]?.domains).not.toContain("mutated.example");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("slugifyGameName", () => {
  // Обрабатываем конструкцию: it.
  it("превращает название в слаг", () => {
    // Обрабатываем конструкцию: expect.
    expect(slugifyGameName("My Game")).toBe("my-game");
    // Обрабатываем конструкцию: expect.
    expect(slugifyGameName("  Counter-Strike 2  ")).toBe("counter-strike-2");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("подставляет заглушку для пустого названия", () => {
    // Обрабатываем конструкцию: expect.
    expect(slugifyGameName("")).toBe("game");
    // Обрабатываем конструкцию: expect.
    expect(slugifyGameName("!!!")).toBe("game");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("generateGameId", () => {
  // Обрабатываем конструкцию: it.
  it("возвращает слаг, если он свободен", () => {
    // Обрабатываем конструкцию: expect.
    expect(generateGameId("Dota 2", [])).toBe("dota-2");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("добавляет суффикс при конфликте", () => {
    // Обрабатываем конструкцию: expect.
    expect(generateGameId("Dota 2", ["dota-2"])).toBe("dota-2-2");
    // Обрабатываем конструкцию: expect.
    expect(generateGameId("Dota 2", ["dota-2", "dota-2-2"])).toBe("dota-2-3");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatGameStats", () => {
  // Обрабатываем конструкцию: it.
  it("считает только заполненные значения", () => {
    // Обрабатываем конструкцию: const stats = formatGameStats( custom({ domains: [a.com….
    const stats = formatGameStats(
      // Обрабатываем конструкцию: custom.
      custom({ domains: ["a.com", "", "b.com"], ipRanges: ["1.2.3.0/24"] })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(stats).toBe("2 домена · 1 IP · 1 порт");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("различает окончания", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatGameStats(custom({ domains: [] }))).toContain("0 доменов");
    // Обрабатываем конструкцию: expect.
    expect(formatGameStats(custom({ domains: ["a.com"] }))).toContain(
      // Обрабатываем конструкцию: 1 домен.
      "1 домен"
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: formatGameStats.
      formatGameStats(custom({ domains: ["a.com", "b.com", "c.com"] }))
      // Закрываем выражение или список аргументов.
    ).toContain("3 домена");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: formatGameStats.
      formatGameStats(custom({ domains: ["a.com", "b.com", "c.com", "d.com"] }))
      // Закрываем выражение или список аргументов.
    ).toContain("4 домена");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: formatGameStats.
      formatGameStats(
        // Обрабатываем конструкцию: custom.
        custom({
          // Обрабатываем конструкцию: domains.
          domains: Array.from({ length: 11 }, (_, i) => `d${i}.com`),
          // Закрываем текущий блок.
        })
        // Закрываем выражение или список аргументов.
      )
      // Закрываем выражение или список аргументов.
    ).toContain("11 доменов");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: formatGameStats.
      formatGameStats(custom({ domains: ["a.com"], ports: [1, 2, 3, 4, 5] }))
      // Закрываем выражение или список аргументов.
    ).toContain("5 портов");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("enabledGames", () => {
  // Обрабатываем конструкцию: it.
  it("оставляет только включённые игры с записями", () => {
    // Обрабатываем конструкцию: const list = [ custom({ id: a, enabled: true }), custom….
    const list = [
      // Обрабатываем конструкцию: custom.
      custom({ id: "a", enabled: true }),
      // Обрабатываем конструкцию: custom.
      custom({ id: "b", enabled: false }),
      // Обрабатываем конструкцию: custom.
      custom({ id: "c", enabled: true, domains: [] }),
      // Обрабатываем конструкцию: custom.
      custom({ id: "d", enabled: true, ipRanges: ["1.2.3.0/24"], domains: [] }),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(enabledGames(list).map((game) => game.id)).toEqual(["a", "d"]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("gameHasEntries", () => {
  // Обрабатываем конструкцию: it.
  it("учитывает домены и диапазоны", () => {
    // Обрабатываем конструкцию: expect.
    expect(gameHasEntries(custom({ domains: [""], ipRanges: [] }))).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: gameHasEntries.
      gameHasEntries(custom({ domains: [], ipRanges: ["1.2.3.0/24"] }))
      // Закрываем выражение или список аргументов.
    ).toBe(true);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("countFilled", () => {
  // Обрабатываем конструкцию: it.
  it("не считает пустые строки", () => {
    // Обрабатываем конструкцию: expect.
    expect(countFilled(["a", "  ", "b"])).toBe(2);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidDomain", () => {
  // Обрабатываем конструкцию: it.
  it("принимает обычные домены", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("steampowered.com")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("a-b.example.co.uk")).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет мусор", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("не домен")).not.toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("example")).not.toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пропускает пустое значение", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidDomain("")).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("isValidIpRange", () => {
  // Обрабатываем конструкцию: it.
  it("принимает CIDR", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("203.0.113.0/24")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("0.0.0.0/0")).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет неверный префикс", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("203.0.113.0/33")).not.toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("203.0.113.0")).not.toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет неверный адрес", () => {
    // Обрабатываем конструкцию: expect.
    expect(isValidIpRange("300.0.113.0/24")).not.toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("файл игры", () => {
  // Обрабатываем конструкцию: it.
  it("строит и разбирает файл без потерь", () => {
    // Обрабатываем конструкцию: const game = custom({ domains: [a.com, b.com], ipRanges….
    const game = custom({
      // Обрабатываем конструкцию: domains.
      domains: ["a.com", "b.com"],
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: ["1.2.3.0/24"],
      // Обрабатываем конструкцию: ports.
      ports: [27015, 27016],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const file = buildGameFile(game).
    const file = buildGameFile(game);
    // Обрабатываем конструкцию: const parsed = parseGameFile(JSON.stringify(file)).
    const parsed = parseGameFile(JSON.stringify(file));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: name.
      name: game.name,
      // Обрабатываем конструкцию: domains.
      domains: ["a.com", "b.com"],
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: ["1.2.3.0/24"],
      // Обрабатываем конструкцию: ports.
      ports: [27015, 27016],
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает null на мусоре", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseGameFile("не json")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(parseGameFile("{}")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(parseGameFile('{"game":{"name":"","domains":[]}}')).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отбрасывает значения неверного типа", () => {
    // Обрабатываем конструкцию: const parsed = parseGameFile( {game:{name:X,domains:[1,….
    const parsed = parseGameFile(
      // Обрабатываем конструкцию: {game:{name:X,domains:[1,a.com],ports:[x,27015,99999]}}.
      '{"game":{"name":"X","domains":[1,"a.com"],"ports":["x",27015,99999]}}'
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: name.
      name: "X",
      // Обрабатываем конструкцию: domains.
      domains: ["a.com"],
      // Обрабатываем конструкцию: ipRanges.
      ipRanges: [],
      // Обрабатываем конструкцию: ports.
      ports: [27015],
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("цвет запасной обложки игры", () => {
  // Обрабатываем конструкцию: it.
  it("стабилен для одного и того же названия", () => {
    // Обрабатываем конструкцию: expect.
    expect(coverHueFromName("Portal 2")).toBe(coverHueFromName("Portal 2"));
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("даёт разные оттенки для разных игр", () => {
    // Обрабатываем конструкцию: expect.
    expect(coverHueFromName("Portal 2")).not.toBe(coverHueFromName("Doom"));
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("всегда попадает в круг оттенков", () => {
    // Перебираем элементы коллекции [A, Outlast Trials, The Long Dark, ].
    for (const name of ["A", "Outlast Trials", "The Long Dark", ""]) {
      // Обрабатываем конструкцию: const hue = coverHueFromName(name).
      const hue = coverHueFromName(name);
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: expect.
      expect(hue).toBeGreaterThanOrEqual(0);
      // Обрабатываем конструкцию: expect.
      expect(hue).toBeLessThan(360);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
