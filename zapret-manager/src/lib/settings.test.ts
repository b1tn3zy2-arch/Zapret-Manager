import { describe, expect, it } from "vitest";

import {
  MAX_HANDSHAKE_TIMEOUT_SEC,
  MAX_TIMEOUT_SEC,
  MIN_TIMEOUT_SEC,
  validateSettings,
} from "@/lib/settingsSchema";
import {
  SETTINGS_EXPORT_VERSION,
  deserializeSettings,
  serializeSettings,
} from "@/lib/settingsExport";
import { DEFAULT_SETTINGS } from "@/lib/defaults";

describe("validateSettings", () => {
  it("пустой объект даёт настройки по умолчанию", () => {
    const settings = validateSettings({});

    expect(settings.strategiesFolder).toBeTypeOf("string");
    expect(settings.lastStrategyId).toBeNull();
    expect(settings.general).toBeTypeOf("object");
  });

  it("сохраняет переданные значения", () => {
    const settings = validateSettings({
      strategiesFolder: "C:\\zapret",
      lastStrategyId: "st_1",
    });

    expect(settings.strategiesFolder).toBe("C:\\zapret");
    expect(settings.lastStrategyId).toBe("st_1");
  });

  it("отклоняет таймаут вне диапазона", () => {
    expect(() =>
      validateSettings({
        advanced: { strategyStartTimeoutSec: MIN_TIMEOUT_SEC - 1 },
      })
    ).toThrow(/strategyStartTimeoutSec/);
  });

  it("отклоняет неверный тип", () => {
    expect(() => validateSettings({ strategiesFolder: 42 })).toThrow(
      /strategiesFolder/
    );
  });

  it("нормализует границы таймаутов", () => {
    const settings = validateSettings({
      advanced: {
        strategyStartTimeoutSec: MIN_TIMEOUT_SEC,
        strategyStopTimeoutSec: MAX_TIMEOUT_SEC,
      },
    });

    expect(settings.advanced.strategyStartTimeoutSec).toBe(MIN_TIMEOUT_SEC);
    expect(settings.advanced.strategyStopTimeoutSec).toBe(MAX_TIMEOUT_SEC);
  });

  it("ограничивает handshake-таймаут", () => {
    expect(() =>
      validateSettings({
        vpn: { handshakeTimeoutSec: MAX_HANDSHAKE_TIMEOUT_SEC + 1 },
      })
    ).toThrow(/handshakeTimeoutSec/);
  });

  it("значение по умолчанию совпадает с DEFAULT_SETTINGS", () => {
    const settings = validateSettings({});

    expect(settings.outlastTrials).toEqual(DEFAULT_SETTINGS.outlastTrials);
  });
});

describe("serializeSettings", () => {
  it("добавляет версию и дату экспорта", () => {
    const payload = JSON.parse(serializeSettings(validateSettings({}))) as {
      version: number;
      exportedAt: string;
      appVersion: string;
    };

    expect(payload.version).toBe(SETTINGS_EXPORT_VERSION);
    expect(payload.exportedAt).toBeTypeOf("string");
    expect(payload.appVersion).toBeTypeOf("string");
  });

  it("не экспортирует lastStrategyId и ignoredVersions", () => {
    const settings = validateSettings({});
    settings.lastStrategyId = "st_secret";
    settings.strategyUpdates.ignoredVersions = ["1.0.0"];

    const json = serializeSettings(settings);

    expect(json).not.toContain("st_secret");
    expect(json).not.toContain("ignoredVersions");
  });
});

describe("deserializeSettings", () => {
  it("читает выгрузку обратно", () => {
    const original = validateSettings({ strategiesFolder: "C:\\zapret" });
    const restored = deserializeSettings(serializeSettings(original));

    expect(restored.strategiesFolder).toBe("C:\\zapret");
    expect(restored.strategyUpdates.ignoredVersions).toEqual([]);
  });

  it("принимает файл без обёртки", () => {
    const restored = deserializeSettings(
      JSON.stringify({ strategiesFolder: "D:\\" })
    );

    expect(restored.strategiesFolder).toBe("D:\\");
  });

  it("бросает ошибку на не-JSON", () => {
    expect(() => deserializeSettings("не json")).toThrow();
  });

  it("бросает ошибку на массив", () => {
    expect(() => deserializeSettings("[]")).toThrow(/expected object/);
  });
});
