// Импортируем зависимости из модуля vitest.
import { describe, expect, it } from "vitest";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/trafficUtils.
import {
  // Подключаем именованный импорт applyEWMA.
  applyEWMA,
  // Подключаем именованный импорт buildTrafficPoint.
  buildTrafficPoint,
  // Подключаем именованный импорт computeMax.
  computeMax,
  // Подключаем именованный импорт formatBytes.
  formatBytes,
  // Подключаем именованный импорт formatCount.
  formatCount,
  // Подключаем именованный импорт formatSpeed.
  formatSpeed,
  // Подключаем именованный импорт pickSeries.
  pickSeries,
  // Закрываем текущий блок.
} from "@/lib/trafficUtils";
// Импортируем зависимости из модуля @/lib/vpnUtils.
import {
  // Подключаем именованный импорт formatEndpoint.
  formatEndpoint,
  // Подключаем именованный импорт formatHandshakeTime.
  formatHandshakeTime,
  // Подключаем именованный импорт formatUptime.
  formatUptime,
  // Подключаем именованный импорт formatVpnState.
  formatVpnState,
  // Подключаем именованный импорт isHandshakeFresh.
  isHandshakeFresh,
  // Закрываем текущий блок.
} from "@/lib/vpnUtils";
// Импортируем зависимости из модуля @/lib/notifyProtocol.
import { NOTIFY_PREFIX, parseNotify } from "@/lib/notifyProtocol";
// Импортируем зависимости из модуля @/lib/monitorSnapshot.
import { composeSnapshot, snapshotFileName } from "@/lib/monitorSnapshot";
// Импортируем зависимости из модуля @/lib/geo.
import {
  // Подключаем именованный импорт countryCodeToFlagSrc.
  countryCodeToFlagSrc,
  // Подключаем именованный импорт getGreeting.
  getGreeting,
  // Подключаем именованный импорт hasFlagAsset.
  hasFlagAsset,
  // Подключаем именованный импорт isKnownCountryCode.
  isKnownCountryCode,
  // Подключаем именованный импорт toCountryCode.
  toCountryCode,
  // Закрываем текущий блок.
} from "@/lib/geo";
// Импортируем зависимости из модуля @/i18n.
import { createTranslate } from "@/i18n";
// Импортируем зависимости из модуля @/types.
import type { VpnState } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const t = createTranslate(ru).
const t = createTranslate("ru");
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatBytes", () => {
  // Обрабатываем конструкцию: it.
  it("перебирает единицы", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(512)).toBe("512 Б");
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(2048)).toBe("2 КБ");
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 МБ");
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(3 * 1024 ** 3)).toBe("3 ГБ");
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(2 * 1024 ** 4)).toBe("2 ТБ");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("убирает хвостовые нули дробной части", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(1536)).toBe("1.5 КБ");
    // Обрабатываем конструкцию: expect.
    expect(formatBytes(1536)).not.toContain("1.50");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatCount", () => {
  // Обрабатываем конструкцию: it.
  it("округляет значение", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatCount(1234)).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("formatSpeed", () => {
  // Обрабатываем конструкцию: it.
  it("использует формат байт в секунду", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatSpeed(1024)).toContain("Б/с");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("applyEWMA", () => {
  // Обрабатываем конструкцию: it.
  it("сглаживает ряд", () => {
    // Обрабатываем конструкцию: const smoothed = applyEWMA([0, 100], 0.5).
    const smoothed = applyEWMA([0, 100], 0.5);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(smoothed).toHaveLength(2);
    // Обрабатываем конструкцию: expect.
    expect(smoothed[1]).toBeCloseTo(50, 5);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("пустой ряд даёт пустой результат", () => {
    // Обрабатываем конструкцию: expect.
    expect(applyEWMA([])).toEqual([]);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("computeMax", () => {
  // Обрабатываем конструкцию: it.
  it("растёт при пике", () => {
    // Обрабатываем конструкцию: expect.
    expect(computeMax([100, 200], 0)).toBeGreaterThan(200);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("не падает ниже минимального масштаба", () => {
    // Обрабатываем конструкцию: expect.
    expect(computeMax([1], 0)).toBeGreaterThan(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("затухает плавно, а не обнуляется", () => {
    // Обрабатываем конструкцию: const decayed = computeMax([1], 8_000).
    const decayed = computeMax([1], 8_000);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(decayed).toBeLessThan(8_000);
    // Обрабатываем конструкцию: expect.
    expect(decayed).toBeGreaterThan(1);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("pickSeries и buildTrafficPoint", () => {
  // Обрабатываем конструкцию: const point = buildTrafficPoint({ speedIn: 100, speedOu….
  const point = buildTrafficPoint({
    // Обрабатываем конструкцию: speedIn.
    speedIn: 100,
    // Обрабатываем конструкцию: speedOut.
    speedOut: 50,
    // Обрабатываем конструкцию: timestamp.
    timestamp: 1_700_000_000_000,
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("извлекает значения по ключу", () => {
    // Обрабатываем конструкцию: expect.
    expect(pickSeries([point], "in")).toEqual([100]);
    // Обрабатываем конструкцию: expect.
    expect(pickSeries([point], "out")).toEqual([50]);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("точка содержит время и скорости", () => {
    // Обрабатываем конструкцию: expect.
    expect(point.timestamp).toBe(1_700_000_000_000);
    // Обрабатываем конструкцию: expect.
    expect(point.in).toBe(100);
    // Обрабатываем конструкцию: expect.
    expect(point.out).toBe(50);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("vpnUtils", () => {
  // Обрабатываем конструкцию: it.
  it("форматирует время handshake", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatHandshakeTime(null, t)).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(formatHandshakeTime(Date.now(), t)).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(formatHandshakeTime(Date.now() - 7_200_000, t)).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("форматирует uptime как ЧЧ:ММ:СС", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatUptime(null)).toBe("—");
    // Обрабатываем конструкцию: expect.
    expect(formatUptime(3661)).toBe("01:01:01");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("определяет свежесть handshake", () => {
    // Обрабатываем конструкцию: expect.
    expect(isHandshakeFresh(null)).toBe(false);
    // Обрабатываем конструкцию: expect.
    expect(isHandshakeFresh(Date.now())).toBe(true);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("оставляет endpoint без изменений", () => {
    // Обрабатываем конструкцию: expect.
    expect(formatEndpoint("host.example.com:51820")).toBe(
      // Обрабатываем конструкцию: host.example.com:51820.
      "host.example.com:51820"
      // Закрываем выражение или список аргументов.
    );
    // Обрабатываем конструкцию: expect.
    expect(formatEndpoint("без-порта")).toBe("без-порта");
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("переводит состояние VPN через словарь", () => {
    // Обрабатываем конструкцию: const state: VpnState = connected.
    const state: VpnState = "connected";
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(formatVpnState(state, t)).toBeTypeOf("string");
    // Обрабатываем конструкцию: expect.
    expect(formatVpnState("disconnected", t)).toBeTypeOf("string");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("notifyProtocol", () => {
  // Обрабатываем конструкцию: it.
  it("разбирает корректное уведомление", () => {
    // Обрабатываем конструкцию: const parsed = parseNotify( ${NOTIFY_PREFIX}info:Готово….
    const parsed = parseNotify(
      // Обрабатываем конструкцию: ${.
      `${NOTIFY_PREFIX}info:Готово|Стратегия запущена`
      // Закрываем выражение или список аргументов.
    );
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(parsed).toEqual({
      // Обрабатываем конструкцию: kind.
      kind: "info",
      // Обрабатываем конструкцию: title.
      title: "Готово",
      // Обрабатываем конструкцию: body.
      body: "Стратегия запущена",
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает null для неизвестного вида", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseNotify(`${NOTIFY_PREFIX}unknown:a|b`)).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает null для мусора", () => {
    // Обрабатываем конструкцию: expect.
    expect(parseNotify("просто текст")).toBeNull();
    // Обрабатываем конструкцию: expect.
    expect(parseNotify(`${NOTIFY_PREFIX}info:без разделителя`)).toBeNull();
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("monitorSnapshot", () => {
  // Обрабатываем конструкцию: it.
  it("имя файла содержит дату и время", () => {
    // Обрабатываем конструкцию: expect.
    expect(snapshotFileName()).toMatch(
      // Обрабатываем конструкцию: /^zapret-monitor-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/.
      /^zapret-monitor-\d{4}-\d{2}-\d{2}-\d{2}-\d{2}\.png$/
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("без контекста canvas возвращает пустую строку", () => {
    // Обрабатываем конструкцию: expect.
    expect(composeSnapshot([{ label: "Трафик", canvas: null }], 640)).toBe("");
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —

// Обрабатываем конструкцию: describe.
describe("geo", () => {
  // Обрабатываем конструкцию: it.
  it("приводит код страны к верхнему регистру", () => {
    // Обрабатываем конструкцию: expect.
    expect(toCountryCode("ru")).toBe("RU");
    // Обрабатываем конструкцию: expect.
    expect(toCountryCode(" ru ")).toBe("RU");
    // Обрабатываем конструкцию: expect.
    expect(toCountryCode("zz")).toBeNull();
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("проверяет известные коды", () => {
    // Обрабатываем конструкцию: expect.
    expect(isKnownCountryCode("RU")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(isKnownCountryCode("ZZ")).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("проверяет наличие флага", () => {
    // Обрабатываем конструкцию: expect.
    expect(hasFlagAsset("ru")).toBe(true);
    // Обрабатываем конструкцию: expect.
    expect(hasFlagAsset("zz")).toBe(false);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("возвращает путь к флагу или заглушку", () => {
    // Обрабатываем конструкцию: expect.
    expect(countryCodeToFlagSrc("ru")).not.toBe(countryCodeToFlagSrc("zz"));
    // Обрабатываем конструкцию: expect.
    expect(countryCodeToFlagSrc("ru").length).toBeGreaterThan(0);
    // Закрываем текущий блок.
  });
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: it.
  it("приветствие зависит от времени суток", () => {
    // Обрабатываем конструкцию: const greetings = [ getGreeting(new Date(2024, 0, 1, 3)….
    const greetings = [
      // Обрабатываем конструкцию: getGreeting.
      getGreeting(new Date(2024, 0, 1, 3)),
      // Обрабатываем конструкцию: getGreeting.
      getGreeting(new Date(2024, 0, 1, 13)),
      // Обрабатываем конструкцию: getGreeting.
      getGreeting(new Date(2024, 0, 1, 22)),
      // Закрываем массив или список.
    ];
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: expect.
    expect(new Set(greetings).size).toBeGreaterThan(1);
    // Закрываем текущий блок.
  });
  // Закрываем текущий блок.
});
// — разделитель логических блоков —
