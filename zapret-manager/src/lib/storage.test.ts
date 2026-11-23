// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/defaultGames.
import {
  // Подключаем именованный импорт getDefaultGames.
  getDefaultGames,
  // Подключаем именованный импорт mergeBuiltinGame.
  mergeBuiltinGame,
  // Подключаем именованный импорт mergeBuiltinGames.
  mergeBuiltinGames,
  // Закрываем текущий блок.
} from "@/lib/defaultGames";
// Импортируем зависимости из модуля @/lib/settingsLimits.
import { MAX_GAMES } from "@/lib/settingsLimits";
// Импортируем зависимости из модуля @/lib/settingsSchema.
import { validateSettings } from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/types.
import type { GameSettings } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const outlast = getDefaultGames().find( (game) => game.….
const outlast = getDefaultGames().find(
  // Объявляем функцию-обработчик или стрелочную функцию.
  (game) => game.id === "outlast-trials"
  // Закрываем выражение или список аргументов.
) as GameSettings;
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("mergeBuiltinGame", () => {
  // Обрабатываем конструкцию: it.
  it("добавляет новые порты из встроенных настроек", () => {
    // Обрабатываем конструкцию: const stored: GameSettings = { ...outlast, ports: [2701….
    const stored: GameSettings = { ...outlast, ports: [27015, 3478] };
    // Обрабатываем конструкцию: const merged = mergeBuiltinGame(stored).
    const merged = mergeBuiltinGame(stored);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged.ports).toContain(7795);
    // Обрабатываем конструкцию: expect.
    expect(merged.ports).toContain(7830);
    // Обрабатываем конструкцию: expect.
    expect(merged.ports.length).toBeGreaterThan(stored.ports.length);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет пользовательские домены и добавляет встроенные", () => {
    // Обрабатываем конструкцию: const stored: GameSettings = { ...outlast, domains: [my….
    const stored: GameSettings = {
      // Разворачиваем ...outlast в коллекцию.
      ...outlast,
      // Обрабатываем конструкцию: domains.
      domains: ["my-custom.example"],
      // Закрываем текущий блок.
    };
    // Обрабатываем конструкцию: const merged = mergeBuiltinGame(stored).
    const merged = mergeBuiltinGame(stored);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged.domains).toContain("my-custom.example");
    // Обрабатываем конструкцию: expect.
    expect(merged.domains).toContain("redbarrelsgames.com");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не трогает игры без встроенного пресета", () => {
    // Обрабатываем конструкцию: const custom: GameSettings = { ...outlast, id: custom-g….
    const custom: GameSettings = { ...outlast, id: "custom-game" };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mergeBuiltinGame(custom)).toBe(custom);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не меняет пользовательские флаги игры", () => {
    // Обрабатываем конструкцию: const stored: GameSettings = { ...outlast, enabled: tru….
    const stored: GameSettings = {
      // Разворачиваем ...outlast в коллекцию.
      ...outlast,
      // Обрабатываем конструкцию: enabled.
      enabled: true,
      // Обрабатываем конструкцию: autoRestore.
      autoRestore: false,
      // Обрабатываем конструкцию: createBackup.
      createBackup: false,
      // Закрываем текущий блок.
    };
    // Обрабатываем конструкцию: const merged = mergeBuiltinGame(stored).
    const merged = mergeBuiltinGame(stored);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged.enabled).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(merged.autoRestore).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(merged.createBackup).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает встроенный домен, удалённый пользователем", () => {
    // Обрабатываем конструкцию: const stored: GameSettings = { ...outlast, domains: out….
    const stored: GameSettings = {
      // Разворачиваем ...outlast в коллекцию.
      ...outlast,
      // Обрабатываем конструкцию: domains.
      domains: outlast.domains.filter(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (domain) => domain !== "redbarrelsgames.com"
        // Закрываем выражение или список аргументов.
      ),
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mergeBuiltinGame(stored).domains).toContain("redbarrelsgames.com");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("mergeBuiltinGames", () => {
  // Обрабатываем конструкцию: it.
  it("добавляет встроенные игры, которых нет в файле", () => {
    // Обрабатываем конструкцию: const merged = mergeBuiltinGames([ { ...outlast, enable….
    const merged = mergeBuiltinGames([
      // Открываем объектный литерал.
      { ...outlast, enabled: true },
      // Открываем объектный литерал.
      { ...outlast, id: "custom-game", builtin: false },
      // Закрываем массив или список.
    ]);
    // Обрабатываем конструкцию: const ids = merged.map((game) => game.id).
    const ids = merged.map((game) => game.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(ids).toContain("outlast-trials");
    // Обрабатываем конструкцию: expect.
    expect(ids).toContain("custom-game");
    // Обрабатываем конструкцию: expect.
    expect(ids).toContain("escape-from-tarkov");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: merged.
      merged.find((game) => game.id === "escape-from-tarkov")?.enabled
      // Закрываем выражение или список аргументов.
    ).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(merged.find((game) => game.id === "outlast-trials")?.enabled).toBe(
      // Обрабатываем конструкцию: true.
      true
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не превышает лимит игр", () => {
    // Обрабатываем конструкцию: const many: GameSettings[] = Array.from( { length: MAX_….
    const many: GameSettings[] = Array.from(
      // Открываем объектный литерал.
      { length: MAX_GAMES },
      // Объявляем функцию-обработчик или стрелочную функцию.
      (_, index) => ({
        // Разворачиваем ...outlast в коллекцию.
        ...outlast,
        // Обрабатываем конструкцию: id.
        id: `custom-${index}`,
        // Обрабатываем конструкцию: builtin.
        builtin: false,
        // Закрываем текущий блок.
      })
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: const merged = mergeBuiltinGames(many).
    const merged = mergeBuiltinGames(many);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged.length).toBe(MAX_GAMES);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не добавляет дубликаты встроенных игр", () => {
    // Обрабатываем конструкцию: const merged = mergeBuiltinGames(getDefaultGames()).
    const merged = mergeBuiltinGames(getDefaultGames());
    // Обрабатываем конструкцию: const ids = merged.map((game) => game.id).
    const ids = merged.map((game) => game.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(new Set(ids).size).toBe(ids.length);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("устаревшая копия игры в settings.json", () => {
  // Сохраняем пояснение разработчика: // Реальный случай: файл сохранён до появления rbg-services.…
  // Реальный случай: файл сохранён до появления rbg-services.com и
  // Сохраняем пояснение разработчика: // диапазона GameLift, из-за чего обход не покрывал трафик O…
  // диапазона GameLift, из-за чего обход не покрывал трафик Outlast.
  // Обрабатываем конструкцию: const stale = { ...outlast, enabled: false, domains: [s….
  const stale = {
    // Разворачиваем ...outlast в коллекцию.
    ...outlast,
    // Обрабатываем конструкцию: enabled.
    enabled: false,
    // Обрабатываем конструкцию: domains.
    domains: ["steampowered.com"],
    // Обрабатываем конструкцию: ports.
    ports: [27015, 27016],
    // Закрываем текущий блок.
  };
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("дополняется доменом и портами GameLift при валидации", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ games: [stale] }).
    const settings = validateSettings({ games: [stale] });
    // Обрабатываем конструкцию: const game = settings.games.find((item) => item.id === ….
    const game = settings.games.find((item) => item.id === "outlast-trials");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(game?.domains).toContain("redbarrelsgames.com");
    // Обрабатываем конструкцию: expect.
    expect(game?.ports).toContain(7777);
    // Обрабатываем конструкцию: expect.
    expect(game?.ports).toContain(7830);
    // Обрабатываем конструкцию: expect.
    expect(game?.enabled).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("идентичен дефолтам, когда в файле была полная копия", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ games: [stale] }).
    const settings = validateSettings({ games: [stale] });
    // Обрабатываем конструкцию: const defaults = getDefaultGames().find( (item) => item….
    const defaults = getDefaultGames().find(
      // Объявляем функцию-обработчик или стрелочную функцию.
      (item) => item.id === "outlast-trials"
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings.games.find((item) => item.id === "outlast-trials")).toEqual(
      // Обрабатываем конструкцию: defaults.
      defaults
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
