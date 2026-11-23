// Импортируем зависимости из модуля react.
import { useMemo } from "react";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/strategyStats.
import { buildStrategyCard } from "@/lib/strategyStats";
// Импортируем зависимости из модуля @/stores/useAppStore.
import { useAppStore } from "@/stores/useAppStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import {
  // Подключаем именованный импорт selectStrategies.
  selectStrategies,
  // Подключаем именованный импорт useStrategiesStore.
  useStrategiesStore,
  // Закрываем текущий блок.
} from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/types.
import type {
  // Подключаем именованный импорт CollectionSummary.
  CollectionSummary,
  // Подключаем именованный импорт SortMode.
  SortMode,
  // Подключаем именованный импорт StrategyCard.
  StrategyCard,
  // Подключаем именованный импорт StrategyRatingRecord.
  StrategyRatingRecord,
  // Закрываем текущий блок.
} from "@/types";
// — разделитель логических блоков —

// Объявляем функцию useStrategyCards.
function useStrategyCards(): StrategyCard[] {
  // Обрабатываем конструкцию: const strategies = useStrategiesStore(selectStrategies).
  const strategies = useStrategiesStore(selectStrategies);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => strategies.map(buildStrategyCard), [strat….
  return useMemo(() => strategies.map(buildStrategyCard), [strategies]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию compareBy.
function compareBy(a: StrategyCard, b: StrategyCard, mode: SortMode): number {
  // Обрабатываем конструкцию: const byName = a.strategy.name.localeCompare(b.strategy….
  const byName = a.strategy.name.localeCompare(b.strategy.name, "ru");
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mode === name.
  if (mode === "name") {
    // Возвращаем результат: byName.
    return byName;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: mode === date.
  if (mode === "date") {
    // Возвращаем результат: ( (b.strategy.modifiedAt ?? 0) - (a.strategy.modifiedAt….
    return (
      // Обрабатываем конструкцию: (b.strategy.modifiedAt ?? 0).
      (b.strategy.modifiedAt ?? 0) - (a.strategy.modifiedAt ?? 0) || byName
      // Закрываем выражение или список аргументов.
    );
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: byName.
  return byName;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Сортировка по рейтингу: замеренные стратегии идут первыми …
 * Сортировка по рейтингу: замеренные стратегии идут первыми по score,
 // Сохраняем пояснение разработчика: * затем стратегии без замеров в порядке имени.
 * затем стратегии без замеров в порядке имени.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию compareByRating.
function compareByRating(
  // Обрабатываем конструкцию: ratings.
  ratings: Record<string, StrategyRatingRecord>,
  // Обрабатываем конструкцию: a.
  a: StrategyCard,
  // Обрабатываем конструкцию: b.
  b: StrategyCard
  // Закрываем выражение или список аргументов.
): number {
  // Обрабатываем конструкцию: const left = ratings[a.strategy.id]?.ratingScore ?? nul….
  const left = ratings[a.strategy.id]?.ratingScore ?? null;
  // Обрабатываем конструкцию: const right = ratings[b.strategy.id]?.ratingScore ?? nu….
  const right = ratings[b.strategy.id]?.ratingScore ?? null;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: left !== null && right === null.
  if (left !== null && right === null) {
    // Возвращаем результат: -1.
    return -1;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: left === null && right !== null.
  if (left === null && right !== null) {
    // Возвращаем результат: 1.
    return 1;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: left !== null && right !== null.
  if (left !== null && right !== null) {
    // Возвращаем результат: right - left || a.strategy.name.localeCompare(b.strateg….
    return right - left || a.strategy.name.localeCompare(b.strategy.name, "ru");
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: a.strategy.name.localeCompare(b.strategy.name, ru).
  return a.strategy.name.localeCompare(b.strategy.name, "ru");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useFilteredCards(search: string): StrategyCard[] {
  // Обрабатываем конструкцию: const cards = useStrategyCards().
  const cards = useStrategyCards();
  // Обрабатываем конструкцию: const ratings = useStrategyRatingStore((state) => state….
  const ratings = useStrategyRatingStore((state) => state.records);
  // Обрабатываем конструкцию: const sortMode = useAppStore((state) => state.strategie….
  const sortMode = useAppStore((state) => state.strategiesSortMode);
  // Обрабатываем конструкцию: const ratingFilter = useAppStore((state) => state.strat….
  const ratingFilter = useAppStore((state) => state.strategiesRatingFilter);
  // Обрабатываем конструкцию: const serviceFilter = useAppStore((state) => state.stra….
  const serviceFilter = useAppStore((state) => state.strategiesServiceFilter);
  // Обрабатываем конструкцию: const removedStrategyIds = useAppStore((state) => state….
  const removedStrategyIds = useAppStore((state) => state.removedStrategyIds);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { const query = search.trim().toLowerCase….
  return useMemo(() => {
    // Обрабатываем конструкцию: const query = search.trim().toLowerCase().
    const query = search.trim().toLowerCase();
    // Обрабатываем конструкцию: const removed = new Set(removedStrategyIds).
    const removed = new Set(removedStrategyIds);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: const filtered = cards.filter((card) => { if (removed.h….
    const filtered = cards.filter((card) => {
      // Проверяем бизнес-условие: removed.has(card.strategy.id).
      if (removed.has(card.strategy.id)) {
        // Возвращаем результат: false.
        return false;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: ratingFilter !== all.
      if (ratingFilter !== "all") {
        // Обрабатываем конструкцию: const hasSamples = (ratings[card.strategy.id]?.samples ….
        const hasSamples = (ratings[card.strategy.id]?.samples ?? 0) > 0;
        // Обрабатываем конструкцию: const matches = ratingFilter === measured ? hasSamples ….
        const matches = ratingFilter === "measured" ? hasSamples : !hasSamples;
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: !matches.
        if (!matches) {
          // Возвращаем результат: false.
          return false;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: serviceFilter.length > 0.
      if (serviceFilter.length > 0) {
        // Обрабатываем конструкцию: const matches = card.strategy.services.some((service) =….
        const matches = card.strategy.services.some(
          // Продолжаем предыдущую конструкцию.
          (service) =>
            // Обрабатываем конструкцию: serviceFilter.
            serviceFilter.includes(service)
          // Закрываем выражение или список аргументов.
        );
        // — разделитель логических блоков —

        // Проверяем бизнес-условие: !matches.
        if (!matches) {
          // Возвращаем результат: false.
          return false;
          // Закрываем текущий блок.
        }
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: query ===.
      if (query === "") {
        // Возвращаем результат: true.
        return true;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: ( card.strategy.name.toLowerCase().includes(query) || c….
      return (
        // Обрабатываем конструкцию: card.
        card.strategy.name.toLowerCase().includes(query) ||
        // Обрабатываем конструкцию: card.
        card.strategy.filename.toLowerCase().includes(query)
        // Закрываем выражение или список аргументов.
      );
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Возвращаем результат: [...filtered].sort((left, right) => { if (sortMode === ….
    return [...filtered].sort((left, right) => {
      // Проверяем бизнес-условие: sortMode === date.
      if (sortMode === "date") {
        // Возвращаем результат: compareBy(left, right, date).
        return compareBy(left, right, "date");
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: sortMode === name.
      if (sortMode === "name") {
        // Возвращаем результат: compareBy(left, right, name).
        return compareBy(left, right, "name");
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Возвращаем результат: compareByRating(ratings, left, right).
      return compareByRating(ratings, left, right);
      // Закрываем текущий блок.
    });
    // Закрываем текущий блок.
  }, [
    // Обрабатываем конструкцию: cards.
    cards,
    // Обрабатываем конструкцию: removedStrategyIds.
    removedStrategyIds,
    // Обрабатываем конструкцию: ratingFilter.
    ratingFilter,
    // Обрабатываем конструкцию: ratings.
    ratings,
    // Обрабатываем конструкцию: search.
    search,
    // Обрабатываем конструкцию: serviceFilter.
    serviceFilter,
    // Обрабатываем конструкцию: sortMode.
    sortMode,
    // Закрываем массив или список.
  ]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function useCollectionStats(): CollectionSummary {
  // Обрабатываем конструкцию: const cards = useStrategyCards().
  const cards = useStrategyCards();
  // Обрабатываем конструкцию: const ratings = useStrategyRatingStore((state) => state….
  const ratings = useStrategyRatingStore((state) => state.records);
  // — разделитель логических блоков —

  // Возвращаем результат: useMemo(() => { const summary: CollectionSummary = { to….
  return useMemo(() => {
    // Обрабатываем конструкцию: const summary: CollectionSummary = { total: cards.lengt….
    const summary: CollectionSummary = {
      // Обрабатываем конструкцию: total.
      total: cards.length,
      // Обрабатываем конструкцию: measured.
      measured: 0,
      // Обрабатываем конструкцию: unmeasured.
      unmeasured: 0,
      // Закрываем текущий блок.
    };
    // — разделитель логических блоков —

    // Перебираем элементы коллекции cards.
    for (const card of cards) {
      // Обрабатываем конструкцию: const measured = (ratings[card.strategy.id]?.samples ??….
      const measured = (ratings[card.strategy.id]?.samples ?? 0) > 0;
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: summary.
      summary.measured += measured ? 1 : 0;
      // Обрабатываем конструкцию: summary.
      summary.unmeasured += measured ? 0 : 1;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Возвращаем результат: summary.
    return summary;
    // Закрываем текущий блок.
  }, [cards, ratings]);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
