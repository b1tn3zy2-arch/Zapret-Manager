import { describe, expect, it } from "vitest";

import { buildExportContent, buildExportFileName } from "@/lib/logExport";
import { SERVICE_COLORS, serviceColor } from "@/lib/serviceColors";
import { cn, toErrorMessage } from "@/lib/utils";
import { pickStrategyName, pickVpnName, toTrayState } from "@/lib/trayUtils";
import {
  formatEta,
  formatReleaseDate,
  formatVersion,
  isKnownVersion,
  isValidRepo,
  isVersionIgnored,
  normalizeVersion,
  versionWithoutPrefix,
} from "@/lib/updateUtils";
import type { LogEntry } from "@/types";

describe("cn", () => {
  it("объединяет классы и убирает конфликтующие", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("игнорирует ложные значения", () => {
    expect(cn("flex", false, undefined, null)).toBe("flex");
  });
});

describe("toErrorMessage", () => {
  it("использует message из Error", () => {
    expect(toErrorMessage(new Error("boom"))).toBe("boom");
  });

  it("принимает объект со строковым message", () => {
    expect(toErrorMessage({ message: "из IPC" })).toBe("из IPC");
  });

  it("возвращает текст для строки", () => {
    expect(toErrorMessage("строка")).toBe("строка");
  });

  it("fallback для неизвестного значения", () => {
    expect(toErrorMessage(undefined)).toBe("Неизвестная ошибка");
  });
});

describe("serviceColor", () => {
  it("возвращает цвет для известного сервиса", () => {
    expect(serviceColor("discord")).toBe(SERVICE_COLORS.discord);
  });

  it("возвращает neutral для неизвестного значения", () => {
    expect(serviceColor("unknown" as never)).toBe("neutral");
  });
});

describe("normalizeVersion", () => {
  it("убирает префикс v и суффикс сборки", () => {
    expect(normalizeVersion("v1.2.3")).toBe("1.2.3");
    expect(normalizeVersion("1.2.3-beta.1")).toBe("1.2.3");
  });

  it("пустое значение даёт неизвестную версию", () => {
    expect(isKnownVersion("  ")).toBe(false);
    expect(formatVersion("")).toBe("неизвестно");
  });
});

describe("formatVersion и versionWithoutPrefix", () => {
  it("возвращает нормализованную версию", () => {
    expect(formatVersion("V2.0.0")).toBe("2.0.0");
  });

  it("убирает только префикс", () => {
    expect(versionWithoutPrefix("v2.0.0-beta")).toBe("2.0.0-beta");
  });
});

describe("isVersionIgnored", () => {
  it("сравнивает нормализованные версии", () => {
    expect(isVersionIgnored("v1.2.3", ["1.2.3"])).toBe(true);
    expect(isVersionIgnored("1.2.4", ["1.2.3"])).toBe(false);
  });

  it("пустой список игнорирует всё", () => {
    expect(isVersionIgnored("1.2.3", [])).toBe(false);
  });
});

describe("formatReleaseDate", () => {
  it("возвращает дату для валидного ISO", () => {
    expect(formatReleaseDate("2024-05-01T10:00:00Z").length).toBeGreaterThan(0);
  });

  it("неизвестная дата даёт заглушку", () => {
    expect(formatReleaseDate("не дата")).toBeTypeOf("string");
  });
});

describe("formatEta", () => {
  it("неизвестное время даёт заглушку", () => {
    expect(formatEta(null)).toContain("неизвестно");
    expect(formatEta(Number.NaN)).toContain("неизвестно");
  });

  it("секунды показываются до минуты", () => {
    expect(formatEta(30)).toContain("сек");
  });

  it("округляет минуты вверх", () => {
    expect(formatEta(90)).toContain("2");
  });
});

describe("isValidRepo", () => {
  it("принимает owner/repo", () => {
    expect(isValidRepo("bol-van-zah/applebyebybounce")).toBe(true);
  });

  it("отклоняет мусор", () => {
    expect(isValidRepo("no-slash")).toBe(false);
    expect(isValidRepo("a/b/c")).toBe(false);
  });
});

describe("trayUtils", () => {
  it("маппит статус подключения в состояние трея", () => {
    expect(toTrayState("connected")).toBe("connected");
    expect(toTrayState("disconnected")).toBe("idle");
    expect(toTrayState("vpn")).toBe("vpn");
  });

  it("выбирает имя активной стратегии", () => {
    expect(pickStrategyName("Discord", "YouTube", true)).toBe("Discord");
    expect(pickStrategyName("Discord", "YouTube", false)).toBe("YouTube");
  });

  it("возвращает null для отключённого VPN", () => {
    expect(pickVpnName("WireGuard", false)).toBeNull();
    expect(pickVpnName("WireGuard", true)).toBe("WireGuard");
  });
});

describe("logExport", () => {
  it("имя файла содержит дату и время", () => {
    const name = buildExportFileName(new Date(2024, 4, 1, 12, 30));

    expect(name).toContain("2024-05-01");
    expect(name).toContain("12-30");
  });

  it("экспорт склеивает строки логов", () => {
    const logs: LogEntry[] = [
      {
        id: "1",
        timestamp: Date.now(),
        level: "info",
        source: "system",
        message: "первое",
      },
      {
        id: "2",
        timestamp: Date.now(),
        level: "error",
        source: "strategy",
        message: "второе",
      },
    ];

    const content = buildExportContent(logs);

    expect(content.split("\n")).toHaveLength(2);
    expect(content).toContain("первое");
  });

  it("пустой список даёт пустую строку", () => {
    expect(buildExportContent([])).toBe("");
  });
});
