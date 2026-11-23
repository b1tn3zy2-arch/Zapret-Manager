// Импортируем зависимости из модуля zustand.
import { create } from "zustand";
// Импортируем зависимости из модуля zustand/middleware.
import { persist } from "zustand/middleware";
// — разделитель логических блоков —

// Импортируем зависимости из модуля @/lib/strategyCommands.
import { getStrategyRatings } from "@/lib/strategyCommands";
// Импортируем зависимости из модуля @/types.
import type { StrategyRatingRecord } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: const STRATEGY_RATING_SCHEMA_VERSION = 1.
const STRATEGY_RATING_SCHEMA_VERSION = 1;
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyRatingsInput {
  // Обрабатываем конструкцию: strategies.
  strategies: { id: string; path: string }[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем интерфейс StrategyRatingState с контрактом данных.
interface StrategyRatingState {
  // Сохраняем пояснение разработчика: Ключ — strategyId.
  /* Ключ — strategyId. */
  // Обрабатываем конструкцию: records.
  records: Record<string, StrategyRatingRecord>;
  // Обрабатываем конструкцию: setRecords.
  setRecords: (records: StrategyRatingRecord[]) => void;
  // Обрабатываем конструкцию: setRecord.
  setRecord: (record: StrategyRatingRecord) => void;
  // Обрабатываем конструкцию: clear.
  clear: () => void;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export const useStrategyRatingStore = create<StrategyRatingState>()(
  // Обрабатываем конструкцию: persist.
  persist(
    // Объявляем функцию-обработчик или стрелочную функцию.
    (set) => ({
      // Обрабатываем конструкцию: records.
      records: {},
      // Обрабатываем конструкцию: setRecords.
      setRecords: (records) =>
        // Обрабатываем конструкцию: set.
        set((state) => {
          // Обрабатываем конструкцию: const next: Record<string, StrategyRatingRecord> = {}.
          const next: Record<string, StrategyRatingRecord> = {};
          // — разделитель логических блоков —

          // Перебираем элементы коллекции records.
          for (const record of records) {
            // Обрабатываем конструкцию: next.
            next[record.strategyId] = record;
            // Закрываем текущий блок.
          }
          // — разделитель логических блоков —

          // Возвращаем результат: { ...state, records: next }.
          return { ...state, records: next };
          // Закрываем текущий блок.
        }),
      // Обрабатываем конструкцию: setRecord.
      setRecord: (record) =>
        // Обрабатываем конструкцию: set.
        set((state) => ({
          // Обрабатываем конструкцию: records.
          records: { ...state.records, [record.strategyId]: record },
          // Закрываем текущий блок.
        })),
      // Обрабатываем конструкцию: clear.
      clear: () => set({ records: {} }),
      // Закрываем текущий блок.
    }),
    // Открываем объектный литерал.
    {
      // Обрабатываем конструкцию: name.
      name: "zapret-manager:strategy-ratings",
      // Обрабатываем конструкцию: version.
      version: STRATEGY_RATING_SCHEMA_VERSION,
      // Обрабатываем конструкцию: partialize.
      partialize: (state) => ({ records: state.records }),
      // Закрываем текущий блок.
    }
    // Закрываем выражение или список аргументов.
  )
  // Закрываем выражение или список аргументов.
);
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Подтягивает сохранённые замеры для списка стратегий.
 * Подтягивает сохранённые замеры для списка стратегий.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Вызывается после сканирования: карточки сразу показывают «…
 * Вызывается после сканирования: карточки сразу показывают «нет
 // Сохраняем пояснение разработчика: * данных» или последнюю сохранённую оценку, не дожидаясь нов…
 * данных» или последнюю сохранённую оценку, не дожидаясь нового
 // Сохраняем пояснение разработчика: * запуска.
 * запуска.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function loadStrategyRatings(
  // Обрабатываем конструкцию: strategies.
  strategies: StrategyRatingsInput["strategies"]
  // Закрываем выражение или список аргументов.
): Promise<void> {
  // Проверяем бизнес-условие: strategies.length === 0.
  if (strategies.length === 0) {
    // Обрабатываем конструкцию: useStrategyRatingStore.
    useStrategyRatingStore.getState().clear();
    // — разделитель логических блоков —

    // Завершаем функцию без возвращаемого значения.
    return;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const records = await getStrategyRatings(strategies).
    const records = await getStrategyRatings(strategies);
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useStrategyRatingStore.
    useStrategyRatingStore.getState().setRecords(records);
    // Закрываем текущий блок.
  } catch {
    // Сохраняем пояснение разработчика: // Ошибка замеров не блокирует список: карточки показывают «…
    // Ошибка замеров не блокирует список: карточки показывают «нет
    // Сохраняем пояснение разработчика: // данных».
    // данных».
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
