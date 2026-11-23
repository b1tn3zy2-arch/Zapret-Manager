// Импортируем зависимости из модуля @/types.
import type { CardStats, StrategyCard } from "@/types";
// Импортируем зависимости из модуля @/types.
import type { ServiceType, Strategy, TechniqueId } from "@/types";
// — разделитель логических блоков —

// Объявляем функцию clamp.
function clamp(value: number): number {
  // Возвращаем результат: Math.max(0, Math.min(100, Math.round(value))).
  return Math.max(0, Math.min(100, Math.round(value)));
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию has.
function has<T extends string>(techniques: readonly T[], id: T): boolean {
  // Возвращаем результат: techniques.includes(id).
  return techniques.includes(id);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Статичная оценка карточки по её техникам.
 * Статичная оценка карточки по её техникам.
 // Сохраняем пояснение разработчика: *
 *
 // Сохраняем пояснение разработчика: * Это не рейтинг обхода: он ничего не знает о сети или прова…
 * Это не рейтинг обхода: он ничего не знает о сети или провайдере и
 // Сохраняем пояснение разработчика: * считается только из содержимого .bat. Реальный замер лежит…
 * считается только из содержимого `.bat`. Реальный замер лежит в
 // Сохраняем пояснение разработчика: * useStrategyRatingStore и рисуется отдельным бейджем.
 * `useStrategyRatingStore` и рисуется отдельным бейджем.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию computeSpeed.
function computeSpeed(techniques: readonly TechniqueId[]): number {
  // Обрабатываем конструкцию: let value = 50.
  let value = 50;
  // Проверяем бизнес-условие: has(techniques, faketls).
  if (has(techniques, "faketls")) {
    // Обрабатываем конструкцию: value.
    value += 15;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, quic-fake).
  if (has(techniques, "quic-fake")) {
    // Обрабатываем конструкцию: value.
    value += 10;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, multisplit).
  if (has(techniques, "multisplit")) {
    // Обрабатываем конструкцию: value.
    value += 10;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, any-protocol).
  if (has(techniques, "any-protocol")) {
    // Обрабатываем конструкцию: value.
    value += 10;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, cutoff).
  if (has(techniques, "cutoff")) {
    // Обрабатываем конструкцию: value.
    value += 5;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: clamp(value).
  return clamp(value);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию computeStability.
function computeStability(
  // Обрабатываем конструкцию: techniques.
  techniques: readonly TechniqueId[],
  // Обрабатываем конструкцию: fileType.
  fileType: Strategy["fileType"]
  // Закрываем выражение или список аргументов.
): number {
  // Обрабатываем конструкцию: let value = 50.
  let value = 50;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: fileType === zapret.
  if (fileType === "zapret") {
    // Обрабатываем конструкцию: value.
    value += 20;
    // Закрываем текущий блок.
  } else if (fileType === "winws") {
    // Обрабатываем конструкцию: value.
    value += 10;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, ipset).
  if (has(techniques, "ipset")) {
    // Обрабатываем конструкцию: value.
    value += 15;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Обрабатываем конструкцию: value.
  value -= techniques.length * 4;
  // — разделитель логических блоков —

  // Возвращаем результат: clamp(value).
  return clamp(value);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию computeCoverage.
function computeCoverage(
  // Обрабатываем конструкцию: services.
  services: readonly ServiceType[],
  // Обрабатываем конструкцию: techniques.
  techniques: readonly TechniqueId[]
  // Закрываем выражение или список аргументов.
): number {
  // Обрабатываем конструкцию: let value = 20 + services.length * 15.
  let value = 20 + services.length * 15;
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, ipset).
  if (has(techniques, "ipset")) {
    // Обрабатываем конструкцию: value.
    value += 20;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, l7-filter).
  if (has(techniques, "l7-filter")) {
    // Обрабатываем конструкцию: value.
    value += 15;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Проверяем бизнес-условие: has(techniques, quic-fake).
  if (has(techniques, "quic-fake")) {
    // Обрабатываем конструкцию: value.
    value += 10;
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: clamp(value).
  return clamp(value);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Объявляем функцию computeCardStats.
function computeCardStats(strategy: Strategy): CardStats {
  // Возвращаем результат: { speed: computeSpeed(strategy.techniques), stability: ….
  return {
    // Обрабатываем конструкцию: speed.
    speed: computeSpeed(strategy.techniques),
    // Обрабатываем конструкцию: stability.
    stability: computeStability(strategy.techniques, strategy.fileType),
    // Обрабатываем конструкцию: coverage.
    coverage: computeCoverage(strategy.services, strategy.techniques),
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildStrategyCard(strategy: Strategy): StrategyCard {
  // Возвращаем результат: { strategy, stats: computeCardStats(strategy), }.
  return {
    // Передаём поле strategy в объект.
    strategy,
    // Обрабатываем конструкцию: stats.
    stats: computeCardStats(strategy),
    // Закрываем текущий блок.
  };
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
