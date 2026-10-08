import type { Strategy, TechniqueId } from "@/types";

export type Rarity = "common" | "rare" | "epic" | "legendary";

export type ViewMode = "cards" | "list";

export type SortMode = "rarity-desc" | "rarity-asc" | "name" | "date";

export interface CardStats {
  speed: number;
  stability: number;
  coverage: number;
}

export interface StrategyCard {
  strategy: Strategy;
  rarity: Rarity;
  score: number;
  stats: CardStats;
}

export interface CollectionSummary {
  total: number;
  common: number;
  rare: number;
  epic: number;
  legendary: number;
}

export type GameTechnique = TechniqueId;

export const RARITY_STARS = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
} as const satisfies Record<Rarity, number>;
