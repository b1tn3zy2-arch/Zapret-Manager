import { describe, expect, it } from "vitest";

import {
  applyEWMA,
  buildTrafficPoint,
  computeMax,
  formatBytes,
  formatCount,
  formatSpeed,
  pickSeries,
} from "@/lib/trafficUtils";
import {
  formatEndpoint,
  formatHandshakeTime,
  formatUptime,
  formatVpnState,
  isHandshakeFresh,
} from "@/lib/vpnUtils";
import { NOTIFY_PREFIX, parseNotify } from "@/lib/notifyProtocol";
import { composeSnapshot, snapshotFileName } from "@/lib/monitorSnapshot";
import {
  countryCodeToFlagSrc,
  getGreeting,
  hasFlagAsset,
  isKnownCountryCode,
  toCountryCode,
} from "@/lib/geo";
import { createTranslate } from "@/i18n";
import type { VpnState } from "@/types";

const t = createTranslate("ru");

describe("formatBytes", () => {
  it("перебирает единицы", () => {
    expect(formatBytes(512)).toBe("512 Б");
    expect(formatBytes(2048)).toBe("2 КБ");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 МБ");
    expect(formatBytes(3 * 1024 ** 3)).toBe("3 ГБ");
    expect(formatBytes(2 * 1024 ** 4)).toBe("2 ТБ");
  });

  it("убирает хвостовые нули дробной части", () => {
    expect(formatBytes(1536)).toBe("1.5 КБ");
    expect(formatBytes(1536)).not.toContain("1.50");
  });
});

describe("formatCount", () => {
  it("округляет значение", () => {
    expect(formatCount(1234)).toBeTypeOf("string");
  });
});

describe("formatSpeed", () => {
  it("использует формат байт в секунду", () => {
    expect(formatSpeed(1024)).toContain("Б/с");
  });
});

describe("applyEWMA", () => {
  it("сглаживает ряд", () => {
    const smoothed = applyEWMA([0, 100], 0.5);

    expect(smoothed).toHaveLength(2);
    expect(smoothed[1]).toBeCloseTo(50, 5);
  });

  it("пустой ряд даёт пустой результат", () => {
    expect(applyEWMA([])).toEqual([]);
  });
});

describe("computeMax", () => {
  it("растёт при пике", () => {
    expect(computeMax([100, 200], 0)).toBeGreaterThan(200);
  });

  it("не падает ниже минимального масштаба", () => {
    expect(computeMax([1], 0)).toBeGreaterThan(0);
  });

  it("затухает плавно, а не обнуляется", () => {
    const decayed = computeMax([1], 8_000);

    expect(decayed).toBeLessThan(8_000);
    expect(decayed).toBeGreaterThan(1);
  });
});

describe("pickSeries и buildTrafficPoint", () => {
  const point = buildTrafficPoint({
    speedIn: 100,
    speedOut: 50,
    timestamp: 1_700_000_000_000,
  });

  it("извлекает значения по ключу", () => {
    expect(pickSeries([point], "in")).toEqual([100]);
    expect(pickSeries([point], "out")).toEqual([50]);
  });

  it("точка содержит время и скорости", () => {
    expect(point.timestamp).toBe(1_700_000_000_000);
    expect(point.in).toBe(100);
    expect(point.out).toBe(50);
  });
});

describe("vpnUtils", () => {
  it("форматирует время handshake", () => {
    expect(formatHandshakeTime(null, t)).toBeTypeOf("string");
    expect(formatHandshakeTime(Date.now(), t)).toBeTypeOf("string");
    expect(formatHandshakeTime(Date.now() - 7_200_000, t)).toBeTypeOf("string");
  });

  it("форматирует uptime как ЧЧ:ММ:СС", () => {
    expect(formatUptime(null)).toBe("—");
    expect(formatUptime(3661)).toBe("01:01:01");
  });

  it("определяет свежесть handshake", () => {
    expect(isHandshakeFresh(null)).toBe(false);
    expect(isHandshakeFresh(Date.now())).toBe(true);
  });

  it("оставляет endpoint без изменений", () => {
    expect(formatEndpoint("host.example.com:51820")).toBe(
      "host.example.com:51820"
    );
    expect(formatEndpoint("без-порта")).toBe("без-порта");
  });

  it("переводит состояние VPN через словарь", () => {
    const state: VpnState = "connected";

    expect(formatVpnState(state, t)).toBeTypeOf("string");
    expect(formatVpnState("disconnected", t)).toBeTypeOf("string");
  });
});

describe("notifyProtocol", () => {
  it("разбирает корректное уведомление", () => {
    const parsed = parseNotify(
      `${NOTIFY_PREFIX}info:Готово|Стратегия запущена`
    );

    expect(parsed).toEqual({
      kind: "info",
      title: "Готово",
      body: "Стратегия запущена",
    });
  });

  it("возвращает null для неизвестного вида", () => {
    expect(parseNotify(`${NOTIFY_PREFIX}unknown:a|b`)).toBeNull();
  });

  it("возвращает null для мусора", () => {
    expect(parseNotify("просто текст")).toBeNull();
    expect(parseNotify(`${NOTIFY_PREFIX}info:без разделителя`)).toBeNull();
  });
});

describe("monitorSnapshot", () => {
  it("имя файла содержит дату и время", () => {
    expect(snapshotFileName()).toMatch(
      /^zapret-monitor-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/
    );
  });

  it("без контекста canvas возвращает пустую строку", () => {
    expect(composeSnapshot([{ label: "Трафик", canvas: null }], 640)).toBe("");
  });
});

describe("geo", () => {
  it("приводит код страны к верхнему регистру", () => {
    expect(toCountryCode("ru")).toBe("RU");
    expect(toCountryCode(" ru ")).toBe("RU");
    expect(toCountryCode("zz")).toBeNull();
  });

  it("проверяет известные коды", () => {
    expect(isKnownCountryCode("RU")).toBe(true);
    expect(isKnownCountryCode("ZZ")).toBe(false);
  });

  it("проверяет наличие флага", () => {
    expect(hasFlagAsset("ru")).toBe(true);
    expect(hasFlagAsset("zz")).toBe(false);
  });

  it("возвращает путь к флагу или заглушку", () => {
    expect(countryCodeToFlagSrc("ru")).not.toBe(countryCodeToFlagSrc("zz"));
    expect(countryCodeToFlagSrc("ru").length).toBeGreaterThan(0);
  });

  it("приветствие зависит от времени суток", () => {
    const greetings = [
      getGreeting(new Date(2024, 0, 1, 3)),
      getGreeting(new Date(2024, 0, 1, 13)),
      getGreeting(new Date(2024, 0, 1, 22)),
    ];

    expect(new Set(greetings).size).toBeGreaterThan(1);
  });
});
