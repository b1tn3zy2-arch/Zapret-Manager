// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/settingsSchema.
import {
  // Подключаем именованный импорт MAX_HANDSHAKE_TIMEOUT_SEC.
  MAX_HANDSHAKE_TIMEOUT_SEC,
  // Подключаем именованный импорт MAX_TIMEOUT_SEC.
  MAX_TIMEOUT_SEC,
  // Подключаем именованный импорт MIN_TIMEOUT_SEC.
  MIN_TIMEOUT_SEC,
  // Подключаем именованный импорт validateSettings.
  validateSettings,
  // Закрываем текущий блок.
} from "@/lib/settingsSchema";
// Импортируем зависимости из модуля @/lib/settingsExport.
import {
  // Подключаем именованный импорт SETTINGS_EXPORT_VERSION.
  SETTINGS_EXPORT_VERSION,
  // Подключаем именованный импорт deserializeSettings.
  deserializeSettings,
  // Подключаем именованный импорт serializeSettings.
  serializeSettings,
  // Закрываем текущий блок.
} from "@/lib/settingsExport";
// Импортируем зависимости из модуля @/lib/defaults.
import { DEFAULT_SETTINGS } from "@/lib/defaults";
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("validateSettings", () => {
  // Обрабатываем конструкцию: it.
  it("пустой объект даёт настройки по умолчанию", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({}).
    const settings = validateSettings({});
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings.strategiesFolder).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(settings.lastStrategyId).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(settings.general).toBeTypeOf("object");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет переданные значения", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ strategiesFolder: C….
    const settings = validateSettings({
      // Обрабатываем конструкцию: strategiesFolder.
      strategiesFolder: "C:\\zapret",
      // Обрабатываем конструкцию: lastStrategyId.
      lastStrategyId: "st_1",
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings.strategiesFolder).toBe("C:\\zapret");
    // Обрабатываем конструкцию: expect.
    expect(settings.lastStrategyId).toBe("st_1");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет таймаут вне диапазона", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: validateSettings.
        validateSettings({
          // Обрабатываем конструкцию: advanced.
          advanced: { strategyStartTimeoutSec: MIN_TIMEOUT_SEC - 1 },
          // Закрываем текущий блок.
        })
      // Закрываем выражение или список аргументов.
    ).toThrow(/strategyStartTimeoutSec/);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("отклоняет неверный тип", () => {
    // Обрабатываем конструкцию: expect.
    expect(() => validateSettings({ strategiesFolder: 42 })).toThrow(
      // Обрабатываем конструкцию: /strategiesFolder/.
      /strategiesFolder/
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("нормализует границы таймаутов", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ advanced: { strateg….
    const settings = validateSettings({
      // Обрабатываем конструкцию: advanced.
      advanced: {
        // Обрабатываем конструкцию: strategyStartTimeoutSec.
        strategyStartTimeoutSec: MIN_TIMEOUT_SEC,
        // Обрабатываем конструкцию: strategyStopTimeoutSec.
        strategyStopTimeoutSec: MAX_TIMEOUT_SEC,
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings.advanced.strategyStartTimeoutSec).toBe(MIN_TIMEOUT_SEC);
    // Обрабатываем конструкцию: expect.
    expect(settings.advanced.strategyStopTimeoutSec).toBe(MAX_TIMEOUT_SEC);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("ограничивает handshake-таймаут", () => {
    // Обрабатываем конструкцию: expect.
    expect(
      // Продолжаем предыдущую конструкцию.
      () =>
        // Обрабатываем конструкцию: validateSettings.
        validateSettings({
          // Обрабатываем конструкцию: vpn.
          vpn: { handshakeTimeoutSec: MAX_HANDSHAKE_TIMEOUT_SEC + 1 },
          // Закрываем текущий блок.
        })
      // Закрываем выражение или список аргументов.
    ).toThrow(/handshakeTimeoutSec/);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("значение по умолчанию совпадает с DEFAULT_SETTINGS", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({}).
    const settings = validateSettings({});
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(settings.games).toEqual(DEFAULT_SETTINGS.games);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переносит прежние настройки Outlast Trials в список игр", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ outlastTrials: { en….
    const settings = validateSettings({
      // Обрабатываем конструкцию: outlastTrials.
      outlastTrials: {
        // Обрабатываем конструкцию: enabled.
        enabled: true,
        // Обрабатываем конструкцию: domains.
        domains: ["outlasttrials.com"],
        // Обрабатываем конструкцию: ipRanges.
        ipRanges: ["203.0.113.0/24"],
        // Обрабатываем конструкцию: ports.
        ports: [27015],
        // Обрабатываем конструкцию: autoRestore.
        autoRestore: false,
        // Обрабатываем конструкцию: createBackup.
        createBackup: true,
        // Закрываем текущий блок.
      },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const outlast = settings.games.find((game) => game.id =….
    const outlast = settings.games.find((game) => game.id === "outlast-trials");
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(outlast).toBeDefined();
    // Обрабатываем конструкцию: expect.
    expect(outlast?.enabled).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(outlast?.builtin).toBe(true);
    // Сохраняем пояснение разработчика: // перенесённые значения сохраняются и дополняются актуальны…
    // перенесённые значения сохраняются и дополняются актуальным пресетом,
    // Сохраняем пояснение разработчика: // иначе обход остался бы без домена rbg-services.com и порт…
    // иначе обход остался бы без домена rbg-services.com и портов GameLift
    // Обрабатываем конструкцию: expect.
    expect(outlast?.domains).toContain("outlasttrials.com");
    // Обрабатываем конструкцию: expect.
    expect(outlast?.domains).toContain("redbarrelsgames.com");
    // Обрабатываем конструкцию: expect.
    expect(outlast?.ipRanges).toEqual(["203.0.113.0/24"]);
    // Обрабатываем конструкцию: expect.
    expect(outlast?.ports).toContain(27015);
    // Обрабатываем конструкцию: expect.
    expect(outlast?.ports).toContain(7777);
    // Обрабатываем конструкцию: expect.
    expect(outlast?.ports).toContain(7830);
    // Обрабатываем конструкцию: expect.
    expect(outlast?.autoRestore).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(settings.games.length).toBe(DEFAULT_SETTINGS.games.length);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("сохраняет свою игру и дополняет список встроенными", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({ games: [ { id: my-g….
    const settings = validateSettings({
      // Обрабатываем конструкцию: games.
      games: [
        // Открываем объектный литерал.
        {
          // Обрабатываем конструкцию: id.
          id: "my-game",
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
          ports: [],
          // Обрабатываем конструкцию: autoRestore.
          autoRestore: true,
          // Обрабатываем конструкцию: createBackup.
          createBackup: true,
          // Обрабатываем конструкцию: createdAt.
          createdAt: 10,
          // Закрываем текущий блок.
        },
        // Закрываем массив или список.
      ],
      // Обрабатываем конструкцию: outlastTrials.
      outlastTrials: { enabled: true, domains: ["legacy.com"] },
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const ids = settings.games.map((game) => game.id).
    const ids = settings.games.map((game) => game.id);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(ids).toContain("my-game");
    // Обрабатываем конструкцию: expect.
    expect(ids).toContain("outlast-trials");
    // Обрабатываем конструкцию: expect.
    expect(
      // Обрабатываем конструкцию: settings.
      settings.games.find((game) => game.id === "outlast-trials")?.enabled
      // Закрываем выражение или список аргументов.
    ).toBe(false);
    // Сохраняем пояснение разработчика: // своя игра + все встроенные пресеты
    // своя игра + все встроенные пресеты
    // Обрабатываем конструкцию: expect.
    expect(settings.games).toHaveLength(DEFAULT_SETTINGS.games.length + 1);
    // Обрабатываем конструкцию: expect.
    expect(settings.games[0]?.id).toBe("my-game");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("serializeSettings", () => {
  // Обрабатываем конструкцию: it.
  it("добавляет версию и дату экспорта", () => {
    // Обрабатываем конструкцию: const payload = JSON.parse(serializeSettings(validateSe….
    const payload = JSON.parse(serializeSettings(validateSettings({}))) as {
      // Обрабатываем конструкцию: version.
      version: number;
      // Обрабатываем конструкцию: exportedAt.
      exportedAt: string;
      // Обрабатываем конструкцию: appVersion.
      appVersion: string;
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(payload.version).toBe(SETTINGS_EXPORT_VERSION);
    // Обрабатываем конструкцию: expect.
    expect(payload.exportedAt).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(payload.appVersion).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не экспортирует lastStrategyId и ignoredVersions", () => {
    // Обрабатываем конструкцию: const settings = validateSettings({}).
    const settings = validateSettings({});
    // Обрабатываем конструкцию: settings.
    settings.lastStrategyId = "st_secret";
    // Обрабатываем конструкцию: settings.
    settings.strategyUpdates.ignoredVersions = ["1.0.0"];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const json = serializeSettings(settings).
    const json = serializeSettings(settings);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(json).not.toContain("st_secret");
    // Обрабатываем конструкцию: expect.
    expect(json).not.toContain("ignoredVersions");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("deserializeSettings", () => {
  // Обрабатываем конструкцию: it.
  it("читает выгрузку обратно", () => {
    // Обрабатываем конструкцию: const original = validateSettings({ strategiesFolder: C….
    const original = validateSettings({ strategiesFolder: "C:\\zapret" });
    // Обрабатываем конструкцию: const restored = deserializeSettings(serializeSettings(….
    const restored = deserializeSettings(serializeSettings(original));
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(restored.strategiesFolder).toBe("C:\\zapret");
    // Обрабатываем конструкцию: expect.
    expect(restored.strategyUpdates.ignoredVersions).toEqual([]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("принимает файл без обёртки", () => {
    // Обрабатываем конструкцию: const restored = deserializeSettings( JSON.stringify({ ….
    const restored = deserializeSettings(
      // Обрабатываем конструкцию: JSON.
      JSON.stringify({ strategiesFolder: "D:\\" })
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(restored.strategiesFolder).toBe("D:\\");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("бросает ошибку на не-JSON", () => {
    // Обрабатываем конструкцию: expect.
    expect(() => deserializeSettings("не json")).toThrow();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("бросает ошибку на массив", () => {
    // Обрабатываем конструкцию: expect.
    expect(() => deserializeSettings("[]")).toThrow(/expected object/);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
