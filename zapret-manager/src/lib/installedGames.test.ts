// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/installedGames.
import {
  // Подключаем именованный импорт gameBypass.
  gameBypass,
  // Подключаем именованный импорт gameIdFromPath.
  gameIdFromPath,
  // Подключаем именованный импорт isBypassEnabled.
  isBypassEnabled,
  // Подключаем именованный импорт manualGame.
  manualGame,
  // Подключаем именованный импорт mergeScannedGames.
  mergeScannedGames,
  // Подключаем именованный импорт PLATFORM_LABEL_KEYS.
  PLATFORM_LABEL_KEYS,
  // Подключаем именованный импорт SOURCE_LABEL_KEYS.
  SOURCE_LABEL_KEYS,
  // Подключаем именованный импорт usesAnticheat.
  usesAnticheat,
  // Закрываем текущий блок.
} from "@/lib/installedGames";
// Импортируем зависимости из модуля @/lib/defaultGames.
import { getDefaultGames } from "@/lib/defaultGames";
// Импортируем зависимости из модуля @/types.
import type { InstalledGame } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию game.
function game(patch: Partial<InstalledGame> = {}): InstalledGame {
  // Возвращаем результат: { id: steam-portal, name: Portal, appid: 620, platform:….
  return {
    // Обрабатываем конструкцию: id.
    id: "steam-portal",
    // Обрабатываем конструкцию: name.
    name: "Portal",
    // Обрабатываем конструкцию: appid.
    appid: "620",
    // Обрабатываем конструкцию: platform.
    platform: "steam",
    // Обрабатываем конструкцию: source.
    source: "steam",
    // Обрабатываем конструкцию: installPath.
    installPath: "D:\\Steam\\Portal",
    // Обрабатываем конструкцию: executablePath.
    executablePath: "D:\\Steam\\Portal\\portal.exe",
    // Обрабатываем конструкцию: anticheat.
    anticheat: "none",
    // Обрабатываем конструкцию: launchCount.
    launchCount: 0,
    // Разворачиваем ...patch в коллекцию.
    ...patch,
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("mergeScannedGames", () => {
  // Обрабатываем конструкцию: it.
  it("переносит счётчик и дату запуска из прошлого скана", () => {
    // Обрабатываем конструкцию: const previous = game({ lastLaunchedAt: 100, launchCoun….
    const previous = game({
      // Обрабатываем конструкцию: lastLaunchedAt.
      lastLaunchedAt: 100,
      // Обрабатываем конструкцию: launchCount.
      launchCount: 3,
      // Обрабатываем конструкцию: bypassChoice.
      bypassChoice: "plain",
      // Обрабатываем конструкцию: failedLaunchAt.
      failedLaunchAt: 555,
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: const merged = mergeScannedGames([game()], [previous]).
    const merged = mergeScannedGames([game()], [previous]);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged[0]?.launchCount).toBe(3);
    // Обрабатываем конструкцию: expect.
    expect(merged[0]?.lastLaunchedAt).toBe(100);
    // Обрабатываем конструкцию: expect.
    expect(merged[0]?.bypassChoice).toBe("plain");
    // Обрабатываем конструкцию: expect.
    expect(merged[0]?.failedLaunchAt).toBe(555);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("оставляет ручные игры, которых не нашлось на диске", () => {
    // Обрабатываем конструкцию: const manual = game({ id: manual-x, manual: true }).
    const manual = game({ id: "manual-x", manual: true });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(mergeScannedGames([], [manual])).toHaveLength(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("схлопывает дубли по пути к exe в разном регистре", () => {
    // Обрабатываем конструкцию: const first = game({ id: a, source: knownFolder }).
    const first = game({ id: "a", source: "knownFolder" });
    // Обрабатываем конструкцию: const second = game({ id: b, platform: custom, source: ….
    const second = game({
      // Обрабатываем конструкцию: id.
      id: "b",
      // Обрабатываем конструкцию: platform.
      platform: "custom",
      // Обрабатываем конструкцию: source.
      source: "userFolder",
      // Обрабатываем конструкцию: executablePath.
      executablePath: "d:\\steam\\portal\\PORTAL.EXE",
      // Закрываем текущий блок.
    });
    // Обрабатываем конструкцию: const merged = mergeScannedGames([first, second], []).
    const merged = mergeScannedGames([first, second], []);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged).toHaveLength(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не схлопывает не-Steam игры, у которых appid пустой", () => {
    // Сохраняем пояснение разработчика: // У игр вне Steam appid null: раньше null === null делал од…
    // У игр вне Steam appid null: раньше `null === null` делал одну игру
    // Сохраняем пояснение разработчика: // из всех таких находок, и после первой пропадали остальные…
    // из всех таких находок, и после первой пропадали остальные.
    // Обрабатываем конструкцию: const merged = mergeScannedGames( [ game({ id: a, name:….
    const merged = mergeScannedGames(
      // Открываем массив.
      [
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "a",
          // Обрабатываем конструкцию: name.
          name: "Zeta",
          // Обрабатываем конструкцию: appid.
          appid: null,
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Games\\zeta\\zeta.exe",
          // Закрываем текущий блок.
        }),
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "b",
          // Обрабатываем конструкцию: name.
          name: "Alpha",
          // Обрабатываем конструкцию: appid.
          appid: null,
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Games\\alpha\\alpha.exe",
          // Закрываем текущий блок.
        }),
        // Закрываем массив или список.
      ],
      // Открываем массив.
      []
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged).toHaveLength(2);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("схлопывает игры с одинаковым appid", () => {
    // Обрабатываем конструкцию: const merged = mergeScannedGames( [ game({ id: a, appid….
    const merged = mergeScannedGames(
      // Открываем массив.
      [
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "a",
          // Обрабатываем конструкцию: appid.
          appid: "620",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Library1\\Portal 2\\portal2.exe",
          // Закрываем текущий блок.
        }),
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "b",
          // Обрабатываем конструкцию: appid.
          appid: "620",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "C:\\Library2\\Portal 2\\portal2.exe",
          // Закрываем текущий блок.
        }),
        // Закрываем массив или список.
      ],
      // Открываем массив.
      []
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged).toHaveLength(1);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сортирует игры по названию", () => {
    // Обрабатываем конструкцию: const merged = mergeScannedGames( [ game({ name: Zeta, ….
    const merged = mergeScannedGames(
      // Открываем массив.
      [
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: name.
          name: "Zeta",
          // Обрабатываем конструкцию: appid.
          appid: "1",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "D:\\Games\\zeta.exe",
          // Закрываем текущий блок.
        }),
        // Обрабатываем конструкцию: game.
        game({
          // Обрабатываем конструкцию: id.
          id: "x",
          // Обрабатываем конструкцию: name.
          name: "Alpha",
          // Обрабатываем конструкцию: appid.
          appid: "2",
          // Обрабатываем конструкцию: executablePath.
          executablePath: "D:\\Games\\alpha.exe",
          // Закрываем текущий блок.
        }),
        // Закрываем массив или список.
      ],
      // Открываем массив.
      []
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(merged.map((item) => item.name)).toEqual(["Alpha", "Zeta"]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("обход игры", () => {
  // Обрабатываем конструкцию: it.
  it("находит настройки по domainSettingsId", () => {
    // Обрабатываем конструкцию: const settings = getDefaultGames().
    const settings = getDefaultGames();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: gameBypass.
      gameBypass(game({ gameSettingsId: "outlast-trials" }), settings)?.id
      // Закрываем выражение или список аргументов.
    ).toBe("outlast-trials");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает false, если настройка выключена", () => {
    // Обрабатываем конструкцию: const settings = getDefaultGames().
    const settings = getDefaultGames();
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: isBypassEnabled.
      isBypassEnabled(game({ gameSettingsId: "outlast-trials" }), settings)
      // Закрываем выражение или список аргументов.
    ).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает true, если настройка включена", () => {
    // Обрабатываем конструкцию: const settings = getDefaultGames().map((item) => ({ ...….
    const settings = getDefaultGames().map((item) => ({
      // Разворачиваем ...item в коллекцию.
      ...item,
      // Обрабатываем конструкцию: enabled.
      enabled: item.id === "outlast-trials",
      // Закрываем текущий блок.
    }));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: isBypassEnabled.
      isBypassEnabled(game({ gameSettingsId: "outlast-trials" }), settings)
      // Закрываем выражение или список аргументов.
    ).toBe(true);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("античит", () => {
  // Обрабатываем конструкцию: it.
  it("определяет battleye и eac", () => {
    // Обрабатываем конструкцию: expect.
    expect(usesAnticheat(game({ anticheat: "battleye" }))).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(usesAnticheat(game({ anticheat: "eac" }))).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(usesAnticheat(game({ anticheat: "none" }))).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(usesAnticheat(game())).toBe(false);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("ручное добавление", () => {
  // Обрабатываем конструкцию: it.
  it("строит игру из пути", () => {
    // Обрабатываем конструкцию: const created = manualGame(Моя игра, C:\\Games\\My\\my.….
    const created = manualGame("Моя игра", "C:\\Games\\My\\my.exe", "custom");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(created.installPath).toBe("C:\\Games\\My");
    // Обрабатываем конструкцию: expect.
    expect(created.manual).toBe(true);
    // Сохраняем пояснение разработчика: // Формат id совпадает со сканером: удалённая вручную игра н…
    // Формат id совпадает со сканером: удалённая вручную игра не вернётся.
    // Обрабатываем конструкцию: expect.
    expect(created.id).toBe(gameIdFromPath("C:\\Games\\My\\my.exe"));
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("использует имя папки, если название пустое", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: manualGame.
      manualGame("   ", "C:\\Games\\Portal\\portal.exe", "custom").name
      // Закрываем выражение или список аргументов.
    ).toBe("Portal");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("ключи локализации", () => {
  // Обрабатываем конструкцию: it.
  it("покрывает все платформы и источники", () => {
    // Обрабатываем конструкцию: expect.
    expect(Object.keys(PLATFORM_LABEL_KEYS)).toHaveLength(9);
    // Обрабатываем конструкцию: expect.
    expect(Object.keys(SOURCE_LABEL_KEYS)).toHaveLength(10);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
