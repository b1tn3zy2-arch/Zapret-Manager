import type { TranslationKey } from "@/i18n/types";
import { translateKey } from "@/i18n/core";
import type {
  CardStats,
  CollectionSummary,
  Rarity,
  ServiceType,
  Strategy,
  StrategyCard,
  TechniqueId,
} from "@/types";

export const TECHNIQUE_WEIGHTS = {
  faketls: 3,
  "split-seqovl": 3,
  ipset: 2,
  "l7-filter": 2,
  "quic-fake": 2,
  multisplit: 1,
  fake: 1,
  cutoff: 1,
  "any-protocol": 1,
  fakedsplit: 1,
  hostfakesplit: 1,
  multidisorder: 1,
  syndata: 1,
} as const satisfies Record<TechniqueId, number>;

const OUTLAST_BONUS = 1;
const MULTI_SERVICE_BONUS = 1;
const COMBINATION_BONUS = 2;
const COMBINATION_PAIRS: ReadonlyArray<readonly [TechniqueId, TechniqueId]> = [
  ["faketls", "quic-fake"],
];

const RARITY_THRESHOLDS = {
  common: 14,
  rare: 15,
  epic: 19,
} as const;

const OUTLAST_SERVICE: ServiceType = "outlast-trials";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function has(techniques: readonly TechniqueId[], id: TechniqueId): boolean {
  return techniques.includes(id);
}

function countCombinations(techniques: readonly TechniqueId[]): number {
  return COMBINATION_PAIRS.filter(
    ([left, right]) => has(techniques, left) && has(techniques, right)
  ).length;
}

export function computeRarityScore(
  services: readonly ServiceType[],
  techniques: readonly TechniqueId[],
  hasOutlastSupport: boolean
): number {
  const fromTechniques = techniques.reduce(
    (total, technique) => total + TECHNIQUE_WEIGHTS[technique],
    0
  );

  const fromServices = services.includes(OUTLAST_SERVICE) ? OUTLAST_BONUS : 0;

  const fromMultiService = services.length >= 2 ? MULTI_SERVICE_BONUS : 0;
  const fromCombinations = countCombinations(techniques) * COMBINATION_BONUS;

  return (
    fromTechniques +
    fromServices +
    fromMultiService +
    fromCombinations +
    (hasOutlastSupport ? OUTLAST_BONUS : 0)
  );
}

export function computeRarity(score: number): Rarity {
  if (score >= RARITY_THRESHOLDS.epic + 1) {
    return "legendary";
  }

  if (score >= RARITY_THRESHOLDS.epic) {
    return "epic";
  }

  if (score >= RARITY_THRESHOLDS.rare) {
    return "rare";
  }

  return "common";
}

export function computeSpeed(techniques: readonly TechniqueId[]): number {
  let value = 50;

  if (has(techniques, "faketls")) {
    value += 15;
  }

  if (has(techniques, "quic-fake")) {
    value += 10;
  }

  if (has(techniques, "multisplit")) {
    value += 10;
  }

  if (has(techniques, "any-protocol")) {
    value += 10;
  }

  if (has(techniques, "cutoff")) {
    value += 5;
  }

  return clamp(value);
}

export function computeStability(
  techniques: readonly TechniqueId[],
  fileType: Strategy["fileType"]
): number {
  let value = 50;

  if (fileType === "zapret") {
    value += 20;
  } else if (fileType === "winws") {
    value += 10;
  }

  if (has(techniques, "ipset")) {
    value += 15;
  }

  value -= techniques.length * 4;

  return clamp(value);
}

export function computeCoverage(
  services: readonly ServiceType[],
  techniques: readonly TechniqueId[]
): number {
  let value = 20 + services.length * 15;

  if (has(techniques, "ipset")) {
    value += 20;
  }

  if (has(techniques, "l7-filter")) {
    value += 15;
  }

  if (has(techniques, "quic-fake")) {
    value += 10;
  }

  return clamp(value);
}

export function computeCardStats(strategy: Strategy): CardStats {
  return {
    speed: computeSpeed(strategy.techniques),
    stability: computeStability(strategy.techniques, strategy.fileType),
    coverage: computeCoverage(strategy.services, strategy.techniques),
  };
}

export function buildStrategyCard(
  strategy: Strategy,
  hasOutlastSupport: boolean
): StrategyCard {
  const score = computeRarityScore(
    strategy.services,
    strategy.techniques,
    hasOutlastSupport
  );

  return {
    strategy,
    score,
    rarity: computeRarity(score),
    stats: computeCardStats(strategy),
  };
}

export function summarizeCollection(
  cards: readonly StrategyCard[]
): CollectionSummary {
  const summary: CollectionSummary = {
    total: cards.length,
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
  };

  for (const card of cards) {
    summary[card.rarity] += 1;
  }

  return summary;
}

export const RARITY_ORDER = [
  "legendary",
  "epic",
  "rare",
  "common",
] as const satisfies readonly Rarity[];

const RARITY_LABEL_KEYS = {
  common: "rarity.common",
  rare: "rarity.rare",
  epic: "rarity.epic",
  legendary: "rarity.legendary",
} as const satisfies Record<Rarity, TranslationKey>;

export function getRarityLabel(rarity: Rarity): string {
  return translateKey(RARITY_LABEL_KEYS[rarity]);
}

export interface RarityPalette {
  border: string;
  glow: string;
  text: string;
  dot: string;
  solid: string;
}

export function getRarityColor(rarity: Rarity): RarityPalette {
  switch (rarity) {
    case "rare":
      return {
        border: "rgba(0, 180, 255, 0.5)",
        glow: "rgba(0, 180, 255, 0.28)",
        text: "text-sky-400",
        dot: "bg-sky-400",
        solid: "#38bdf8",
      };
    case "epic":
      return {
        border: "rgba(160, 80, 255, 0.6)",
        glow: "rgba(160, 80, 255, 0.32)",
        text: "text-purple-400",
        dot: "bg-purple-400",
        solid: "#c084fc",
      };
    case "legendary":
      return {
        border: "rgba(255, 200, 0, 0.8)",
        glow: "rgba(255, 200, 0, 0.32)",
        text: "text-accent-warning",
        dot: "bg-accent-warning",
        solid: "#fbbf24",
      };
    default:
      return {
        border: "rgba(255, 255, 255, 0.15)",
        glow: "rgba(255, 255, 255, 0.06)",
        text: "text-text-secondary",
        dot: "bg-white/40",
        solid: "#a1a1aa",
      };
  }
}
