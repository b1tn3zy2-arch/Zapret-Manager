import { describe, expect, it } from "vitest";

import {
  RARITY_ORDER,
  TECHNIQUE_WEIGHTS,
  buildStrategyCard,
  computeCardStats,
  computeCoverage,
  computeRarity,
  computeRarityScore,
  computeSpeed,
  computeStability,
  getRarityColor,
  getRarityLabel,
  summarizeCollection,
} from "@/lib/rarity";
import type { Strategy, TechniqueId } from "@/types";

function makeStrategy(overrides: Partial<Strategy> = {}): Strategy {
  return {
    id: "st_0000000000000001",
    name: "Тест",
    filename: "test.bat",
    path: "C:\\test\\test.bat",
    description: "Тест",
    services: ["discord"],
    techniques: ["fake"],
    fileType: "zapret",
    status: "idle",
    size: 1024,
    modifiedAt: 1_700_000_000_000,
    ...overrides,
  };
}

describe("computeRarityScore", () => {
  it("суммирует веса техник", () => {
    expect(computeRarityScore(["discord"], ["faketls", "ipset"], false)).toBe(
      TECHNIQUE_WEIGHTS.faketls + TECHNIQUE_WEIGHTS.ipset
    );
  });

  it("пустой набор даёт 0", () => {
    expect(computeRarityScore([], [], false)).toBe(0);
  });

  it("outlast-сервис и поддержка дают бонус", () => {
    const base = computeRarityScore(["discord"], [], false);

    expect(computeRarityScore(["outlast-trials"], [], false)).toBeGreaterThan(
      base
    );
    expect(computeRarityScore(["discord"], [], true)).toBeGreaterThan(base);
  });
});

describe("computeRarity", () => {
  it("ниже порога rare — обычная", () => {
    expect(computeRarity(0)).toBe("common");
    expect(computeRarity(14)).toBe("common");
  });

  it("пороги редкости соблюдаются", () => {
    expect(computeRarity(15)).toBe("rare");
    expect(computeRarity(19)).toBe("epic");
    expect(computeRarity(20)).toBe("legendary");
  });

  it("значение выше максимума не ломает расчёт", () => {
    expect(computeRarity(1_000)).toBe("legendary");
  });
});

describe("computeSpeed", () => {
  it("базовое значение 50 без техник", () => {
    expect(computeSpeed([])).toBe(50);
  });

  it("faketls добавляет 15", () => {
    expect(computeSpeed(["faketls"])).toBe(65);
  });

  it("складывает несколько техник", () => {
    expect(computeSpeed(["faketls", "quic-fake", "multisplit"])).toBe(85);
  });

  it("ограничен 100", () => {
    expect(
      computeSpeed([
        "faketls",
        "quic-fake",
        "multisplit",
        "any-protocol",
        "cutoff",
      ])
    ).toBe(100);
  });
});

describe("computeStability", () => {
  it("базовое значение 50", () => {
    expect(computeStability([], "unknown")).toBe(50);
  });

  it("zapret даёт бонус, winws — меньший", () => {
    expect(computeStability([], "zapret")).toBeGreaterThan(
      computeStability([], "winws")
    );
  });

  it("ipset повышает стабильность", () => {
    expect(computeStability(["ipset"], "unknown")).toBe(61);
  });

  it("каждая техника немного снижает стабильность", () => {
    expect(computeStability(["fake", "fake", "fake"], "unknown")).toBe(38);
  });

  it("пять техник дают 30", () => {
    expect(
      computeStability(["fake", "fake", "fake", "fake", "fake"], "unknown")
    ).toBe(30);
  });
});

describe("computeCoverage", () => {
  it("базовое покрытие 20", () => {
    expect(computeCoverage([], [])).toBe(20);
  });

  it("растёт с числом сервисов", () => {
    expect(
      computeCoverage(["discord", "youtube", "general"], [])
    ).toBeGreaterThan(computeCoverage(["discord"], []));
  });

  it("ipset и l7-filter повышают покрытие", () => {
    expect(computeCoverage(["discord"], ["ipset"])).toBe(
      computeCoverage(["discord"], []) + 20
    );
    expect(computeCoverage(["discord"], ["l7-filter"])).toBe(
      computeCoverage(["discord"], []) + 15
    );
  });
});

