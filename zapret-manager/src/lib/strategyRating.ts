// Импортируем зависимости из модуля @/lib/strategyCommands.
import { measureStrategyRating } from "@/lib/strategyCommands";
// Импортируем зависимости из модуля @/stores/useStrategyRatingStore.
import { useStrategyRatingStore } from "@/stores/useStrategyRatingStore";
// Импортируем зависимости из модуля @/stores/useStrategiesStore.
import { useStrategiesStore } from "@/stores/useStrategiesStore";
// Импортируем зависимости из модуля @/types.
import type { StrategyRatingRecord } from "@/types";
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Замеряет сервисы запущенной стратегии и обновляет кеш рейт…
 * Замеряет сервисы запущенной стратегии и обновляет кеш рейтинга.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Функция вызывается после успешного запуска. Она не бросает
 * Функция вызывается после успешного запуска. Она не бросает
 // Сохраняем пояснение разработчика: * ошибку наружу: замер — вспомогательная фоновая задача, сбо…
 * ошибку наружу: замер — вспомогательная фоновая задача, сбои сети
 // Сохраняем пояснение разработчика: * вместо цифры приводят к «нет данных» на карточке, а не к
 * вместо цифры приводят к «нет данных» на карточке, а не к
 // Сохраняем пояснение разработчика: * краш-уведомлению.
 * краш-уведомлению.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function measureStrategyAfterStart(
  // Обрабатываем конструкцию: strategyId.
  strategyId: string,
  // Обрабатываем конструкцию: strategyPath.
  strategyPath: string
  // Закрываем выражение или список аргументов.
): Promise<StrategyRatingRecord | null> {
  // Обрабатываем конструкцию: const services = useStrategiesStore .getState() .strate….
  const services =
    // Обрабатываем конструкцию: useStrategiesStore.
    useStrategiesStore
      // Продолжаем цепочку вызовов.
      .getState()
      // Продолжаем цепочку вызовов.
      .strategies.find((strategy) => strategy.id === strategyId)?.services ??
    // Открываем массив.
    [];
  // — разделитель логических блоков —

  // Пробуем выполнить блок с обработкой ошибок.
  try {
    // Обрабатываем конструкцию: const record = await measureStrategyRating({ strategyId….
    const record = await measureStrategyRating({
      // Передаём поле strategyId в объект.
      strategyId,
      // Передаём поле strategyPath в объект.
      strategyPath,
      // Обрабатываем конструкцию: services.
      services: [...services],
      // Закрываем текущий блок.
    });
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: useStrategyRatingStore.
    useStrategyRatingStore.getState().setRecord(record);
    // — разделитель логических блоков —

    // Возвращаем результат: record.
    return record;
    // Закрываем текущий блок.
  } catch {
    // Возвращаем результат: null.
    return null;
    // Закрываем текущий блок.
  }
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
