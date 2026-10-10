import { useMemo } from "react";

import {
  RARITY_ORDER,
  buildStrategyCard,
  summarizeCollection,
} from "@/lib/rarity";
import { useAppStore } from "@/stores/useAppStore";
import {
  selectStrategies,
  useStrategiesStore,
} from "@/stores/useStrategiesStore";
import {
  selectHasEnabledGame,
  useSettingsStore,
} from "@/stores/useSettingsStore";
import type { CollectionSummary, SortMode, StrategyCard } from "@/types";

function useStrategyCards(): StrategyCard[] {
  const strategies = useStrategiesStore(selectStrategies);
  const hasEnabledGame = useSettingsStore(selectHasEnabledGame);

  return useMemo(
    () =>
      strategies.map((strategy) => buildStrategyCard(strategy, hasEnabledGame)),
    [strategies, hasEnabledGame]
  );
}

function rarityRank(rarity: StrategyCard["rarity"]): number {
  return RARITY_ORDER.indexOf(rarity);
}

function compareBy(a: StrategyCard, b: StrategyCard, mode: SortMode): number {
  const byName = a.strategy.name.localeCompare(b.strategy.name);

  switch (mode) {
    case "name":
      return a.strategy.name.localeCompare(b.strategy.name, "ru");
    case "date": {
      return (b.strategy.modifiedAt ?? 0) - (a.strategy.modifiedAt ?? 0);
    }
    case "rarity-asc": {
      return (
        rarityRank(b.rarity) - rarityRank(a.rarity) ||
        b.score - a.score ||
        byName
      );
    }
    default: {
      return (
        rarityRank(a.rarity) - rarityRank(b.rarity) ||
        b.score - a.score ||
        byName
      );
    }
  }
}

export function useFilteredCards(search: string): StrategyCard[] {
  const cards = useStrategyCards();
  const sortMode = useAppStore((state) => state.strategiesSortMode);
  const rarityFilter = useAppStore((state) => state.strategiesRarityFilter);
  const serviceFilter = useAppStore((state) => state.strategiesServiceFilter);

  return useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = cards.filter((card) => {
      if (rarityFilter.length > 0 && !rarityFilter.includes(card.rarity)) {
        return false;
      }

      if (serviceFilter.length > 0) {
        const matches = card.strategy.services.some((service) =>
          serviceFilter.includes(service)
        );

        if (!matches) {
          return false;
        }
      }

      if (query === "") {
        return true;
      }

      return (
        card.strategy.name.toLowerCase().includes(query) ||
        card.strategy.filename.toLowerCase().includes(query)
      );
    });

    return [...filtered].sort((left, right) =>
      compareBy(left, right, sortMode)
    );
  }, [cards, rarityFilter, search, serviceFilter, sortMode]);
}

export function useCollectionStats(): CollectionSummary {
  const cards = useStrategyCards();

  return useMemo(() => summarizeCollection(cards), [cards]);
}