describe("computeCardStats", () => {
  it("возвращает значения в диапазоне 0..100", () => {
    const stats = computeCardStats(makeStrategy());

    for (const value of [stats.speed, stats.stability, stats.coverage]) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }
  });

  it("пустые техники не дают NaN", () => {
    const stats = computeCardStats(makeStrategy({ techniques: [] }));

    expect(Number.isNaN(stats.speed)).toBe(false);
    expect(stats.speed).toBe(50);
  });
});

describe("buildStrategyCard", () => {
  it("возвращает карточку с ожидаемой структурой", () => {
    const card = buildStrategyCard(makeStrategy(), false);

    expect(card.strategy.filename).toBe("test.bat");
    expect(card.rarity).toBe("common");
    expect(card.score).toBe(TECHNIQUE_WEIGHTS.fake);
  });

  it("одинаковые стратегии дают одинаковую редкость", () => {
    const first = buildStrategyCard(makeStrategy(), false);
    const second = buildStrategyCard(
      makeStrategy({ id: "st_0000000000000002" }),
      false
    );

    expect(second.rarity).toBe(first.rarity);
  });

  it("поддержка outlast повышает редкость", () => {
    const plain = buildStrategyCard(makeStrategy(), false);
    const supported = buildStrategyCard(makeStrategy(), true);

    expect(supported.score).toBeGreaterThan(plain.score);
  });

  it("набор техник из комплектной стратегии даёт legendary", () => {
    const card = buildStrategyCard(
      makeStrategy({
        techniques: [
          "faketls",
          "ipset",
          "l7-filter",
          "quic-fake",
          "multisplit",
          "split-seqovl",
          "multidisorder",
          "syndata",
          "any-protocol",
          "cutoff",
          "fake",
        ],
      }),
      true
    );

    expect(card.rarity).toBe("legendary");
  });

  it("распределение редкости по комплектным стратегиям сбалансировано", () => {
    const bundled: TechniqueId[][] = [
      [
        "faketls",
        "multisplit",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "multisplit",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "multisplit",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "syndata",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fakedsplit",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "multidisorder",
        "syndata",
        "fake",
      ],
      [
        "faketls",
        "multisplit",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "multidisorder",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fakedsplit",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "split-seqovl",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "hostfakesplit",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
      [
        "faketls",
        "quic-fake",
        "l7-filter",
        "ipset",
        "any-protocol",
        "cutoff",
        "fake",
      ],
    ];

    const cards = bundled.map((techniques, index) =>
      buildStrategyCard(
        makeStrategy({
          id: `st_${index}`,
          techniques,
          services: ["discord", "youtube", "general"],
        }),
        false
      )
    );

    const tally = summarizeCollection(cards);

    expect(tally.total).toBe(22);
    expect(tally.common).toBeGreaterThanOrEqual(2);
    expect(tally.rare).toBeGreaterThanOrEqual(2);
    expect(tally.epic).toBeGreaterThanOrEqual(2);
    expect(tally.legendary).toBeGreaterThanOrEqual(1);
    expect(tally.legendary).toBeLessThanOrEqual(8);
  });
});

describe("summarizeCollection", () => {
  it("пустая коллекция даёт нули", () => {
    expect(summarizeCollection([])).toEqual({
      total: 0,
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0,
    });
  });

  it("считает карточки по редкости", () => {
    const summary = summarizeCollection([
      buildStrategyCard(makeStrategy(), false),
      buildStrategyCard(makeStrategy({ id: "st_0000000000000002" }), false),
      buildStrategyCard(
        makeStrategy({ techniques: ["faketls", "ipset"] }),
        false
      ),
    ]);

    expect(summary.total).toBe(3);
    expect(summary.common).toBe(3);
  });
});

describe("редкости: порядок, подписи, цвета", () => {
  it("порядок от самой высокой редкости", () => {
    expect([...RARITY_ORDER]).toEqual(["legendary", "epic", "rare", "common"]);
  });

  it("подписи на русском непустые", () => {
    for (const rarity of RARITY_ORDER) {
      expect(getRarityLabel(rarity).length).toBeGreaterThan(0);
    }
  });

  it("цвета редкостей различны", () => {
    const legendary = getRarityColor("legendary");
    const common = getRarityColor("common");

    expect(legendary.solid).not.toBe(common.solid);
    expect(legendary.border).not.toBe(common.border);
  });
});
