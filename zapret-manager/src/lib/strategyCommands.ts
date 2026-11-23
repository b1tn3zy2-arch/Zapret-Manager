// Импортируем зависимости из модуля @/types/ipcSchemas.
import {
  // Подключаем именованный импорт StrategyRatingRecordSchema.
  StrategyRatingRecordSchema,
  // Подключаем именованный импорт StrategyRatingRecordArraySchema.
  StrategyRatingRecordArraySchema,
  // Закрываем текущий блок.
} from "@/types/ipcSchemas";
// Импортируем зависимости из модуля @/lib/secureInvoke.
import { secureInvoke, secureInvokeValidated } from "@/lib/secureInvoke";
// Импортируем зависимости из модуля @/types.
import type { StrategyRatingRecord } from "@/types";
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyRatingInput {
  // Обрабатываем конструкцию: strategyId.
  strategyId: string;
  // Обрабатываем конструкцию: strategyPath.
  strategyPath: string;
  // Обрабатываем конструкцию: services.
  services: string[];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export interface StrategyRatingTarget {
  // Обрабатываем конструкцию: id.
  id: string;
  // Обрабатываем конструкцию: path.
  path: string;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Замеряет сервисы стратегии и возвращает свежую запись.
 * Замеряет сервисы стратегии и возвращает свежую запись.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Rust выполняет HTTPS-проверки сам: фронтенд не подставляет…
 * Rust выполняет HTTPS-проверки сам: фронтенд не подставляет свои
 // Сохраняем пояснение разработчика: * адреса и не придумывает цифры. Замер нужно звать после ста…
 * адреса и не придумывает цифры. Замер нужно звать после старта
 // Сохраняем пояснение разработчика: * стратегии, в фоне — UI не ждёт его.
 * стратегии, в фоне — UI не ждёт его.
 // Сохраняем пояснение разработчика: 
 */
// Обрабатываем конструкцию: export.
export async function measureStrategyRating(
  // Обрабатываем конструкцию: input.
  input: StrategyRatingInput
  // Закрываем выражение или список аргументов.
): Promise<StrategyRatingRecord> {
  // Возвращаем результат: secureInvokeValidated( measure_strategy_rating, Strateg….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: measure_strategy_rating.
    "measure_strategy_rating",
    // Обрабатываем конструкцию: StrategyRatingRecordSchema.
    StrategyRatingRecordSchema,
    // Открываем объектный литерал.
    { input }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function getStrategyRatings(
  // Обрабатываем конструкцию: strategies.
  strategies: StrategyRatingTarget[]
  // Закрываем выражение или список аргументов.
): Promise<StrategyRatingRecord[]> {
  // Возвращаем результат: secureInvokeValidated( get_strategy_ratings, StrategyRa….
  return secureInvokeValidated(
    // Обрабатываем конструкцию: get_strategy_ratings.
    "get_strategy_ratings",
    // Обрабатываем конструкцию: StrategyRatingRecordArraySchema.
    StrategyRatingRecordArraySchema,
    // Открываем объектный литерал.
    { strategies }
    // Закрываем выражение или список аргументов.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export async function resetStrategyRatings(): Promise<boolean> {
  // Возвращаем результат: secureInvoke<boolean>(reset_strategy_ratings).
  return secureInvoke<boolean>("reset_strategy_ratings");
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
