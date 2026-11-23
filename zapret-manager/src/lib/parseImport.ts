// Импортируем зависимости из модуля @/lib/validators.
import {
  // Подключаем именованный импорт isValidDomain.
  isValidDomain,
  // Подключаем именованный импорт isValidIpRange.
  isValidIpRange,
  // Подключаем именованный импорт isValidPort.
  isValidPort,
  // Подключаем именованный импорт normalizeDomain.
  normalizeDomain,
  // Закрываем текущий блок.
} from "@/lib/validators";
// — разделитель логических блоков —

// Объявляем функцию significantLines.
function significantLines(text: string): string[] {
  // Возвращаем результат: text .split(/\r?\n/) .map((line) => line.trim()) .filte….
  return (
    // Продолжаем предыдущую конструкцию.
    text
      // Продолжаем цепочку вызовов.
      .split(/\r?\n/)
      // Продолжаем цепочку вызовов.
      .map((line) => line.trim())
      // Продолжаем цепочку вызовов.
      .filter(
        // Объявляем функцию-обработчик или стрелочную функцию.
        (line) => line !== "" && !line.startsWith("#") && !line.startsWith(";")
        // Закрываем выражение или список аргументов.
      )
    // Продолжаем предыдущую конструкцию.
  );
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function parseDomainsFromText(text: string): string[] {
  // Обрабатываем конструкцию: const found: string[] = [].
  const found: string[] = [];
  // Обрабатываем конструкцию: const seen = new Set<string>().
  const seen = new Set<string>();
  // — разделитель логических блоков —

  // Перебираем элементы коллекции significantLines(text).
  for (const line of significantLines(text)) {
    // Обрабатываем конструкцию: const normalized = normalizeDomain(line).
    const normalized = normalizeDomain(line);
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !isValidDomain(normalized) || seen.has(normalized).
    if (!isValidDomain(normalized) || seen.has(normalized)) {
      // Переходим к следующей итерации цикла.
      continue;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: seen.
    seen.add(normalized);
    // Обрабатываем конструкцию: found.
    found.push(normalized);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: found.
  return found;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function parseIpsFromText(text: string): string[] {
  // Обрабатываем конструкцию: const found: string[] = [].
  const found: string[] = [];
  // Обрабатываем конструкцию: const seen = new Set<string>().
  const seen = new Set<string>();
  // — разделитель логических блоков —

  // Перебираем элементы коллекции significantLines(text).
  for (const line of significantLines(text)) {
    // Обрабатываем конструкцию: const normalized = line.toLowerCase().
    const normalized = line.toLowerCase();
    // — разделитель логических блоков —

    // Проверяем бизнес-условие: !isValidIpRange(normalized) || seen.has(normalized).
    if (!isValidIpRange(normalized) || seen.has(normalized)) {
      // Переходим к следующей итерации цикла.
      continue;
      // Закрываем текущий блок.
    }
    // — разделитель логических блоков —

    // Обрабатываем конструкцию: seen.
    seen.add(normalized);
    // Обрабатываем конструкцию: found.
    found.push(normalized);
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: found.
  return found;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function parsePortsFromText(text: string): number[] {
  // Обрабатываем конструкцию: const found: number[] = [].
  const found: number[] = [];
  // Обрабатываем конструкцию: const seen = new Set<number>().
  const seen = new Set<number>();
  // — разделитель логических блоков —

  // Перебираем элементы коллекции significantLines(text).
  for (const line of significantLines(text)) {
    // Перебираем элементы коллекции line.split(/[,\s]+/).
    for (const chunk of line.split(/[,\s]+/)) {
      // Обрабатываем конструкцию: const value = Number(chunk).
      const value = Number(chunk);
      // — разделитель логических блоков —

      // Проверяем бизнес-условие: !isValidPort(value) || seen.has(value).
      if (!isValidPort(value) || seen.has(value)) {
        // Переходим к следующей итерации цикла.
        continue;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: seen.
      seen.add(value);
      // Обрабатываем конструкцию: found.
      found.push(value);
      // Закрываем текущий блок.
    }
    // Закрываем текущий блок.
  }
  // — разделитель логических блоков —

  // Возвращаем результат: found.
  return found;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Сохраняем пояснение разработчика:
/**
 // Сохраняем пояснение разработчика: * Слияние без повторов: порядок сохраняется, уже имеющиеся з…
 * Слияние без повторов: порядок сохраняется, уже имеющиеся значения
 // Сохраняем пояснение разработчика: * не трогаются. Одна реализация на строки и числа — раньше з…
 * не трогаются. Одна реализация на строки и числа — раньше здесь
 // Сохраняем пояснение разработчика: * лежали две копии одной и той же логики.
 * лежали две копии одной и той же логики.
 // Сохраняем пояснение разработчика: 
 */
// Объявляем функцию mergeUniqueValues.
function mergeUniqueValues<T>(existing: T[], incoming: T[]): T[] {
  // Обрабатываем конструкцию: const seen = new Set(existing).
  const seen = new Set(existing);
  // — разделитель логических блоков —

  // Возвращаем результат: [ ...existing, ...incoming.filter((item) => { if (seen.….
  return [
    // Разворачиваем ...existing в коллекцию.
    ...existing,
    // Разворачиваем ...incoming.filter((item) => { if (seen.has(i… в коллекцию.
    ...incoming.filter((item) => {
      // Проверяем бизнес-условие: seen.has(item).
      if (seen.has(item)) {
        // Возвращаем результат: false.
        return false;
        // Закрываем текущий блок.
      }
      // — разделитель логических блоков —

      // Обрабатываем конструкцию: seen.
      seen.add(item);
      // Возвращаем результат: true.
      return true;
      // Закрываем текущий блок.
    }),
    // Закрываем массив или список.
  ];
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function mergeUnique(existing: string[], incoming: string[]): string[] {
  // Возвращаем результат: mergeUniqueValues(existing, incoming).
  return mergeUniqueValues(existing, incoming);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function buildTextFile(items: string[]): string {
  // Обрабатываем конструкцию: const cleaned = items .map((item) => item.trim()) .filt….
  const cleaned = items
    // Продолжаем цепочку вызовов.
    .map((item) => item.trim())
    // Продолжаем цепочку вызовов.
    .filter((item) => item !== "");
  // — разделитель логических блоков —

  // Возвращаем результат: cleaned.length === 0 ? : ${cleaned.join(\n)}\n.
  return cleaned.length === 0 ? "" : `${cleaned.join("\n")}\n`;
  // Закрываем текущий блок.
}
// — разделитель логических блоков —

// Обрабатываем конструкцию: export.
export function mergeUniqueNumbers(
  // Обрабатываем конструкцию: existing.
  existing: number[],
  // Обрабатываем конструкцию: incoming.
  incoming: number[]
  // Закрываем выражение или список аргументов.
): number[] {
  // Возвращаем результат: mergeUniqueValues(existing, incoming).
  return mergeUniqueValues(existing, incoming);
  // Закрываем текущий блок.
}
// — разделитель логических блоков —
